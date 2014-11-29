var SINGLE_FEED_URL = 'https://www.googleapis.com/calendar/v3/calendars/CAL_ID/events';
var CALENDAR_LIST_URL = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';
var FEED_URL_SUFFIX = '?singleEvents=true&orderBy=startTime';
var REQUEST_TIMEOUT_MIN = 1; // one minute is the shortest period in chrome.alarms
var CLIENT_ID = "xxx"
var DEFAULT_SD_URL = "https://www.google.com/calendar/render"
var cachedToken;
var tokenExpiryDate;

function buildFeedURL(calendar) {
	var url = SINGLE_FEED_URL.replace("CAL_ID", calendar.id) + FEED_URL_SUFFIX;
	url += '&maxResults=' + getValue("max_entries");
	var date = new Date();
	if (getValue("show_past_events") === 'true') {
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
	}
	url += '&timeMin=' + encodeURIComponent(date.toISOString());
	if (getValue("time_zone") !== 'auto') {
		url += '&timeZone=' + getValue("time_zone");
	}
	debugMessage('URL: ' + url);
	return url;
}
	
function refreshFeeds() {
	debugMessage("update feeds: " + getValue("calendar_type"));
	chrome.runtime.sendMessage({ status : 'refresh_start' });
	refreshCalendars(fetchAllEntries);
}

function refreshCalendars(callback) {
	debugMessage('Refreshing calendar list');
	getFeed(CALENDAR_LIST_URL, function (data) {
		parseCalendars(data);
		callback();
	});
}


function handleMultiFeeds(data) {
	var feedEntries = parseEntries(data);
	for (var i = 0; i < feedEntries.length; i++) {
		 newEntries.push(feedEntries[i]);
	}
	var allSynced = true;
	var numCalendars = 0;
	var numSync = 0;
	for (id in calendars) {
		if (calendars[id].shouldSync) {
			numCalendars++;
			if (!calendars[id].synced) {
				allSynced = false;
			}
			else {
				numSync++;
			}
		}
	}
	debugMessage('Synced: ' + numSync + '/' + numCalendars);
	if (allSynced) {
		if (numCalendars > 1 &&  newEntries.length > 1) {
			 newEntries =  newEntries.sort(function (a, b) {
				if (a.start.realDate > b.start.realDate) return 1;
				if (a.start.realDate < b.start.realDate) return  -1;
				return 0;
			}
			);
		}
		entries =  newEntries;
		drawEntries();
		chrome.runtime.sendMessage({status : 'refresh_end'});
	}
}

function fetchAllEntries() {
	newEntries = [];
	var numToSync = 0;
	for (id in calendars) {
		calendars[id].synced = false;
		if (calendars[id].shouldSync) {
			numToSync++;
			debugMessage("GET calendar " + id + " => " + calendars[id].url);
			getFeed(buildFeedURL(calendars[id]), handleMultiFeeds);
		}
	}
	if (numToSync === 0) {
		entries = newEntries;
		drawEntries();
		chrome.runtime.sendMessage({ status : 'refresh_end' });
	}
}


function getFeed(feedUrl, callback) {
	withAuthTokenDo(function() {
		$.ajax(feedUrl, {
	      	headers: {
	        	'Authorization': 'Bearer ' + cachedToken
	      	},
	      	success: function(data) { 
	      		debugMessage("Feed received from " + feedUrl);
	      		// a hack to see which calendar is sending data
	      		data.url = this.url;
	      		callback(data)
	      	},
	      	error: function(response) {
		        _gaq.push(['_trackEvent', 'Update', 'Feed Error', response.statusText]);
		        debugMessage('Failed to retrieve feed: '+ response.statusText);
		        if (response.status === 401) {
		        	chrome.runtime.sendMessage({ status : 'auth_required' });
		        }
		        chrome.runtime.sendMessage({ status : 'refresh_end' });
		    }

	  	});
	});

}


function parseEntries(data) {
	debugMessage("Received: " + data.summary);
	var calID = extractID(data.url);
	var color = getValue("font_color");
	if (!(calID in calendars)) {
		// should never happen
		return {}
	}

	var calendar = calendars[calID];
	if (calendar.synced) {
		return {};
	}
	color = calendar.color;
	calendar.synced = true;
	try {
		var feedEntries = [];
		for (var i = 0; i < data.items.length; i++) {
			var entry = data.items[i];
			entry.color = color;
			entry.calendar = calID;
			//non-full day entries have 'dateTime'
			entry.fullday = 'date' in entry.start; 
			// TODO review the logic and maybe use momentjs
			if (entry.fullday) {
				var tokens = entry.start.date.split('-');
				entry.start.realDate = new Date(tokens[0], parseInt(tokens[1])-1, tokens[2]);
				tokens = entry.end.date.split('-');
				entry.end.realDate = new Date(tokens[0], parseInt(tokens[1])-1, tokens[2]);
			} else {
				if(getValue("time_zone") === 'auto') {
					entry.start.realDate = new Date(entry.start.dateTime);
					entry.end.realDate = new Date(entry.end.dateTime);
				} else {
					entry.start.realDate = dateFromString(entry.start.dateTime);
					entry.end.realDate = dateFromString(entry.end.dateTime);
				}
			}
			feedEntries.push(entry);
		}
		debugMessage('Parsed ' + feedEntries.length + ' entries');
		return feedEntries;
	} catch (err) {
		debugMessage('Error parsing entries: ' + err);
		return {};
	}
}


function parseCalendars(data) {
	debugMessage('parsing calendars ' + data.items.length);
	var calendarsToUse = getValue('calendar_type');
	if (calendarsToUse === 'selected') {
		var selectedCalendars = JSON.parse(getValue('selected_calendars'));
	}
  
	var newCalendars = {};
	for (var i = 0; i < data.items.length; i++)  {
        var cal = data.items[i];
        // use encoded ids everywhere to makes things easier
        cal.id = encodeURIComponent(cal.id);
        cal.color = cal.backgroundColor;
        cal.shouldSync = true;
        if (calendarsToUse === 'own' && cal.accessRole !== 'owner') {
			cal.shouldSync = false;
        } else if (calendarsToUse === 'selected') {
        	if (cal.id in selectedCalendars) {
                cal.shouldSync = selectedCalendars[cal.id].shouldSync;
                cal.color = selectedCalendars[cal.id].color;
            }
            // let's display all calendars which are not in selected list in case that list is outdated
        }
        cal.synced = false;
        newCalendars[cal.id] = cal;
    }
    calendars = newCalendars;
	chrome.runtime.sendMessage({ status: 'calendars_updated' });
}


function extractID(url) {
	return url.match(/v3\/calendars\/([^\/]+)\//)[1]
}


function dateFromString(s) {
	return new Date(parseInt(s.substring(0, 4), 10), 
			parseInt(s.substring(5, 7), 10) - 1, 
			parseInt(s.substring(8, 10), 10), 
			parseInt(s.substring(11, 13), 10), 
			parseInt(s.substring(14, 16), 10), 
			parseInt(s.substring(17, 19), 10));
}

function clone(obj) {
	if (null  == obj || "object" != typeof obj)return obj;
	if (obj instanceof Date) {
		var copy =  new Date();
		copy.setTime(obj.getTime());
		return copy;
	}
	if (obj instanceof Array) {
		var copy = [];
		var len = obj.length;
		for (var i = 0; i < len; ++i) {
			copy[i] = clone(obj[i]);
		}
		return copy;
	}
	if (obj instanceof Object) {
		var copy = {
		};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr))copy[attr] = clone(obj[attr]);
		}
		return copy;
	}
	throw new Error("Unable to copy obj! Its type isn't supported.");
}


function hash(text) {
	return "xxxxxxxxx";
}


function getDebugText() {
	var debug = {};
	calEntries = clone(entries);
	for (i in calEntries) {
		calEntries[i].title = "XXXXXXXXXXXXXX";
		calEntries[i].calendar = hash("cccccccccc");
	}
	prefs = {};
	for (pref_key in defaultValues) {
		prefs[pref_key] = getValue(pref_key);
	}
	delete prefs['user_auth'];
	delete prefs['user_email'];
	var debug = { url: buildFeedURL('CALENDAR_URL'), entries: calEntries, preferences: prefs, timezoneOffset: new Date().getTimezoneOffset() };
	return JSON.stringify(debug);
}

function authURL() {
	"calendar.readonly can be used for 'view calendars' permission"
	return "https://accounts.google.com/o/oauth2/auth?&response_type=token&client_id=" + CLIENT_ID + "&redirect_uri=" + chrome.identity.getRedirectURL("calendar") + "&scope=https://www.googleapis.com/auth/calendar"
}


function requestInteractiveAuthToken(callback) {
  debugMessage('requestInteractiveAuthToken()')
  chrome.identity.launchWebAuthFlow({url: authURL(), interactive: true}, function (redirect_url) {
    if (chrome.runtime.lastError) {
      _gaq.push(['_trackEvent', 'getAuthToken (interactive)', 'Failed', chrome.runtime.lastError.message]);
      debugMessage('getAuthToken (interactive):' + chrome.runtime.lastError.message);
      chrome.runtime.sendMessage({ status : 'auth_required' });
      return;
    }
    _gaq.push(['_trackEvent', 'getAuthToken (interactive)', 'OK']);
    extractToken(redirect_url, callback);
  });
}

function requestAuthTokenSilently(callback) {
  debugMessage('requestAuthTokenSilently()')
  chrome.identity.launchWebAuthFlow({url: authURL(), interactive: false}, function (redirect_url) {
    if (chrome.runtime.lastError) {
      _gaq.push(['_trackEvent', 'getAuthToken (silent)', 'Failed', chrome.runtime.lastError.message]);
      debugMessage('getAuthToken (silent):' + chrome.runtime.lastError.message);
      chrome.runtime.sendMessage({ status : 'auth_required' });
      return;
    }
    extractToken(redirect_url, callback);
  });
}

function extractToken(token_url, callback) {
	//example: https://<id>.chromiumapp.org/calendar#access_token=<token>&token_type=Bearer&expires_in=3600
	cachedToken = token_url.match(/access_token=([^&]*)/)[1];
	expires_in = parseInt(token_url.match(/expires_in=([^&]*)/)[1]);
	debugMessage("token captured, expires in " + expires_in);

	tokenExpiryDate = new Date();
	//Expire 5 mins earlier just to be safe
	tokenExpiryDate.setSeconds(tokenExpiryDate.getSeconds() + expires_in - 300);
	chrome.runtime.sendMessage({ status : 'auth_done' });
	callback();
}
function hasValidAuthToken() {
	return cachedToken && tokenExpiryDate && tokenExpiryDate > new Date()
}
function withAuthTokenDo(callback) {
	if (hasValidAuthToken()) {
		// cached token valid
		callback();
	} else {
		requestAuthTokenSilently(callback);
	}
}

function getCalData(url) {
	// https://www.googleapis.com/calendar/v3/users/me/calendarList
	withAuthTokenDo(function() {
		$.ajax(url, {
	      headers: {
	        'Authorization': 'Bearer ' + cachedToken
	      },
	      success:function( data ) { console.log(data);},
	      error: function(response) { console.log(response); }
	  	});
	});

}