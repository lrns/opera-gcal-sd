var LOGIN_URL = 'https://www.google.com/accounts/ClientLogin'
var LOGIN_ADDITIONAL_PARAMS = 'accountType=HOSTED_OR_GOOGLE&service=cal'
var TITLE_UNREAD_COUNT_RE = /\s+\((\d+)(\+?)\)$/; 
var CAL_URL = 'http://www.google.com/reader/view/';
var SINGLE_FEED_URL = 'https://www.google.com/calendar/feeds/default/private/full';
var FEED_URL_SUFFIX = '?singleevents=true&orderby=starttime&sortorder=ascending&futureevents=true&max-results=';
var ALL_FEEDS_URL = 'https://www.google.com/calendar/feeds/default/allcalendars/full';
var OWN_FEEDS_URL = 'https://www.google.com/calendar/feeds/default/owncalendars/full';

var REQUEST_TIMEOUT_MS = 30 * 1000; // 30 seconds

var months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
var allEntries = [];
var timerId;
var defaultColor = '#182C57';
var calendars = {};

function init() {
	setupCSS();
    updateCal();
    timerId = window.setInterval(updateCal, getValue(REFRESH_INTERVAL));

}
/**
 * Update calendar and reschedule future updates.
 * Function called when options are changed
 */
function refresh() {
	window.clearInterval(timerId);
	updateCal();
	// reschedule update
	timerId = window.setInterval(updateCal, getValue(REFRESH_INTERVAL));
}
function redraw() {
	//TODO
	setupCSS();
}
/**
 * Setup CSS for calendar tile
 */
function setupCSS() {
	for (var i in document.styleSheets) {
		var sheet = document.styleSheets[i];
		if (sheet.ownerNode && sheet.href == null) {
			sheet.ownerNode.parentNode.removeChild(sheet.ownerNode);
		}
	}

	var cssNode = document.createElement("style");
	
	cssNode.innerHTML = "body { background-color: #" + getValue(BG_COLOR)+ " !important; }\n";
	cssNode.innerHTML += ".entries dd { white-space: " + (getValue(WRAP_LINES) == 'true' ? "normal" : "nowrap") + "; }\n";
	cssNode.innerHTML += "#cal {";
	cssNode.innerHTML += "font-size: " + getValue(FONT_SIZE) + "px;";
	cssNode.innerHTML += "line-height: " + (parseInt(getValue(FONT_SIZE), 10) + 3) + "px;";
	cssNode.innerHTML += "}\n";
	cssNode.innerHTML += ".entries dt { color: #" + getValue(FONT_COLOR) + "; }";
	cssNode.innerHTML += ".entries dd.full-day { color: #" + getValue(ALT_FONT_COLOR) + "; }";
	console.log(cssNode.innerHTML);	
	document.head.appendChild(cssNode);
}
/**
 * Add leading 0 to a single digit number
 */
function pad(s) {
	return s < 10 ? '0'+s : s;
}

function updateCal() {
	opera.extension.broadcastMessage('refresh-start');
	console.log("update calendar...");
	calendars = {};
	if (getValue(CALENDAR_TYPE) === 'all') {
		getFeed(ALL_FEEDS_URL, handleCalendars);
	} else if(getValue(CALENDAR_TYPE) === 'own') {
		getFeed(OWN_FEEDS_URL, handleCalendars);
	} else {
		getFeed(SINGLE_FEED_URL + FEED_URL_SUFFIX + getValue(MAX_ENTRIES), handleFeed);
	}
}

/**
 * Parse feed of a default calendar and display entries
 */
function handleFeed(data) {
	var entries = parseFeed(data);
	displayData(entries);
		
	opera.extension.broadcastMessage('refresh-end');
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
		opera.extension.broadcastMessage('refresh-end');
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
		getFeed(calendars[id].url + FEED_URL_SUFFIX + getValue(MAX_ENTRIES), handleMultiFeeds);
	}
		
}
function onError() {
	document.getElementById('error').innerHTML = 'Unknown Error!';
	document.getElementById('error').style.display = 'block';
	document.getElementById('cal').style.display = 'none';
	document.getElementById('loading').style.display = 'none';	
	opera.extension.broadcastMessage('refresh-end');
}

function showLoading() {
	document.getElementById('error').style.display = 'none';
	document.getElementById('cal').style.display = 'none';
	document.getElementById('loading').style.display = 'block';	
}
function displayNoAuth(){
	var text = 'Click to sign in ...';
	if (getValue(ACCOUNT_TYPE) != 'share') {
		text = 'Please sign in inside extension preferences';
	}
	document.getElementById('error').innerHTML = text;
	document.getElementById('error').style.display = 'block';
	document.getElementById('cal').style.display = 'none';
	document.getElementById('loading').style.display = 'none';	
	opera.extension.broadcastMessage('refresh-end');
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
	var color = defaultColor;
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
		var entries = [];
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


					entries.push({ title : title, start : start, end : end, 
						color: color, fullday : fullday });
				}
			}
		}
		
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
/**
 * Parse feed of calendars
 */
function parseCalendars(xml) {
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
function displayData(entries) {
	if (entries.length > 0) {
		var today = new Date();
		var s = '<dl class="entries">';
		var num = entries.length < getValue(MAX_ENTRIES) ? entries.length : getValue(MAX_ENTRIES);
		for (var i = 0; i < num; i++) {
			var e = entries[i];
			s += '<dt>';
			if (i > 0 && e.start.getDate() == entries[i-1].start.getDate() &&
					e.start.getMonth() == entries[i-1].start.getMonth()) {
				// same day as for previous entry
				s += '&nbsp;';
			} else {
				// first event of a day
				s += pad(e.start.getDate()) + " " + months[e.start.getMonth()];
			}
			s += '</dt>';
			if (e.fullday) {
				s += '<dd class="full-day" style="background-color: '+ e.color
					+';">' + e.title; 
			} else {
				s += '<dd class="entry" style="color: ' + e.color +';">';
				s += '<span class="entry-time">' + pad(e.start.getHours()) + ":" 
					+ pad(e.start.getMinutes()) + "</span> ";
				s += e.title; 
			}
			s += '</dd>';
		}
		s += "</dl>";
	} else {
		// no events 
		s = '<div class="centertext">No events in your calendar(s)</div>';
	}
	
	document.getElementById('cal').innerHTML = s;
	document.getElementById('cal').style.display = 'block';
	document.getElementById('error').style.display = 'none';
	document.getElementById('loading').style.display = 'none';	
}
