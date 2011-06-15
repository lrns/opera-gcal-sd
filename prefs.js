var REFRESH_INTERVAL_KEY = 'refresh-interval';
var TAB_REFRESH_INTERVAL_KEY = 'tab-refresh-interval';
var CALENDAR_TYPE = 'calendar-type';
var MAX_ENTRIES = 'max-entries';
var USER_AUTH = 'user-auth';
var USER_EMAIL = 'user-email';
var SIGN_IN_ICON = 'sign-in-icon';
var SIGN_OUT_ICON = 'sign-out-icon';
var SIGN_IN_BADGE_COLOR = 'sign-in-badge-color';
var SIGN_OUT_BADGE_COLOR = 'sign-out-badge-color';

function getRefreshInterval() {
	return parseInt(widget.preferences.getItem(REFRESH_INTERVAL_KEY) || '300000', 10);
}

function setRefreshInterval(value) {
	widget.preferences.setItem(REFRESH_INTERVAL_KEY, value);
}

function getTabRefreshInterval() {
	return parseInt(widget.preferences.getItem(TAB_REFRESH_INTERVAL_KEY) || '1000', 10);
}

function setTabRefreshInterval(value) {
	widget.preferences.setItem(TAB_REFRESH_INTERVAL_KEY, value);
}
function getCalendarType() {
	return widget.preferences.getItem(CALENDAR_TYPE) || 'single';
}

function setCalendarType(value) {
	widget.preferences.setItem(CALENDAR_TYPE, value);
}

function setMaxEntries(value) {
	widget.preferences.setItem(MAX_ENTRIES, value);
}

function getMaxEntries() {
	return widget.preferences.getItem(MAX_ENTRIES) || 5;
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
function getSignInIcon(){
	return widget.preferences.getItem(SIGN_IN_ICON) || 'icon-signed-in.png';
}
function setSignInIcon(value){
	widget.preferences.setItem(SIGN_IN_ICON,value);
}
function getSignOutIcon(){
	return widget.preferences.getItem(SIGN_OUT_ICON) || 'icon-signed-out.png';
}
function setSignOutIcon(value){
	widget.preferences.setItem(SIGN_OUT_ICON,value);
}

function getSignInBadgeColor() {
	return widget.preferences.getItem(SIGN_IN_BADGE_COLOR) || 'rgba(56, 57, 61, 1)';
}
function setSignInBadgeColor(value){
	widget.preferences.setItem(SIGN_IN_BADGE_COLOR,value);
}
function getSignOutBadgeColor() {
	return widget.preferences.getItem(SIGN_OUT_BADGE_COLOR) || 'rgba(56, 57, 61, 0.75)';
}
function setSignOutBadgeColor(value){
	widget.preferences.setItem(SIGN_OUT_BADGE_COLOR,value);
}
