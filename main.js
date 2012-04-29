/* main variables to hold data
entry 
	title
	start
	end
	color
	fullday - bool flag
	*/

var entries = [];
/*
ID (from calendar URL) => calendar
	url
	title
	color
	synced - flag if calendar was recently synced
	shouldSync - bool flag
*/
var calendars = {};

var newEntries = [];

var viewTimer;
var feedsTimer;
var sdTitleTimer;
var UI_INTERVAL = 600000; //10 min

function init() {
	loadLanguage();
	setSDTitle();
	initCalendars();
	setupCSS();
	if (getValue(CALENDAR_TYPE) !== 'selected') {
		refreshFeeds();
	}
    feedsTimer = window.setInterval(refreshFeeds, getValue(REFRESH_INTERVAL));
	// force UI update 
    viewTimer = window.setInterval(drawEntries, UI_INTERVAL);
    sdTitleTimer = window.setInterval(setSDTitle, 2000);

}

function setSDTitle() {
	opera.contexts.speeddial.title = (new Date()).format(getSDDateFormat());
}

/**
 * Update calendar and reschedule future updates.
 * Function called when options are changed
 */
function reloadFeeds() {
	window.clearInterval(feedsTimer);
	refreshFeeds();
	// reschedule update
	timerId = window.setInterval(refreshFeeds, getValue(REFRESH_INTERVAL));
}
function refreshUI() {
	window.clearInterval(viewTimer);
	drawEntries();
	// reschedule update
	viewTimer = window.setInterval(drawEntries, getValue(UI_INTERVAL));
}

function showDebugData() {
	if (opera.extension.tabs.create) {
		opera.extension.tabs.create({url: "debug.html", focus: true});
	}
}
//utility function
//stolen from http://stackoverflow.com/questions/728360/copying-an-object-in-javascript
function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
		var len = obj.length;
        for (var i = 0; i < len; ++i) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}
