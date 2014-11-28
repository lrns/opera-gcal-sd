var selected = {};

function id(e) {
	return document.getElementById(e);
}

function setText(id, txt) {
	var e = document.getElementById(id);
	if (e) {
		e.textContent = txt;
	}
}

function setListActiveValue(value, list) {
	for (var i = 0; i < list.length; i++) {
		var listValue = list.options[i];
		if (listValue.value == value) {
			listValue.selected = true;
			return;
		}
	}
}

function contains(obj, list) {
	for (var i = 0; i < list.length; i++) {
		if (list[i] === obj) {
			return true;
		}
	}
	return false;
}

function calendarColorChanged() {
	debugMessage('color changed for ' + this.id);
	var calID = this.id.split('_')[1];
	var bgPage = chrome.extension.getBackgroundPage();
	if (calID in selected) {
		selected[calID].color = '#' + this.value;
	} else {
		selected[calID] = { shouldSync: document.getElementById('cal_' + calID).checked, color: '#' + this.value };
	}
	bgPage.calendars[calID].color = '#' + this.value;
	for (var j in chrome.extension.getBackgroundPage().entries) {
		if (bgPage.entries[j].calendar === calID) {
			bgPage.entries[j].color = '#' + this.value;
		}
	}
	setValue("selected_calendars", JSON.stringify(selected));
	bgPage.redraw();
}

function calendarChecked() {
	debugMessage('checkbox changed for ' + this.id);
	var calID = this.id.split('_')[1];
	if (calID in selected) {
		selected[calID].shouldSync = this.checked;
	} else {
		selected[calID] = { shouldSync: this.checked, color: chrome.extension.getBackgroundPage().calendars[calID].color };
	}
	chrome.extension.getBackgroundPage().calendars[calID].shouldSync = this.checked;
	setValue("selected_calendars", JSON.stringify(selected));
	chrome.extension.getBackgroundPage().refreshFeeds();
}

function showSelectableCalendars() {
	document.getElementById('select_calendars').style.display = 'block';
	debugMessage('select cals...');
	var bgPage = chrome.extension.getBackgroundPage();
	var calendars = bgPage.calendars;
	document.getElementById('list_of_cals').innerHTML = '';
	for (var id in calendars) {
		var checked = (id in selected) ? selected[id].shouldSync : false;
		var color = (id in selected) ? selected[id].color : calendars[id].color;
		bgPage.calendars[id].shouldSync = checked;
		bgPage.calendars[id].color = color;
		var line = '<p><input type="checkbox" class="check_calendars" name="' + id + '" id="cal_' + id + '" value="1"';
		if (checked) {
			line += 'checked="checked"';
		}
		line += '/>';
		line += '<input type="text" class="color cal_color" name="color_' + id + '" id="color_' + id + '" value="' + color + '"';
		line += '<label for="cal_' + id + '">' + calendars[id].title + '</label>';
		line += '</p>';
		document.getElementById('list_of_cals').innerHTML += line;
	}
	for (var id in calendars) {
		document.getElementById('cal_' + id).onchange= calendarChecked;
		document.getElementById('color_' + id).onchange = calendarColorChanged;
	}
	bgPage.refreshFeeds();
	jscolor.bind();
}

function resyncCalendars() {
	debugMessage('select cals1...');
	id('select_calendars').style.display = 'block';
	id('list_of_cals').innerHTML = '<img src="/img/ajax-loader.gif" id="cal_list_loader" />';
	chrome.extension.getBackgroundPage().refreshCalendars(chrome.extension.getBackgroundPage().CALENDAR_LIST_URL, function () {});
}

function hideOptionsAuth() {
	$('#main_signin').hide();
	$('#main_signout').show();
	// a hack for going back to Speed Dial when clicking on SD with 'Sign In' displayed
	if (window.location.search === '?signin') {
		chrome.tabs.getCurrent(function(tab){
			chrome.tabs.update(tab.id, {'url': 'chrome://newtab'});
		});
	}
}

function showOptionsAuth() {
	$('#main_signin').show();
	$('#main_signout').hide();
}


function initAccount() {
	
	var signInButton = id('signin');		
	signInButton.onclick = function () {
		chrome.extension.getBackgroundPage().requestInteractiveAuthToken(function() {
			chrome.extension.getBackgroundPage().hideAuth();
			hideOptionsAuth();
			window.location.reload();
		})
	};
	
}

function initOptions() {
	var language = getValue("language");
	var languageElement = id("language");
	setListActiveValue(language, languageElement);
	languageElement.onchange = function () {
		setValue("language", languageElement.options[languageElement.selectedIndex].value);
		loadLanguage();
		chrome.extension.getBackgroundPage().loadLanguage();
	};
	var refreshInterval = getValue("refresh_interval");
	var refreshIntervalElement = id("refresh_interval");
	setListActiveValue(refreshInterval, refreshIntervalElement);
	refreshIntervalElement.onchange = function () {
		setValue("refresh_interval", refreshIntervalElement.options[refreshIntervalElement.selectedIndex].value);
		chrome.extension.getBackgroundPage().refreshFeeds();
	};
	id('refresh_cal').onclick = function () {
		document.getElementById('refresh_img').style.display = 'inline';
		debugMessage("refreshing button clicked");
		chrome.extension.getBackgroundPage().refreshFeeds();
	};
	var timeZone = getValue("time_zone");
	var timeZoneElement = id("time_zone");
	setListActiveValue(timeZone, timeZoneElement);
	timeZoneElement.onchange = function () {
		setValue("time_zone", timeZoneElement.options[timeZoneElement.selectedIndex].value);
		chrome.extension.getBackgroundPage().refreshFeeds();
	};
	
	var calendarType = getValue("calendar_type");
	var calendarTypeElement = id('calendar_type');
	setListActiveValue(calendarType, calendarTypeElement);
	calendarTypeElement.onchange = function () {
		var bgPage = chrome.extension.getBackgroundPage();
		setValue("calendar_type", calendarTypeElement.options[calendarTypeElement.selectedIndex].value);
		if (getValue("calendar_type") === 'selected') {
			resyncCalendars();
		} else {
			id('select_calendars').style.display = 'none';
			bgPage.calendars = {};
			bgPage.refreshFeeds();
		}
	};
	
	id('font_size').value = getValue("font_size");
	
	id('font_plus').onclick = function () {
		var size = parseInt(getValue("font_size"), 10);
		if (size < 72) {
			setValue("font_size", size + 1);
		}
		id('font_size').value = getValue("font_size");
		chrome.extension.getBackgroundPage().redraw();
		return false;
	};
	id('font_minus').onclick = function () {
		var size = parseInt(getValue("font_size"), 10);
		if (size > 4) {
			setValue("font_size", size - 1);
		}
		id('font_size').value = getValue("font_size");
		chrome.extension.getBackgroundPage().redraw();
		return false;
	};
	id('font_size').onchange = function () {
		var size = this.value;
		setValue("font_size", size);
		chrome.extension.getBackgroundPage().redraw();
		return false;
	};
	id('reset_prefs').onclick = function () {
		if (confirm(msg('options_reset_confirm'))) {
			resetPrefs();
			chrome.extension.getBackgroundPage().redraw();
			chrome.extension.getBackgroundPage().refreshFeeds();
			window.location.reload();
		}
		return false;
	};
	id('debug_data').onclick = function () {
		chrome.extension.getBackgroundPage().showDebugData();
		return false;
	};
}

function initSimpleFields() {
	var textFields = ["max_entries", "bg_color", "font_color", "alt_font_color", "date_format", "title_date_format"];
	var checkboxFields = ["show_past_events", "wrap_lines", "show_end_time", "clock_12h"];
	
	for (var i in textFields) {
		var field = textFields[i];
		element = id(field);
		element.value = getValue(field);
		element.onchange = function () {
			var bgPage = chrome.extension.getBackgroundPage();
			setValue(this.id, this.value);
			if (this.id === "font_color" && getValue("calendar_type") === 'single') {
				bgPage.calendars[bgPage.extractID(bgPage.SINGLE_FEED_URL)].color = '#' + this.value;
				for (var j in bgPage.entries) {
					bgPage.entries[j].color = '#' + this.value;
				}
				bgPage.redraw();
			} else if (this.id === "max_entries") {
				bgPage.refreshFeeds();
			} else if (this.id === "date_format") {
				bgPage.redraw();
			} else if (this.id === "title_date_format") {
				bgPage.setSDTitle();
			} else {
				bgPage.setupCSS();
			}
		};
	}
	for (var i in checkboxFields) {
		var field = checkboxFields[i];
		element = id(field);
		element.checked = getValue(field) === 'true';
		debugMessage("registered checkbox " + field);
		element.onchange = function () {
			debugMessage("checkbox fired " + this.id);
			setValue(this.id, this.checked);
			if (this.id === "show_past_events") {
				chrome.extension.getBackgroundPage().refreshFeeds();
			} else {
				chrome.extension.getBackgroundPage().redraw();
			}
		};
	}
}

function init() {
	installAnalytics();
	_gaq.push(['_trackEvent', 'Options', 'Shown']);
	hideOptionsAuth();

	setText('widget_title', msg('options_title'));
	setText('widget_name', chrome.app.getDetails().name + ' v' + chrome.app.getDetails().version);
	setText('widget_author', chrome.app.getDetails().developer.name);
	setText('font_size', getValue("font_size"));
	loadLanguage();
	selected = JSON.parse(getValue("selected_calendars"));
	initAccount();
	initOptions();
	initSimpleFields();
	if (getValue("calendar_type") === 'selected') {
		resyncCalendars();
	}
	chrome.runtime.onMessage.addListener(function (request, sender) {
		debugMessage("message " + request.status);
		if (request.status === "refresh_end") {
			document.getElementById('refresh_img').style.display = 'none';
		} else if (request.status === "refresh_start") {
			document.getElementById('refresh_img').style.display = 'inline';
		} else if (request.status === "auth_required") {
			showOptionsAuth();
		} else if (request.status === "auth_done") {
			hideOptionsAuth();
		} else if (request.status === "calendars_updated" && getValue("calendar_type") === "selected") {
			showSelectableCalendars();
		}
	});
	if (window.location.search === '?signin') {
		chrome.extension.getBackgroundPage().requestInteractiveAuthToken(function() {});		
	}
}

document.addEventListener('DOMContentLoaded', init);
