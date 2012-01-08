
var USER_AUTH = 'user-auth';
var USER_EMAIL = 'user-email';
var ACCOUNT_TYPE = 'account-type';

var REFRESH_INTERVAL = 'refresh-interval';
var CALENDAR_TYPE = 'calendar-type';
var TITLE_DATE_FORMAT = 'title-date-format';

/*
 * id
 * 		shouldSync
 * 		color
 */

var SELECTED_CALENDARS = 'selected-calendars';
var TIME_ZONE = 'time-zone';

var MAX_ENTRIES = 'max-entries';
var SHOW_PAST_EVENTS = 'past-events';
var SHOW_END_TIME = 'end-time';
var DATE_FORMAT = 'date-format';
var BG_COLOR = 'bg-color';
var FONT_COLOR = 'font-color';
var FONT_SIZE = 'font-size';
var ALT_FONT_COLOR = 'alt-font-color';
var WRAP_LINES = 'wrap-lines';

var defaultValues = {
	'user-auth' : '',
	'user-email' : '',
	'account-type' : 'share',
	
	'refresh-interval' : 900000,
	'calendar-type' : 'all',
	'selected-calendars' : '{}',
	'time-zone' : 'auto',

	'max-entries' : 15,
	'end-time' : 'false',
	'date-format' : 'dd NNN',
	'title-date-format' : 'H:mm E, d NNN yyyy',

	'show-past-events' : false,
	'bg-color' : 'FFFFFF',
	'font-color' : '182C57',
	'font-size' : '11',
	'alt-font-color' : 'FFFFFF',
	'wrap-lines' : true
};

function resetPrefs(){
	for(i in widget.preferences)
		delete widget.preferences[i];
}

function dropAuth(){
	delete widget.preferences[USER_AUTH];
	delete widget.preferences[USER_EMAIL];
}

function setValue(key, value) {
	console.log(key + ' => ' + value);
	widget.preferences.setItem(key, value);
}

function getValue(key) {
	return widget.preferences.getItem(key) || defaultValues[key];
}

//function id(e){return document.getElementById(e)}
