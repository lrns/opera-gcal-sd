
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
var LANGUAGE = 'language'

var defaultValues = {
	'user-auth' : '',
	'user-email' : '',
	'account-type' : 'share',
	'language' : 'auto',
	
	'refresh-interval' : 900000,
	'calendar-type' : 'all',
	'selected-calendars' : '{}',
	'time-zone' : 'auto',

	'max-entries' : 15,
	'end-time' : 'false',
	'date-format' : dateFormat['day'],
	'title-date-format' : dateFormat['sd-title'],

	'show-past-events' : 'false',
	'bg-color' : 'FFFFFF',
	'font-color' : '182C57',
	'font-size' : '11',
	'alt-font-color' : 'FFFFFF',
	'wrap-lines' : 'true'
};

function getSDDateFormat() {
	return (('sd-title' in dateFormat) ? dateFormat['sd-title'] : 'EE, d MMM yyyy, H:mm');
}

function getDayFormat() {
	return (('day' in dateFormat) ? dateFormat['day'] : 'dd NNN');
}
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
function updateDate() {
	Date.monthNames = dateFormat['months'];
	Date.monthAbbreviations = dateFormat['months-short'];
	Date.dayNames = dateFormat['weekdays'];
	Date.dayAbbreviations = dateFormat['weekdays-short'];
}
// Return localised message
function msg(key) {
	return text[key];
}
/* moved to lang-en.js
function resetTranslation() {
	var text = {}
	var dateFormat = {}

	for (i in defaultDateFormat) {
		dateFormat[i] = defaultDateFormat[i];
	}
	for (i in defaultText) {
		text[i] = defaultText[i];
	}
}

function updateTranslation() {
	resetTranslation();
	for (i in translatedDateFormat) {
		dateFormat[i] = translatedDateFormat[i];
	}
	for (i in translatedText) {
		text[i] = translatedText[i];
	}
	translate();
}
*/
function translate() {
	console.log('Translating...');
	var elems =	document.querySelectorAll(".translate");
	
	for (var i in elems) {
		if (elems[i].id in text) {
			if (elems[i].tagName.toLowerCase() === 'input') {
				elems[i].value = text[elems[i].id];
			} else {
				elems[i].innerHTML = text[elems[i].id];
			}
		} else {
			elems[i].innerHTML = '<<<' +elems[i].id + '>>>';
		}
	}
}
function loadLanguage() {
	var lang = getValue(LANGUAGE);
	console.log('Language: ' + lang);
	// load relevant language file
	var newScript = document.createElement('script');
	newScript.type = 'text/javascript';

	if (lang.length > 0 && lang !== 'auto') {
		newScript.src = 'locales/' + lang + '/text.js';
	} else {
		// let browser to decide which file to load
		newScript.src = 'text.js';
	}
	console.log('Loading script: ' + newScript.src);
	document.getElementsByTagName('head')[0].appendChild(newScript);
	console.log('Script loaded: ' + newScript.src);

	//for (i in translatedDateFormat) {
		//dateFormat[i] = translatedDateFormat[i];
	//}
	//for (i in translatedText) {
		//text[i] = translatedText[i];
	//}
	translate();
	
}
//function id(e){return document.getElementById(e)}
