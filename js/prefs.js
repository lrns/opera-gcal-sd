opera.isReady(function () {

    var defaultValues = window["defaultValues"] = {
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
    var getSDDateTemplate = window["getSDDateTemplate"] = getSDDateTemplate;
	
    function getSDDateFormat() {
        template = getSDDateTemplate();
        if (getValue('clock_12h') === 'true') {
            return template.replace(/HH?:(mm?)/i, 'h:$1a');
        }
        return template;
    }
    var getSDDateFormat = window["getSDDateFormat"] = getSDDateFormat;
	
    function getTimeFormat() {
        return getValue('clock_12h') === 'true' ? 'h:mma' : 'H:mm';
    }
    var getTimeFormat = window["getTimeFormat"] = getTimeFormat;
	
    function getDayFormat() {
        if (getValue("date_format")) {
            return getValue("date_format");
        }
        var local_format = getTranslatedMessage('day');
        return (local_format ? local_format : defaultValues[date_format]);
    }
    var getDayFormat = window["getDayFormat"] = getDayFormat;
	
    function resetPrefs() {
        localStorage.clear();
    }
    var resetPrefs = window["resetPrefs"] = resetPrefs;
	
    function dropAuth() {
        localStorage.removeItem("user_auth");
		localStorage.removeItem("user_email");
    }
    var dropAuth = window["dropAuth"] = dropAuth;
	
    function setValue(key, value) {
        debugMessage(key + ' => ' + value);
        localStorage[key] = value;
    }
    var setValue = window["setValue"] = setValue;
	
    function getValue(key) {
        return localStorage[key] || defaultValues[key];
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
                }
                else {
                    elems[i].innerHTML = getTranslatedMessage(elems[i].id);
                }
            }
            else {
                elems[i].innerHTML = '<<<' + elems[i].id + '>>>';
            }
        }
    }
    var translate = window["translate"] = translate;
	
    function loadLanguage() {
        var lang = getValue("language");
        //TODO implement
        translate();
    }
    var loadLanguage = window["loadLanguage"] = loadLanguage;
	
	function getTranslatedMessage(message) {
        return chrome.i18n.getMessage(message);
    }
    var getTranslatedMessage = window["getTranslatedMessage"] = getTranslatedMessage;
	
    function updateDate() {
        debugMessage('Dates updated: ' + getTranslatedMessage('months'));
        Date.monthNames = getTranslatedMessage('months').split("|");
        Date.monthAbbreviations = getTranslatedMessage('months_short').split("|");
        Date.dayNames = getTranslatedMessage('weekdays').split("|");
        Date.dayAbbreviations = getTranslatedMessage('weekdays_short').split("|");
    }
    var updateDate = window["updateDate"] = updateDate;
	
    function resetTranslation() {
        //TODO translatedMessages = {}
        if (opera.extension.bgProcess) {
            opera.extension.bgProcess.redraw();
        }
        else {
            redraw();
        }
    }
    var resetTranslation = window["resetTranslation"] = resetTranslation;
	
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
        if (opera.extension.bgProcess) {
            opera.extension.bgProcess.redraw();
        }
        else {
            redraw();
        }
    }
    var updateTranslation = window["updateTranslation"] = updateTranslation;
	
    resetTranslation();
}
);
