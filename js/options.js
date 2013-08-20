opera.isReady(function () {
    var LOGIN_URL = window["LOGIN_URL"] = 'https://www.google.com/accounts/ClientLogin';
    var LOGIN_ADDITIONAL_PARAMS = window["LOGIN_ADDITIONAL_PARAMS"] = 'accountType=HOSTED_OR_GOOGLE&service=cl';
    var selected = window["selected"] = {
    };
    addEventListener('DOMContentLoaded',  init, false);
    function id(e) {
        return document.getElementById(e);
    }
    var id = window["id"] = id;
    function setText(id, txt) {
        var e = document.getElementById(id);
        if (e) {
            e.textContent = txt;
        }
    }
    var setText = window["setText"] = setText;
	
    function setListActiveValue(value, list) {
        for (var i in list) {
            var listValue = list.options[i];
            if (listValue.value == value) {
                listValue.selected = true;
                return;
            }
        }
    }
	
    var setListActiveValue = window["setListActiveValue"] = setListActiveValue;
    function contains(obj, list) {
        for (var i = 0; i < list.length; i++) {
            if (list[i] === obj) {
                return true;
            }
        }
        return false;
    }
	
    var contains = window["contains"] = contains;
    function calendarColorChanged() {
        debugMessage('color changed for ' + this.id);
        var calID = this.id.split('_')[1];
        if (calID in selected) {
            selected[calID].color = '#' + this.value;
        }
        else {
            selected[calID] = { shouldSync: document.getElementById('cal_' + calID).checked, color: '#' + this.value };
        }
        opera.extension.bgProcess.calendars[calID].color = '#' + this.value;
        for (var j in opera.extension.bgProcess.entries) {
            if (opera.extension.bgProcess.entries[j].calendar === calID) {
                opera.extension.bgProcess.entries[j].color = '#' + this.value;
            }
        }
        setValue(selected_calendars, JSON.stringify(selected));
        opera.extension.bgProcess.redraw();
    }
    var calendarColorChanged = window["calendarColorChanged"] = calendarColorChanged;
    function calendarChecked() {
        debugMessage('checkbox changed for ' + this.id);
        var calID = this.id.split('_')[1];
        if (calID in selected) {
            selected[calID].shouldSync = this.checked;
        }
        else {
            selected[calID] = { shouldSync: this.checked, color: opera.extension.bgProcess.calendars[calID].color };
        }
        opera.extension.bgProcess.calendars[calID].shouldSync = this.checked;
        setValue(selected_calendars, JSON.stringify(selected));
        opera.extension.bgProcess.refreshFeeds();
    }
    var calendarChecked = window["calendarChecked"] = calendarChecked;
	
    function showSelectableCalendars() {
        document.getElementById('select_calendars').style.display = 'block';
        debugMessage('select cals...');
        var calendars = opera.extension.bgProcess.calendars;
        document.getElementById('list_of_cals').innerHTML = '';
        for (var id in calendars) {
            var checked = (id in selected) ? selected[id].shouldSync : false;
            var color = (id in selected) ? selected[id].color : calendars[id].color;
            opera.extension.bgProcess.calendars[id].shouldSync = checked;
            opera.extension.bgProcess.calendars[id].color = color;
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
            document.getElementById('cal_' + id).oninput = calendarChecked;
            document.getElementById('color_' + id).onchange = calendarColorChanged;
        }
        opera.extension.bgProcess.refreshFeeds();
        jscolor.bind();
    }
    var showSelectableCalendars = window["showSelectableCalendars"] = showSelectableCalendars;
	
    function resyncCalendars() {
        debugMessage('select cals1...');
        id('select_calendars').style.display = 'block';
        id('list_of_cals').innerHTML = '<img src="img/ajax_loader.gif" id="cal_list_loader" />';
        opera.extension.bgProcess.refreshCalendars(opera.extension.bgProcess.ALL_FEEDS_URL, function () {});
    }
    var resyncCalendars = window["resyncCalendars"] = resyncCalendars;
	
    function initAccount() {
        var userEmail = getValue("user_email");
        if (userEmail) {
            id('main_signin').style.display = 'none';
            id('useremail').innerText = (userEmail.indexOf('@') != _1) ? userEmail : userEmail + '@gmail.com';
        } else {
            id('main_signout').style.display = 'none';
        }
        var signInButton = id('signin');		
        signInButton.onclick = function () {
            tryLogIn(id('email').value, id('password').value);
        };
		
        var signOutButton = id('signout');		
        signOutButton.onclick = function () {
            dropAuth();
            window.location.reload();
        };
		
        id('email').onkeypress = id('password').onkeypress = function (e) {
            if (e.which == 13)id('signin').onclick(e);
        };
		
        var shareRadio = id('share_session');
        shareRadio.onchange = function () {
            id('signin_pane').style.display = 'none';
            setValue("account_type", 'share');
            opera.extension.bgProcess.refreshFeeds();
        };
		
        var signinRadio = id('separate_signin');
        signinRadio.onchange = function () {
            id('signin_pane').style.display = 'block';
            setValue("account_type", 'signin');
            opera.extension.bgProcess.refreshFeeds();
        };
        if (getValue("account_type") === 'share') {
            signinRadio.checked = false;
            shareRadio.checked = true;
        }
        else {
            shareRadio.checked = false;
            signinRadio.checked = true;
            id('signin_pane').style.display = 'block';
        }
    }
    var initAccount = window["initAccount"] =  initAccount;
	
    function initOptions() {
        var language = getValue("language");
        var languageElement = id(language);
        setListActiveValue(language, languageElement);
        languageElement.onchange = function () {
            setValue(language, languageElement.options[languageElement.selectedIndex].value);
            loadLanguage();
            opera.extension.bgProcess.loadLanguage();
        };
        var refreshInterval = getValue("refresh_interval");
        var refreshIntervalElement = id("refresh_interval");
        setListActiveValue(refreshInterval, refreshIntervalElement);
        refreshIntervalElement.onchange = function () {
            setValue("refresh_interval", refreshIntervalElement.options[refreshIntervalElement.selectedIndex].value);
            opera.extension.bgProcess.refreshFeeds();
        };
        id('refresh_cal').onclick = function () {
            document.getElementById('refresh_img').style.display = 'inline';
            opera.extension.bgProcess.refreshFeeds();
        };
        var timeZone = getValue("time_zone");
        var timeZoneElement = id(time_zone);
        setListActiveValue(timeZone, timeZoneElement);
        timeZoneElement.onchange = function () {
            setValue(time_zone, timeZoneElement.options[timeZoneElement.selectedIndex].value);
            opera.extension.bgProcess.refreshFeeds();
        };
        var calendarType = getValue("calendar_type");
        var calendarTypeElement = id('calendar_type');
        setListActiveValue(calendarType, calendarTypeElement);
        calendarTypeElement.onchange = function () {
            setValue(calendar_type, calendarTypeElement.options[calendarTypeElement.selectedIndex].value);
            if (getValue("calendar_type") === 'selected') {
                resyncCalendars();
            } else {
                id('select_calendars').style.display = 'none';
                opera.extension.bgProcess.calendars = {};
                if (getValue("calendar_type") === 'single') {
                    opera.extension.bgProcess.calendars[opera.extension.bgProcess.extractID(opera.extension.bgProcess.SINGLE_FEED_URL)] = {
						url : opera.extension.bgProcess.SINGLE_FEED_URL, title : 'Default', color : '#' + getValue("font_color"), synced : false, shouldSync : true };
                }
                opera.extension.bgProcess.refreshFeeds();
            }
        };
        id('font_plus').onclick = function () {
            var size = parseInt(getValue("font_size"), 10);
            if (size < 72) {
                setValue(font_size, size + 1);
            }
            id('font_size').value = getValue("font_size");
            opera.extension.bgProcess.redraw();
            return false;
        };
        id('font_minus').onclick = function () {
            var size = parseInt(getValue("font_size"), 10);
            if (size > 4) {
                setValue(font_size, size_1);
            }
            id('font_size').value = getValue("font_size");
            opera.extension.bgProcess.redraw();
            return false;
        };
        id('font_size').onchange = function () {
            var size = this.value;
            setValue(font_size, size);
            opera.extension.bgProcess.redraw();
            return false;
        };
        id('reset_prefs').onclick = function () {
            if (confirm(msg('options_reset_confirm'))) {
                resetPrefs();
                opera.extension.bgProcess.redraw();
                opera.extension.bgProcess.refreshFeeds();
                window.location.reload();
            }
            return false;
        };
        id('debug_data').onclick = function () {
            opera.extension.bgProcess.showDebugData();
            return false;
        };
    }
    var initOptions = window["initOptions"] =  initOptions;
    function initSimpleFields() {
        var textFields = [max_entries, bg_color, font_color, alt_font_color, date_format, title_date_format];
        var checkboxFields = [show_past_events, wrap_lines, show_end_time, clock_12h];
        for (var i in textFields) {
            var field = textFields[i];
            element = id(field);
            element.value = getValue("field");
            element.onchange = function () {
                setValue(this.id, this.value);
                if (this.id === font_color && getValue("calendar_type") === 'single') {
                    opera.extension.bgProcess.calendars[opera.extension.bgProcess.extractID(opera.extension.bgProcess.SINGLE_FEED_URL)].color = '#' + this.value;
                    for (var j in opera.extension.bgProcess.entries) {
                        opera.extension.bgProcess.entries[j].color = '#' + this.value;
                    }
                    opera.extension.bgProcess.redraw();
                }
                else if (this.id === max_entries) {
                    opera.extension.bgProcess.refreshFeeds();
                }
                else if (this.id === date_format) {
                    opera.extension.bgProcess.redraw();
                }
                else if (this.id === title_date_format) {
                    opera.extension.bgProcess.setSDTitle();
                }
                else {
                    opera.extension.bgProcess.setupCSS();
                }
            };
        }
        for (var i in checkboxFields) {
            var field = checkboxFields[i];
            element = id(field);
            element.checked = getValue("field") === 'true';
            element.oninput = function () {
                setValue(this.id, this.checked);
                if (this.id === show_past_events) {
                    opera.extension.bgProcess.refreshFeeds();
                }
                else {
                    opera.extension.bgProcess.redraw();
                }
            };
        }
    }
    var initSimpleFields = window["initSimpleFields"] =  initSimpleFields;
    function init() {
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
            if (request.line === "refresh_end") {
                document.getElementById('refresh_img').style.display = 'none';
            }
            else if (request.line === "refresh_start") {
                document.getElementById('refresh_img').style.display = 'inline';
            }
            else if (request.line === "calendars_updated" && getValue("calendar_type") === "selected") {
                showSelectableCalendars();
            }
        }
        );
    }
    var init = window["init"] =  init;
    function tryLogIn(email, passwd) {
        var errorArea = id('error_area');
        var signInButton = id('signin');
        var passwordElement = id('password');
        errorArea.style.display = 'none';
        signInButton.value = msg('options_signing_in');
        signInButton.disabled = true;
        logIn(email, passwd, function () {
            window.location.reload();
        }
		, function (err) {
            signInButton.disabled = false;
            signInButton.value = msg('options_login');
            passwordElement.value = '';
            errorArea.style.display = 'block';
            errorArea.innerText = msg('options_error') + err;
        }
        );
    }
    var tryLogIn = window["tryLogIn"] = tryLogIn;
	
    function logIn(email, passwd, onSuccess, onError) {
        debugMessage('Log in...');
        var xhr =  new XMLHttpRequest();
        function handleSuccess(responseText) {
            debugMessage('Logged in as ' + email);
            setValue("user_auth", responseText.match(/Auth=(.+)/)[1]);
            setValue("user_email", email);
            opera.extension.bgProcess.refreshFeeds();
            onSuccess();
        }
        function handleError() {
            debugMessage('Login error');
            var err = xhr.status + '/' + xhr.statusText + '\n';
            err += xhr.responseText.match(/Error=(.+)\n/)[1];
            onError(err);
        }
        try {
            xhr.onreadystatechange = function () {
                if (xhr.readyState != 4)return;
                if (xhr.status >= 400) {
                    debugMessage('Error response code: ' + xhr.status + '/' + xhr.statusText);
                    handleError();
                }
                else if (xhr.responseText) {
                    debugMessage('responseText: ' + xhr.responseText.substring(0, 200) + '...');
                    handleSuccess(xhr.responseText);
                }
                else {
                    debugMessage('No responseText!');
                    handleError();
                }
            };
            var url = LOGIN_URL + '?Email=' + encodeURIComponent(email) + '&Passwd=' + encodeURIComponent(passwd) + '&' + LOGIN_ADDITIONAL_PARAMS;
            xhr.open("POST", url, true);
            xhr.send(null);
        }
        catch (e) {
            debugMessage('XHR exception: ' + e);
            handleError();
        }
    }
    var logIn = window["logIn"] = logIn;
}
);
