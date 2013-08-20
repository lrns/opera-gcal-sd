opera.isReady(function(){
var USER_AUTH = window["USER_AUTH"] = 'user_auth';
var USER_EMAIL = window["USER_EMAIL"] = 'user_email';
var ACCOUNT_TYPE = window["ACCOUNT_TYPE"] = 'account_type';
var REFRESH_INTERVAL = window["REFRESH_INTERVAL"] = 'refresh_interval';
var CALENDAR_TYPE = window["CALENDAR_TYPE"] = 'calendar_type';
var TITLE_DATE_FORMAT = window["TITLE_DATE_FORMAT"] = 'title_date_format';
var SELECTED_CALENDARS = window["SELECTED_CALENDARS"] = 'selected_calendars';
var TIME_ZONE = window["TIME_ZONE"] = 'time_zone';
var MAX_ENTRIES = window["MAX_ENTRIES"] = 'max_entries';
var SHOW_PAST_EVENTS = window["SHOW_PAST_EVENTS"] = 'past_events';
var SHOW_END_TIME = window["SHOW_END_TIME"] = 'end_time';
var DATE_FORMAT = window["DATE_FORMAT"] = 'date_format';
var BG_COLOR = window["BG_COLOR"] = 'bg_color';
var FONT_COLOR = window["FONT_COLOR"] = 'font_color';
var FONT_SIZE = window["FONT_SIZE"] = 'font_size';
var ALT_FONT_COLOR = window["ALT_FONT_COLOR"] = 'alt_font_color';
var WRAP_LINES = window["WRAP_LINES"] = 'wrap_lines';
var LANGUAGE = window["LANGUAGE"] = 'language';
var CLOCK_12H = window["CLOCK_12H"] = 'clock_12h';
var defaultValues = window["defaultValues"] = {
  'user_auth': '',
  'user_email': '',
  'account_type': 'share',
  'language': 'auto',
  'refresh_interval': 15,
  'calendar_type': 'all',
  'selected_calendars': '{}',
  'time_zone': 'auto',
  'max_entries': 15,
  'end_time': 'false',
  'date_format': 'dd NNN',
  'title_date_format': 'EE, d MMM yyyy, H:mm',
  'clock_12h': 'false',
  'show_past_events': 'false',
  'bg_color': 'FFFFFF',
  'font_color': '182C57',
  'font_size': '11',
  'alt_font_color': 'FFFFFF',
  'wrap_lines': 'true'
};
function getSDDateTemplate() {
  if (widget.preferences.getItem(TITLE_DATE_FORMAT)) {
    return widget.preferences.getItem(TITLE_DATE_FORMAT);
  }
  var local_format = getTranslatedMessage('sd_title');
  return (local_format ? local_format : defaultValues[TITLE_DATE_FORMAT]);
}
var getSDDateTemplate = window["getSDDateTemplate"] = getSDDateTemplate;
function getSDDateFormat() {
  template = getSDDateTemplate();
  if (widget.preferences.getItem('clock_12h') === 'true') {
    return template.replace(/HH?:(mm?)/i, 'h:$1a');
  }
  return template;
}
var getSDDateFormat = window["getSDDateFormat"] = getSDDateFormat;
function getTimeFormat() {
  return widget.preferences.getItem('clock_12h') === 'true' ? 'h:mma' : 'H:mm';
}
var getTimeFormat = window["getTimeFormat"] = getTimeFormat;
function getDayFormat() {
  if (widget.preferences.getItem(DATE_FORMAT)) {
    return widget.preferences.getItem(DATE_FORMAT);
  }
  var local_format = getTranslatedMessage('day');
  return (local_format ? local_format : defaultValues[DATE_FORMAT]);
}
var getDayFormat = window["getDayFormat"] = getDayFormat;
function resetPrefs() {
  for (i in widget.preferences) {
    delete widget.preferences[i];
  }
}
var resetPrefs = window["resetPrefs"] = resetPrefs;
function dropAuth() {
  delete widget.preferences[USER_AUTH];
  delete widget.preferences[USER_EMAIL];
}
var dropAuth = window["dropAuth"] = dropAuth;
function setValue(key, value) {
  debugMessage(key + ' => ' + value);
  widget.preferences.setItem(key, value);
}
var setValue = window["setValue"] = setValue;
function getValue(key) {
  return widget.preferences.getItem(key) || defaultValues[key];
}
var getValue = window["getValue"] = getValue;
function msg(key) {
  return getTranslatedMessage(key);
}
var msg = window["msg"] = msg;
function translate() {
  debugMessage('Translating...');
  var elems = document.querySelectorAll(".translate");
  for (var i in elems) {
    if (elems[i].id in text) {
      if (elems[i].tagName.toLowerCase() === 'input') {
        elems[i].value = getTranslatedMessage(elems[i].id);
      } else {
        elems[i].innerHTML = getTranslatedMessage(elems[i].id);
      }
    } else {
      elems[i].innerHTML = '<<<' + elems[i].id + '>>>';
    }
  }
}
var translate = window["translate"] = translate;
function loadLanguage() {
  var lang = getValue(LANGUAGE);
//TODO implement
  translate();
}
var loadLanguage = window["loadLanguage"] = loadLanguage;
});
