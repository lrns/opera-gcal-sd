opera.isReady(function(){
var entries = [];
var calendars = {};
var newEntries = [];
var viewTimer;
var feedsTimer;
var sdTitleTimer;

function init() {
  //loadLanguage();
	setSDTitle();
	initCalendars();
	setupCSS();
	if (getValue(CALENDAR_TYPE) !== 'selected') {
		refreshFeeds();
	}
	chrome.alarms.create("sd-title", {periodInMinutes: 1});
	chrome.alarms.create("view-update", {periodInMinutes: 10});
	chrome.alarms.create("feeds-update", {periodInMinutes: getValue(REFRESH_INTERVAL)});
	
	chrome.alarms.onAlarm.addListener(function(alarm) {
		if (alarm.name === "sd-title") {
			setSDTitle();
		} else if (alarm.name === "feeds-update") {
			refreshFeeds();
		} else if (alarm.name === "view-update") {
			drawEntries();
		}
	});
}

function setSDTitle() {
	opr.speeddial.update({ title: new Date().format(getSDDateFormat()) });
}
var setSDTitle = window["setSDTitle"] = setSDTitle;

function showDebugData() {
  if (opera.extension.tabs.create) {
    opera.extension.tabs.create({
      url: "debug.html",
      focus: true
    });
  }
}
var showDebugData = window["showDebugData"] = showDebugData;

init();
});
