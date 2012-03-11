var LOGIN_URL = 'https://www.google.com/accounts/ClientLogin'
var LOGIN_ADDITIONAL_PARAMS = 'accountType=HOSTED_OR_GOOGLE&service=cl'
var selected = {};
addEventListener('DOMContentLoaded',init,false);

function id(e){return document.getElementById(e)}
// set the textContent of an element
function setText(id, txt) {
	var e = document.getElementById(id);
	if (e) {
		e.textContent = txt;
	}
}

function setListActiveValue(value, list) {
	for (var i in list) {
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

	console.log('color changed for ' + this.id);
	var calID = this.id.split('_')[1];
	if (calID in selected) {
		selected[calID].color = '#' + this.value;
	} else {
		selected[calID] = { shouldSync : document.getElementById('cal_'+calID).checked, 
			color : '#' + this.value };
	}

	opera.extension.bgProcess.calendars[calID].color = '#' + this.value;
	for (var j in opera.extension.bgProcess.entries) {
		if (opera.extension.bgProcess.entries[j].calendar === calID) {
			opera.extension.bgProcess.entries[j].color = '#'+this.value;
		}
	}

	setValue(SELECTED_CALENDARS, JSON.stringify(selected));
	opera.extension.bgProcess.redraw();
}
function calendarChecked() {

	console.log('checkbox changed for ' + this.id);
	var calID = this.id.split('_')[1];
	if (calID in selected) {
		selected[calID].shouldSync = this.checked;
	} else {
		selected[calID] = { shouldSync : this.checked, 
			color : opera.extension.bgProcess.calendars[calID].color };
	}

	opera.extension.bgProcess.calendars[calID].shouldSync = this.checked;

	setValue(SELECTED_CALENDARS, JSON.stringify(selected));
	opera.extension.bgProcess.refreshFeeds();
}
function showSelectableCalendars() {
	// show pane to select calendars
	document.getElementById('select-calendars').style.display = 'block';
	console.log('select cals...');
	var calendars = opera.extension.bgProcess.calendars;

	document.getElementById('list-of-cals').innerHTML = '';

	for (var id in calendars) {
		var checked = (id in selected) ? selected[id].shouldSync : false;
		var color = (id in selected) ?
			selected[id].color :
			calendars[id].color;
		opera.extension.bgProcess.calendars[id].shouldSync = checked;
		opera.extension.bgProcess.calendars[id].color = color;

		var line = '<p><input type="checkbox" class="check-calendars" name="' + id + '" id="cal_'+id+'" value="1"';
		if (checked) {
			line += 'checked="checked"';
		}
		line += '/>';
		line += '<input type="text" class="color cal-color" name="color_' + id + '" id="color_'+id+'" value="' + color +'"';
		line += '<label for="cal_'+id+'">'+ calendars[id].title +'</label>';

		line += '</p>';
		document.getElementById('list-of-cals').innerHTML += line;
	}
	for (var id in calendars) {
		document.getElementById('cal_'+id).oninput = calendarChecked;
		document.getElementById('color_'+id).onchange = calendarColorChanged;
	}
	opera.extension.bgProcess.refreshFeeds();
	jscolor.bind();
		
}
function resyncCalendars() {
	console.log('select cals1...');
	id('select-calendars').style.display = 'block';
	id('list-of-cals').innerHTML = '<img src="ajax-loader.gif" id="cal-list-loader" />';

	opera.extension.bgProcess.refreshCalendars(
			opera.extension.bgProcess.ALL_FEEDS_URL,
			function(){});
}

function initAccount() {
	var userEmail = getValue(USER_EMAIL);
	if (userEmail){
		id('main-signin').style.display = 'none';
		id('useremail').innerText = (userEmail.indexOf('@')!= -1) ? userEmail : userEmail+'@gmail.com'
	}
	else {
		id('main-signout').style.display = 'none';
	}

	var signInButton = id('signin');
	signInButton.onclick = function() {
		tryLogIn(id('email').value, id('password').value);
	}
	
	var signOutButton = id('signout');
	signOutButton.onclick = function(){
		dropAuth();
		window.location.reload();
	}
	
	id('email').onkeypress = id('password').onkeypress = function(e){if(e.which == 13) id('signin').onclick(e)} 
	

	var shareRadio = id('share-session');
	shareRadio.onchange = function() {
		id('signin-pane').style.display = 'none';
		setValue(ACCOUNT_TYPE, 'share');
		opera.extension.bgProcess.refreshFeeds();
	}

	var signinRadio = id('separate-signin');
	signinRadio.onchange = function() {
		id('signin-pane').style.display = 'block';
		setValue(ACCOUNT_TYPE, 'signin');
		opera.extension.bgProcess.refreshFeeds();
	}

	if (getValue(ACCOUNT_TYPE) === 'share') {
		signinRadio.checked = false;
		shareRadio.checked = true;
	} else {
		shareRadio.checked = false;
		signinRadio.checked = true;
		id('signin-pane').style.display = 'block';
	}
}
function initOptions() {
	var language = getValue(LANGUAGE);
    var languageElement = id(LANGUAGE);
	setListActiveValue(language, languageElement);

	languageElement.onchange = function(){
		setValue(LANGUAGE, languageElement.options[languageElement.selectedIndex].value);
		loadLanguage();
		opera.extension.bgProcess.loadLanguage();
		opera.extension.bgProcess.redraw();
	}

	var refreshInterval = getValue(REFRESH_INTERVAL);
    var refreshIntervalElement = id(REFRESH_INTERVAL);
	setListActiveValue(refreshInterval, refreshIntervalElement);

	refreshIntervalElement.onchange = function(){
		setValue(REFRESH_INTERVAL, refreshIntervalElement.options[refreshIntervalElement.selectedIndex].value);
		opera.extension.bgProcess.refreshFeeds();
	}

	id('refresh-cal').onclick = function(){
	    document.getElementById('refresh-img').style.display = 'inline';
		opera.extension.bgProcess.refreshFeeds();
	}

	var timeZone = getValue(TIME_ZONE);
    var timeZoneElement = id(TIME_ZONE);
	setListActiveValue(timeZone, timeZoneElement);

	timeZoneElement.onchange = function(){
		setValue(TIME_ZONE, timeZoneElement.options[timeZoneElement.selectedIndex].value);
		opera.extension.bgProcess.refreshFeeds();
	}

	var calendarType = getValue(CALENDAR_TYPE);
	var calendarTypeElement = id('calendar-type');
	setListActiveValue(calendarType, calendarTypeElement);
	
	calendarTypeElement.onchange = function(){
		setValue(CALENDAR_TYPE, calendarTypeElement.options[calendarTypeElement.selectedIndex].value);
		if (getValue(CALENDAR_TYPE) === 'selected') {
			resyncCalendars();
		} else {
			id('select-calendars').style.display = 'none';
			opera.extension.bgProcess.calendars = {};
			if (getValue(CALENDAR_TYPE) === 'single') {
				opera.extension.bgProcess.calendars[opera.extension.bgProcess.extractID(opera.extension.bgProcess.SINGLE_FEED_URL)] = 
					{ url : opera.extension.bgProcess.SINGLE_FEED_URL,
						title : 'Default', color : '#'+getValue(FONT_COLOR), 
						synced : false, shouldSync : true };
				
			}
			
			opera.extension.bgProcess.refreshFeeds();
		}
	}

	id('font-plus').onclick = function(){
	    var size = parseInt(getValue(FONT_SIZE), 10);
		if (size < 72) {
			setValue(FONT_SIZE, size + 1);
		}
		id('font-size').value = getValue(FONT_SIZE);
		opera.extension.bgProcess.redraw();
		return false;
	};
	id('font-minus').onclick = function(){
	    var size = parseInt(getValue(FONT_SIZE), 10);
		if (size > 4) {
			setValue(FONT_SIZE, size - 1);
		}
		id('font-size').value = getValue(FONT_SIZE);
		opera.extension.bgProcess.redraw();
		return false;
	};
	id('font-size').onchange = function(){
		//TODO validation
	    var size = this.value;
		setValue(FONT_SIZE, size);
		opera.extension.bgProcess.redraw();
		return false;
	};

	id('reset-prefs').onclick = function() {
		if (confirm(msg('options-reset-confirm'))) {
			resetPrefs();
			opera.extension.bgProcess.redraw();
			opera.extension.bgProcess.refreshFeeds();
			window.location.reload();
		}
		return false;
	};
}

function initSimpleFields() {
	var textFields = [ MAX_ENTRIES, BG_COLOR, FONT_COLOR, ALT_FONT_COLOR, DATE_FORMAT, TITLE_DATE_FORMAT ];
	var checkboxFields = [ SHOW_PAST_EVENTS, WRAP_LINES, SHOW_END_TIME ];

	for (var i in textFields) {
		var field = textFields[i];
		element = id(field);
		element.value = getValue(field);
		element.onchange = function(){
			setValue(this.id, this.value);
			if (this.id === FONT_COLOR && getValue(CALENDAR_TYPE) === 'single') {
				opera.extension.bgProcess.calendars[opera.extension.bgProcess.extractID(opera.extension.bgProcess.SINGLE_FEED_URL)].color = '#'+this.value;
				for (var j in opera.extension.bgProcess.entries) {
					opera.extension.bgProcess.entries[j].color = '#'+this.value;
				}
				opera.extension.bgProcess.redraw();
			} else if (this.id === MAX_ENTRIES) {
				opera.extension.bgProcess.refreshFeeds();
			} else if (this.id === DATE_FORMAT) {
				opera.extension.bgProcess.redraw();
			} else if (this.id === TITLE_DATE_FORMAT) {
				opera.extension.bgProcess.setSDTitle();
			} else {
				opera.extension.bgProcess.setupCSS();
			}
		}
	}

	for (var i in checkboxFields) {
		var field = checkboxFields[i];
		element = id(field);
		element.checked = getValue(field) === 'true';
		element.oninput = function(){
			setValue(this.id, this.checked);
			if (this.id === SHOW_PAST_EVENTS) {
				opera.extension.bgProcess.refreshFeeds();
			} else {
				opera.extension.bgProcess.redraw();
			}
		}
	}
}
function init(){

	// populate the title, name, author, ...
	setText('widget-title', msg('options-title'));
	setText('widget-name', widget.name + ' v' + widget.version);
	setText('widget-author', widget.author);
	setText('font-size', getValue(FONT_SIZE));

	loadLanguage();

	selected = JSON.parse(getValue(SELECTED_CALENDARS));

	initAccount();
	initOptions();
	initSimpleFields();

	if (getValue(CALENDAR_TYPE) === 'selected') {
		resyncCalendars();
	}

	opera.extension.onmessage = function(event){
		var thecatch = event.data;
		if (thecatch === "refresh-end") {
			document.getElementById('refresh-img').style.display = 'none';
		} else if (thecatch === "refresh-start") {
			document.getElementById('refresh-img').style.display = 'inline';
		} else if (thecatch === "calendars-updated" && getValue(CALENDAR_TYPE) === "selected") {
			showSelectableCalendars();
		}
	}


}
function tryLogIn(email, passwd){
	var errorArea = id('error-area');
	var signInButton = id('signin');
	var passwordElement = id('password');
	
	errorArea.style.display = 'none';
	signInButton.value = msg('options-signing-in');
	signInButton.disabled = true;
	
	logIn(email, passwd, function() {
			window.location.reload();
		}, function(err) {
			signInButton.disabled = false;
			signInButton.value = msg('options-login');
			passwordElement.value = '';
			errorArea.style.display = 'block';
			errorArea.innerText = msg('options-error') + err;
		})
}
function logIn(email, passwd, onSuccess, onError)
{
    console.log('Log in...')
    var xhr = new XMLHttpRequest()
    
    function handleSuccess(responseText){
		console.log('Logged in as ' + email);
    	setValue(USER_AUTH, responseText.match(/Auth=(.+)/)[1]);
    	setValue(USER_EMAIL, email);
		opera.extension.bgProcess.refreshFeeds();
		onSuccess();
    }
    function handleError(){
    	console.log('Login error');
    	var err = xhr.status + '/' + xhr.statusText + '\n';
    	err += xhr.responseText.match(/Error=(.+)\n/)[1];
    	onError(err);
    }
	try{
    	xhr.onreadystatechange = function() {
        	if (xhr.readyState != 4)
            	return
            if (xhr.status >= 400) {
          		console.log('Error response code: ' + xhr.status + '/' + xhr.statusText);
          		handleError(/*xhr.status + '/' + xhr.statusText*/);
        	} else if (xhr.responseText) {
          		console.log('responseText: ' + xhr.responseText.substring(0, 200) + '...');
          		handleSuccess(xhr.responseText);
        	} else {
          		console.log('No responseText!');
          		handleError();
			}
    	}
    
    	var url = LOGIN_URL + '?Email=' + encodeURIComponent(email) + '&Passwd=' + encodeURIComponent(passwd) +
    			  '&' + LOGIN_ADDITIONAL_PARAMS;
    	xhr.open("POST", url , true)
    	xhr.send(null)
    } catch (e) {
    	console.log('XHR exception: ' + e)
    	handleError()
    }
}


