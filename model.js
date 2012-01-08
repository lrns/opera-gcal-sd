var CAL_URL = 'http://www.google.com/reader/view/';
var ALL_FEEDS_URL = 'https://www.google.com/calendar/feeds/default/allcalendars/full';
var OWN_FEEDS_URL = 'https://www.google.com/calendar/feeds/default/owncalendars/full';

var SINGLE_FEED_URL = 'https://www.google.com/calendar/feeds/default/private/full';
var FEED_URL_SUFFIX = '?singleevents=true&orderby=starttime&sortorder=ascending';

var REQUEST_TIMEOUT_MS = 30 * 1000; // 30 seconds

function buildFeedURL(prefix) {
	var url = prefix + FEED_URL_SUFFIX;
	url += '&max-results='+ getValue(MAX_ENTRIES);
	var date = new Date();
	if (getValue(SHOW_PAST_EVENTS) === 'true') {
		// show all today's events
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
	}
	url += '&start-min='+ date.toISOString();
	if (getValue(TIME_ZONE) !== 'auto') {
		url += '&ctz='+ getValue(TIME_ZONE);
	}
	console.log('URL: ' + url);
	return url;
}

function initCalendars() {
	calendars = {};
	if (getValue(CALENDAR_TYPE) === 'single') {
		calendars[extractID(SINGLE_FEED_URL)] = {
			url : SINGLE_FEED_URL,
			title : 'Default', color : '#'+getValue(FONT_COLOR), 
			synced : false, shouldSync : true };
	} else if (getValue(CALENDAR_TYPE) === 'selected') {
		// setup calendars
		refreshCalendars(ALL_FEEDS_URL,	function() {
				var selected = JSON.parse(getValue(SELECTED_CALENDARS));
				for (var id in calendars) {
					calendars[id].shouldSync = false;
					if (id in selected) {
						calendars[id].shouldSync = selected[id].shouldSync;
						calendars[id].color = selected[id].color;
					}
				}
				refreshFeeds();
			});
	}

}
function refreshFeeds() {
	console.log("update feeds...");
	opera.extension.broadcastMessage('refresh-start');
	if (getValue(CALENDAR_TYPE) === 'all') {
		refreshCalendars(ALL_FEEDS_URL, syncCalendars);
	} else if(getValue(CALENDAR_TYPE) === 'own') {
		calendars = {};
		refreshCalendars(OWN_FEEDS_URL, syncCalendars);
	} else {
		syncCalendars();
	
	}
}

function refreshCalendars(url, handler) {
	console.log('Refreshing calendar ' + url);
	getFeed(url, 
			function(data) { 
				// parse calendars
				parseCalendars(data);
				// execute handler when new list of calendars is ready
				handler();
			});
}

/**
 * Multi calendar mode.
 *
 * Parse feed of one of calendars and display entries only if all calendars
 * are updated
 */
function handleMultiFeeds(data) {
	var feedEntries = parseFeed(data);
	// merge this calendar's entries with existing entries

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
				//break;	
			} else {
				numSync++;
			}
		}
	}
	console.log('Synced: ' + numSync +'/'+numCalendars);
	if (allSynced) {
		// Feeds of all calendars are retrieved
		
		if (numCalendars > 1 && newEntries.length > 1) {
			// sort entries by the start time
			newEntries = newEntries.sort(
					function(a, b) {
						if (a.start > b.start) return 1;
						if (a.start < b.start) return -1;
						return 0;
					});
		}
		entries = newEntries;
		drawEntries();
		opera.extension.broadcastMessage('refresh-end');
	}
}

function syncCalendars() {
	
	newEntries = [];
	var numToSync = 0;
	for (id in calendars) {
		calendars[id].synced = false;	
		if (calendars[id].shouldSync) {
			numToSync++;
			console.log("GET calendar " + id + " => " + calendars[id].url);
			getFeed(buildFeedURL(calendars[id].url), handleMultiFeeds);
		}
	}
	if (numToSync === 0) {
		entries = newEntries;
		drawEntries();
		opera.extension.broadcastMessage('refresh-end');
	}
}
function getFeed(feedUrl, handler) {

	var xhr = new XMLHttpRequest()
	var abortTimerId = window.setTimeout(function() {
		xhr.abort();
		//onError();
		opera.extension.broadcastMessage('refresh-end');
	}, REQUEST_TIMEOUT_MS);

	function handleError(is401) {
		window.clearTimeout(abortTimerId);
		if (is401) {
			// not logged in
			displayNoAuth();
		}
		opera.extension.broadcastMessage('refresh-end');

	}

	try{
		xhr.onreadystatechange = function() {
			if (xhr.readyState != 4)
				return;
			
			if (xhr.status >= 400 || xhr.status == 0) {
				console.log('Error response code: ' + xhr.status + ' ' + xhr.statusText);
				handleError(xhr.status == 401 || xhr.status == 0);
			} else if (xhr.responseXML) {
				console.log('Response received: ' + xhr.responseText.substring(0,50));
				handler(xhr.responseXML);
			} else {
				console.log('No responseText!');
				handleError();
			}
		}
		xhr.onerror = function(error) {
			console.log('XHR error\n' + error);
			handleError();
		}
		xhr.open("GET", feedUrl, true);
		if (getValue(ACCOUNT_TYPE) != 'share') { 
			// use separate account
			xhr.setRequestHeader("Authorization","GoogleLogin auth=" + getValue(USER_AUTH));
		}
		xhr.send(null);
	} catch(e) {
		console.log('XHR exception: ' + e);
		handleError();
	}
}
function parseFeed(xml) {
	var calID = extractID(xml.getElementsByTagName("id")[0].childNodes[0].nodeValue);
	console.log("Received: " + calID);
	var color = getValue(FONT_COLOR);
	if (calID in calendars) {
		// prevent doubled entries
		if (calendars[calID].synced) {
			return {};
		}
		color = calendars[calID].color;
		calendars[calID].synced = true;
	}

	try {
		// Parse calendar's feed
		var xmlEntries = xml.getElementsByTagName("entry");
		var feedEntries = [];
		for (var i = 0; i < xmlEntries.length; i++) {
			var title = xmlEntries[i].getElementsByTagName('title')[0].childNodes[0].nodeValue;
			var when = xmlEntries[i].getElementsByTagName('when');
			for (var j = 0; j < when.length; j++) {
				if (when[j].parentNode == xmlEntries[i]) {
					// calendar entry must have 'when' element
					// full day event - no time specified

					var fullday =/^\d{4}-\d\d-\d\d$/.test(when[j].attributes["startTime"].nodeValue)
					if (!fullday && getValue(TIME_ZONE) !== 'auto') {
						// get rid of timezone offset:
						// from: 2012-01-08T06:00:00.000-05:00
						//   to: 2012-01-08T06:00:00.000
						var start = new Date(when[j].attributes["startTime"].nodeValue.substring(0, when[j].attributes["startTime"].nodeValue.length - 6));
						var end = new Date(when[j].attributes["endTime"].nodeValue.substring(0, when[j].attributes["endTime"].nodeValue.length - 6));
					} else {
						var start = new Date(when[j].attributes["startTime"].nodeValue);
						var end = new Date(when[j].attributes["endTime"].nodeValue);
					}

					feedEntries.push({ title : title, start : start, end : end, 
						color: color, fullday : fullday, calendar : calID });
				}
			}
		}
		
		console.log('Parsed ' + feedEntries.length + ' entries');
		return feedEntries;
	} catch (err) {
		console.log("Error: " + err); 
		//if (calID in calendars) {
			// calendar's feed failed
			//calendars[calID].synced = false;
		//}
		return {};
	}
}
/**
 * Parse feed of calendars
 */
function parseCalendars(xml) {
	var xmlEntries = xml.getElementsByTagName("entry");
	var newCalendars = {};
	
	for (var i = 0; i < xmlEntries.length; i++) {
		var title = xmlEntries[i].getElementsByTagName('title')[0].childNodes[0].nodeValue;
		var url = xmlEntries[i].getElementsByTagName('content')[0].attributes["src"].nodeValue;
		var color = xmlEntries[i].getElementsByTagName('color')[0].attributes["value"].nodeValue;
		newCalendars[extractID(url)] = { url : url, title : title, color : color, 
			synced : false, shouldSync : true };
	}
	calendars = newCalendars;
	opera.extension.broadcastMessage('calendars-updated');
}

function extractID(url) {
	return url.replace(/https?:\/\/www\.google\.com\/calendar\/feeds\//i,"").replace(/[^\w\s]/gi, '').substring(0,20);
}
