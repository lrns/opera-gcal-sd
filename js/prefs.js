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
	debugMessage(key + ' => ' + value);
	localStorage[key] = value;
}

function getValue(key) {
	return localStorage[key] || defaultValues[key];
}

function msg(key) {
	return getTranslatedMessage(key);
}

function translate() {
	debugMessage('Translating...');
	/*var elems = document.querySelectorAll(".translate");
	for (var i in elems) {
		if (elems[i].id in text) {
			if (elems[i].tagName.toLowerCase() === 'input') {
				elems[i].value = getTranslatedMessage(elems[i].id);
			}
			else {
				elems[i].innerHTML = getTranslatedMessage(elems[i].id);
			}
		}
		else {
			elems[i].innerHTML = '<<<' + elems[i].id + '>>>';
		}
	}*/
}

function loadLanguage() {
	var lang = getValue("language");
	debugMessage("Loading language: " + lang);
	//TODO implement
	translate();
}

function getTranslatedMessage(message) {
	return chrome.i18n.getMessage(message);
}

function updateDate() {
	debugMessage('Dates updated: ' + getTranslatedMessage('months'));
	Date.monthNames = getTranslatedMessage('months').split("|");
	Date.monthAbbreviations = getTranslatedMessage('months_short').split("|");
	Date.dayNames = getTranslatedMessage('weekdays').split("|");
	Date.dayAbbreviations = getTranslatedMessage('weekdays_short').split("|");
}

function resetTranslation() {
	//TODO translatedMessages = {}
	chrome.extension.getBackgroundPage().redraw();
}

function updateTranslation() {
	//TODO
	/*
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = handleStateChange; // Implemented elsewhere.
	xhr.open("GET", chrome.extension.getURL('/config_resources/config.json'), true);
	xhr.send();
	*/
	resetTranslation();
	updateDate();
	translate();
	chrome.extension.getBackgroundPage().redraw();
	
}


