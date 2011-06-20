var LOGIN_URL = 'https://www.google.com/accounts/ClientLogin'
var LOGIN_ADDITIONAL_PARAMS = 'accountType=HOSTED_OR_GOOGLE&service=cal'
var TITLE_UNREAD_COUNT_RE = /\s+\((\d+)(\+?)\)$/; 
var CAL_URL = 'http://www.google.com/reader/view/';
var SINGLE_FEED_URL = 'https://www.google.com/calendar/feeds/default/private/embed';
var FEED_URL_SUFFIX = '?toolbar=true&max-results=';
var ALL_FEEDS_URL = 'https://www.google.com/calendar/feeds/default/allcalendars/full';
var OWN_FEEDS_URL = 'https://www.google.com/calendar/feeds/default/owncalendars/full';

var REQUEST_TIMEOUT_MS = 30 * 1000; // 30 seconds

var requestTimeout;
var months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
var allEntries = [];
var timerId;
var defaultColor = '#668CB3';
var calendars = {};

function init() {
    updateCal();
    //window.setInterval(updateCal, 10000);
    timerId = window.setInterval(updateCal, getRefreshInterval());

	addEventListener('storage', 
        function(){
			window.clearInterval(timerId);
			updateCal();
			// reschedule update
			timerId = window.setInterval(updateCal, getRefreshInterval());
        }
    , false);
}

/**
 * Add leading 0 to a single digit number
 */
function pad(s) {
	return s < 10 ? '0'+s : s;
}
function updateCal() {
	console.log("update calendar...");
	calendars = {};
	if (getUserAuth()) {
		if (getCalendarType() === 'all') {
			getFeed(ALL_FEEDS_URL, handleCalendars);
		} else if(getCalendarType() === 'own') {
			getFeed(OWN_FEEDS_URL, handleCalendars);
		
		} else {
			getFeed(SINGLE_FEED_URL + FEED_URL_SUFFIX + getMaxEntries(), handleFeed);
		}
		
	} else {
		displayNoAuth();
	}
}

/**
 * Parse feed of a default calendar and display entries
 */
function handleFeed(data) {
	var entries = parseFeed(data);
	displayData(entries);
		
}

/**
 * Multi calendar mode.
 *
 * Parse feed of one of calendars and display entries only if all calendars
 * are updated
 */
function handleMultiFeeds(data) {
	var entries = parseFeed(data);
	// merge this calendar's entries with existing entries

	for (var i = 0; i < entries.length; i++) {
		allEntries.push(entries[i]);
	}
	var allSynced = true;
	var numCalendars = 0;
	var numSync = 0;
	for (id in calendars) {
		numCalendars++;
		if (!calendars[id].synced) {
			allSynced = false;
			//break;	
		} else {
			numSync++;
		}
	}
	console.log('Synced: ' + numSync +'/'+numCalendars);
	if (allSynced) {
		// Feeds of all calendars are retrieved
		
		if (numCalendars > 1 && allEntries.length > 1) {
			// sort entries by the start time
			allEntries = allEntries.sort(
					function(a, b) {
						if (a.start > b.start) return 1;
						if (a.start < b.start) return -1;
						return 0;
					});
		}
		displayData(allEntries);
	}
}

/**
 * Update multiple calendars
 */
function handleCalendars(data) {
	allEntries = [];
	calendars = parseCalendars(data);
	for (id in calendars) {
		console.log("GET " + id);
		getFeed(calendars[id].url + FEED_URL_SUFFIX + getMaxEntries(), handleMultiFeeds);
	}
		
}
function onError() {
	document.getElementById('error').innerHTML = 'Unknown Error!';
	document.getElementById('error').style.display = 'block';
	document.getElementById('cal').style.display = 'none';
	document.getElementById('loading').style.display = 'none';	
}

function showLoading() {
	document.getElementById('error').style.display = 'none';
	document.getElementById('cal').style.display = 'none';
	document.getElementById('loading').style.display = 'block';	
}
function displayNoAuth(){
	document.getElementById('error').innerHTML = 'Please login in Preferences!';
	document.getElementById('error').style.display = 'block';
	document.getElementById('cal').style.display = 'none';
	document.getElementById('loading').style.display = 'none';	
}

function getFeed(feedUrl, handler) {

	var xhr = new XMLHttpRequest()
	var abortTimerId = window.setTimeout(function() {
		xhr.abort();
		//onError();
	}, REQUEST_TIMEOUT_MS);

	function handleError(is401) {
		window.clearTimeout(abortTimerId);
		if (is401) {
			// not logged in
			displayNoAuth();
		}

	}

	try{
		xhr.onreadystatechange = function() {
			if (xhr.readyState != 4)
				return;

			if (xhr.status >= 400) {
				console.log('Error response code: ' + xhr.status + '/' + xhr.statusText);
				handleError(xhr.status == 401);
			} else if (xhr.responseXML) {
				console.log('responseXML: ' + xhr.responseText.substring(0, 200) + '...');
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
		xhr.setRequestHeader("Authorization","GoogleLogin auth=" + getUserAuth());
		xhr.send(null);
	} catch(e) {
		console.log('XHR exception: ' + e);
		handleError();
	}
}
function parseFeed(xml) {
	//var parser = new DOMParser();
	//xml = parser.parseFromString(feed,"text/xml");
	var calID = extractID(xml.getElementsByTagName("id")[0].childNodes[0].nodeValue);
	console.log("Received: " + calID + ", in: " + (calID in calendars));
	var color = defaultColor;
	if (calID in calendars) {

		color = calendars[calID].color;
		calendars[calID].synced = true;
	}

	try {
		// Parse calendar's feed
		var xmlEntries = xml.getElementsByTagName("entry");
		var entries = [];
		console.log('ENTRIES: ' + xmlEntries.length);
		for (var i = 0; i < xmlEntries.length; i++) {
			var title = xmlEntries[i].getElementsByTagName('title')[0].childNodes[0].nodeValue;
			var when = xmlEntries[i].getElementsByTagName('when');
			if (when.length > 0) {
				// calendar entry must have 'when' element
				var start = new Date(when[0].attributes["startTime"].nodeValue);
				var end = new Date(when[0].attributes["endTime"].nodeValue);
				// full day event
				//var fullday = start.getUTCHours() === 0 && start.getUTCMinutes() === 0 &&
								//end.getUTCHours() === 0 && end.getUTCMinutes() === 0;
				var fullday = start.getHours() === 0 && start.getMinutes() === 0 &&
								end.getHours() === 0 && end.getMinutes() === 0;


				entries.push({ title : title, start : start, end : end, 
					color: color, fullday : fullday });
			}
		}
		
		console.log('GOOD ENTRIES: ' + entries.length);
		return entries;
	} catch (err) {
		console.log("Error: " + err); 
		//if (calID in calendars) {
			// calendar's feed failed
			//calendars[calID].synced = false;
		//}
		return {};
	}
}
function parseCalendars(xml) {
	//var parser = new DOMParser();
	//var xml = parser.parseFromString(feed,"text/xml");
	var xmlEntries = xml.getElementsByTagName("entry");
	var entries = {};
	
	for (var i = 0; i < xmlEntries.length; i++) {
		var title = xmlEntries[i].getElementsByTagName('title')[0].childNodes[0].nodeValue;
		var url = xmlEntries[i].getElementsByTagName('content')[0].attributes["src"].nodeValue;
		var color = xmlEntries[i].getElementsByTagName('color')[0].attributes["value"].nodeValue;
		entries[extractID(url)] = { url : url, title : title, color : color, 
			synced : false };
	}
	return entries;
}

function extractID(url) {
	return url.replace(/https?:\/\/www\.google\.com\/calendar\/feeds\//i,"");
}
function encode(s, notime) {
	// remove date and time from title
	if (notime) {
		s = s.replace(/[A-Za-z]{3} \d{1,2} [A-Za-z]{3} /i, "");
	} else {
		s = s.replace(/[A-Za-z]{3} \d{1,2} [A-Za-z]{3} \d{1,2}:\d{1,2} /i, "");
	}
	return s;
}
function displayData(entries) {
	var today = new Date();
	var s = '<dl class="entries">';
	var num = entries.length < getMaxEntries() ? entries.length : getMaxEntries();
	for (var i = 0; i < num; i++) {
		var e = entries[i];
		s += '<dt>';
		//if (j == 0) {
			//// first event of a day
			//s += pad(e.start.getDate()) + " " + months[e.start.getMonth()];
		//} else {
			//s += '&nbsp;';
		//}
		//TODO check if it is the first event of a day 
		s += pad(e.start.getDate()) + " " + months[e.start.getMonth()];
		s += '</dt>';
		if (e.fullday) {
			s += '<dd class="full-day" style="background-color: '+ e.color
				+';">' + encode(e.title, e.fullday); 
		} else {
			s += '<dd class="entry" style="color: ' + e.color +';">';
			s += '<span class="entry-time">' + pad(e.start.getHours()) + ":" 
				+ pad(e.start.getMinutes()) + "</span> ";
			s += encode(e.title, e.fullday); 
		}
		s += '</dd>';
	}
	s += "</dl>";
	
	document.getElementById('cal').innerHTML = s;
	document.getElementById('cal').style.display = 'block';
	document.getElementById('error').style.display = 'none';
	document.getElementById('loading').style.display = 'none';	
}
