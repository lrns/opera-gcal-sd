var REFRESH_INTERVAL_KEY = 'refresh-interval';
var CALENDAR_TYPE = 'calendar-type';
var MAX_ENTRIES = 'max-entries';

function getRefreshInterval() {
	return parseInt(widget.preferences.getItem(REFRESH_INTERVAL_KEY) || '900000', 10);
}

function setRefreshInterval(value) {
	widget.preferences.setItem(REFRESH_INTERVAL_KEY, value);
	console.log('set refresh');
}

function getCalendarType() {
	return widget.preferences.getItem(CALENDAR_TYPE) || 'all';
}

function setCalendarType(value) {
	widget.preferences.setItem(CALENDAR_TYPE, value);
}

function setMaxEntries(value) {
	widget.preferences.setItem(MAX_ENTRIES, value);
}

function getMaxEntries() {
	return widget.preferences.getItem(MAX_ENTRIES) || 15;
}
function resetPrefs(){
	for(i in widget.preferences)
		delete widget.preferences[i];
}

