var entries = [];
var calendars = {};
var newEntries = [];

function init() {
	resetTranslation();
    //loadLanguage();
    setSDTitle();
    initCalendars();
    setupCSS();
	if (getValue("calendar_type") !== 'selected') {
		refreshFeeds();
	}
	chrome.alarms.create("sd-title", { periodInMinutes : 1 });
	chrome.alarms.create("view-update", { periodInMinutes : 10 });
	chrome.alarms.create("feeds-update", { periodInMinutes : getValue("refresh_interval") });
	chrome.alarms.onAlarm.addListener(function (alarm) {
		if (alarm.name === "sd-title") {
			setSDTitle();
		}
		else if (alarm.name === "feeds-update") {
			refreshFeeds();
		}
		else if (alarm.name === "view-update") {
			drawEntries();
		}
	});
}
function setSDTitle() {
	opr.speeddial.update({ title: new Date().format(getSDDateFormat()) });
}

function showDebugData() {
	if (chrome.tabs.create) {
		chrome.tabs.create({ url : "debug.html", active : true });
	}
}

document.addEventListener('DOMContentLoaded', function () {
    init();
});
