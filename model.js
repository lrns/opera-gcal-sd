var CAL_URL = 'http://www.google.com/reader/view/';
var ALL_FEEDS_URL = 'https://www.google.com/calendar/feeds/default/allcalendars/full';
var OWN_FEEDS_URL = 'https://www.google.com/calendar/feeds/default/owncalendars/full';

var SINGLE_FEED_URL = 'https://www.google.com/calendar/feeds/default/private/full';
var FEED_URL_SUFFIX = '?singleevents=true&orderby=starttime&sortorder=ascending&futureevents=true&max-results=';

var REQUEST_TIMEOUT_MS = 30 * 1000; // 30 seconds

function buildFeedURL(prefix) {
	return prefix + FEED_URL_SUFFIX + getValue(MAX_ENTRIES);
}

function initCalendars() {
	calendars = {};
	if (getValue(CALENDAR_TYPE) === 'single') {
		calendars[extractID(SINGLE_FEED_URL)] = {
			url : SINGLE_FEED_URL,
			title : 'Default', color : getValue(FONT_COLOR), 
			synced : false, shouldSync : true };
	} else if (getValue(CALENDAR_TYPE) === 'selected') {
		// setup calendars
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
	calendars = {};
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
		displayData();
		opera.extension.broadcastMessage('refresh-end');
	}
}

function syncCalendars() {
	
	newEntries = [];
	for (id in calendars) {
		
		if (calendars[id].shouldSync) {
			console.log("GET calendar " + id + " => " + calendars[id].url);
			getFeed(buildFeedURL(calendars[id].url), handleMultiFeeds);
		}
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
					var start = new Date(when[j].attributes["startTime"].nodeValue);
					var end = new Date(when[j].attributes["endTime"].nodeValue);
					// full day event
					var fullday = start.getHours() === 0 && start.getMinutes() === 0 &&
									end.getHours() === 0 && end.getMinutes() === 0;


					feedEntries.push({ title : title, start : start, end : end, 
						color: color, fullday : fullday });
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
}

function extractID(url) {
	return url.replace(/https?:\/\/www\.google\.com\/calendar\/feeds\//i,"");
}
