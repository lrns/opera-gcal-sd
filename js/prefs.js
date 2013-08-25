var defaultValues = {
	'user_auth' : '', 
	'user_email' : '', 
	'account_type' : 'share', 
	'language' : 'auto', 
	'refresh_interval' : 15, 
	'calendar_type' : 'all', 
	'selected_calendars' : '{}', 
	'time_zone' : 'auto', 
	'max_entries' : 15, 
	'end_time' : 'false', 
	'date_format' : 'dd NNN', 
	'title_date_format' : 'EE, d MMM yyyy, H:mm', 
	'clock_12h' : 'false', 
	'show_past_events' : 'false', 
	'bg_color' : 'FFFFFF', 
	'font_color' : '182C57', 
	'font_size' : '11', 
	'alt_font_color' : 'FFFFFF', 
	'wrap_lines' : 'true'
};
var translatedMessages = {};

function getSDDateTemplate() {
	if (getValue("title_date_format")) {
		return getValue("title_date_format");
	}
	var local_format = getTranslatedMessage('sd_title');
	return (local_format ? local_format : defaultValues[title_date_format]);
}

function getSDDateFormat() {
	template = getSDDateTemplate();
	if (getValue('clock_12h') === 'true') {
		return template.replace(/HH?:(mm?)/i, 'h:$1a');
	}
	return template;
}

function getTimeFormat() {
	return getValue('clock_12h') === 'true' ? 'h:mma' : 'H:mm';
}

function getDayFormat() {
	if (getValue("date_format")) {
		return getValue("date_format");
	}
	var local_format = getTranslatedMessage('day');
	return (local_format ? local_format : defaultValues[date_format]);
}

function resetPrefs() {
	localStorage.clear();
}

function dropAuth() {
	localStorage.removeItem("user_auth");
	localStorage.removeItem("user_email");
}

function setValue(key, value) {
	// chrome.storage.local.set({key: value}, function() {
	// 	debugMessage('Prefs: ' + key + ' => ' + value);
	// });
	debugMessage(key + ' => ' + value);
	localStorage[key] = value;
}

function getValue(key) {
	// chrome.storage.local.get(key, function(val) { console.log(val) });
	return localStorage[key] || defaultValues[key];
}

function msg(key) {
	return getTranslatedMessage(key);
}

function translate() {
	debugMessage('Translating...');
	var elems = document.querySelectorAll(".translate");
	for (var i = 0; i < elems.length; i++) {
		if (elems[i].tagName.toLowerCase() === 'input') {
			elems[i].value = getTranslatedMessage(elems[i].id);
		} else {
			elems[i].innerHTML = getTranslatedMessage(elems[i].id);
		}
	}
}

function updateDate() {
	debugMessage('Dates updated: ' + getTranslatedMessage('months'));
	Date.monthNames = getTranslatedMessage('months').split("|");
	Date.monthAbbreviations = getTranslatedMessage('months_short').split("|");
	Date.dayNames = getTranslatedMessage('weekdays').split("|");
	Date.dayAbbreviations = getTranslatedMessage('weekdays_short').split("|");
}

function loadLanguage() {
	var lang = getValue("language");
	translatedMessages = {};
	if (lang === 'auto') {
		debugMessage("Using default language: " + chrome.i18n.getMessage("@@ui_locale"));	
		doFullTranslation();
	} else {
		debugMessage("Loading language: " + lang);
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState != 4)
				return;
			if (xhr.status < 400 && xhr.status > 0) {
				var newMessages = JSON.parse(xhr.responseText);
				// very naive validation
				if ("index_title" in newMessages) { 
					translatedMessages = newMessages;
					doFullTranslation();
				}
			} else {
				debugMessage("Error loading language, xhr.status = " + xhr.status);
			}
		};
		xhr.open("GET", chrome.extension.getURL('/_locales/'+lang+'/messages.json'), true);
		xhr.send();
	}
}

function getTranslatedMessage(message) {
	if (getValue("language") === 'auto') {
		return chrome.i18n.getMessage(message);
	} else {
		if (!(message in translatedMessages)) {
			debugMessage(message + " not translated in " + getValue("language"));
		}		
		return message in translatedMessages ? translatedMessages[message].message : chrome.i18n.getMessage(message);
	}
}


function resetTranslation() {
	translatedMessages = {};
	chrome.extension.getBackgroundPage().redraw();
}

/* Called after loading the language */
function doFullTranslation() {
	updateDate();
	translate();
	chrome.extension.getBackgroundPage().redraw();
	chrome.extension.getBackgroundPage().setSDTitle();
}
