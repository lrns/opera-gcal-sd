var entries = [];
var calendars = {};
var newEntries = [];

function init() {
	installAnalytics();
	_gaq.push(['_trackEvent', 'Speed Dial', 'Shown']);
    loadLanguage();
    setSDTitle();
    setupCSS();
	refreshFeeds();
	chrome.runtime.onMessage.addListener(function (request, sender) {
		debugMessage("main message " + request.status);
		if (request.status === "auth_required") {
			displayNoAuth();
		} else if (request.status === "auth_done") {
			hideAuth();
			refreshFeeds();
		}
	});

	chrome.alarms.create("sd-title", { periodInMinutes : 1 });
	chrome.alarms.create("view-update", { periodInMinutes : 10 });
	chrome.alarms.create("feeds-update", { periodInMinutes : parseInt(getValue("refresh_interval"), 10) });
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
	chrome.tabs.create({ url : "debug.html", active : true });
}

document.addEventListener('DOMContentLoaded', init);

