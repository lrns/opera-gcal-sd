var REFRESH_INTERVAL_KEY = 'refresh-interval';
var CALENDAR_TYPE = 'calendar-type';
var MAX_ENTRIES = 'max-entries';
var USER_AUTH = 'user-auth';
var USER_EMAIL = 'user-email';
var ACCOUNT_TYPE = 'account-type';

function getRefreshInterval() {
	return parseInt(widget.preferences.getItem(REFRESH_INTERVAL_KEY) || '900000', 10);
}

function setRefreshInterval(value) {
	widget.preferences.setItem(REFRESH_INTERVAL_KEY, value);
}

function getAccountType() {
	return widget.preferences.getItem(ACCOUNT_TYPE) || 'share';
}
function setAccountType(value) {
	widget.preferences.setItem(ACCOUNT_TYPE, value);
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
function getUserAuth() {
	return widget.preferences.getItem(USER_AUTH);
}

function setUserAuth(value) {
	widget.preferences.setItem(USER_AUTH, value);
}
function getUserEmail() {
	return widget.preferences.getItem(USER_EMAIL);
}

function setUserEmail(value) {
	widget.preferences.setItem(USER_EMAIL, value);
}
function resetPrefs(){
	for(i in widget.preferences)
		delete widget.preferences[i];
}
function dropAuth(){
	delete widget.preferences[USER_AUTH];
	delete widget.preferences[USER_EMAIL];
}

