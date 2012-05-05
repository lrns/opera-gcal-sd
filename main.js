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
