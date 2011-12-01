var LOGIN_URL = 'https://www.google.com/accounts/ClientLogin'
var LOGIN_ADDITIONAL_PARAMS = 'accountType=HOSTED_OR_GOOGLE&service=cl'

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
		opera.extension.bgProcess.refresh();
	}

	var signinRadio = id('separate-signin');
	signinRadio.onchange = function() {
		id('signin-pane').style.display = 'block';
		setValue(ACCOUNT_TYPE, 'signin');
		opera.extension.bgProcess.refresh();
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
	var refreshInterval = getValue(REFRESH_INTERVAL);
    var refreshIntervalElement = id(REFRESH_INTERVAL);
	setListActiveValue(refreshInterval, refreshIntervalElement);

	refreshIntervalElement.onchange = function(){
		setValue(REFRESH_INTERVAL, refreshIntervalElement.options[refreshIntervalElement.selectedIndex].value);
		opera.extension.bgProcess.refresh();
	}

	id('refresh-cal').onclick = function(){
	    document.getElementById('refresh-img').style.display = 'inline';
		opera.extension.bgProcess.refresh();
	};


	var calendarType = getValue(CALENDAR_TYPE);
	var calendarTypeElement = id('calendar-type');
	setListActiveValue(calendarType, calendarTypeElement);
	
	calendarTypeElement.onchange = function(){
		setValue(CALENDAR_TYPE, calendarTypeElement.options[calendarTypeElement.selectedIndex].value);
		opera.extension.bgProcess.refresh();
	}

	id('font-plus').onclick = function(){
	    var size = parseInt(getValue(FONT_SIZE), 10);
		if (size < 72) {
			setValue(FONT_SIZE, size + 1);
		}
		setText('font_size', getValue(FONT_SIZE));
		opera.extension.bgProcess.redraw();
		return false;
	};
	id('font-minus').onclick = function(){
	    var size = parseInt(getValue(FONT_SIZE), 10);
		if (size > 4) {
			setValue(FONT_SIZE, size - 1);
		}
		setText('font_size', getValue(FONT_SIZE));
		opera.extension.bgProcess.redraw();
		return false;
	};
}

function initSimpleFields() {
	var textFields = [ MAX_ENTRIES, BG_COLOR, FONT_COLOR, ALT_FONT_COLOR ];
	var checkboxFields = [ SHOW_PAST_EVENTS, WRAP_LINES ];

	for (var i in textFields) {
		var field = textFields[i];
		element = id(field);
		element.value = getValue(field);
		element.onchange = function(){
			setValue(this.id, this.value);
			if (this.id === MAX_ENTRIES) {
				opera.extension.bgProcess.refresh();
			} else {
				opera.extension.bgProcess.redraw();
			}
		}
	}

	for (var i in checkboxFields) {
		var field = checkboxFields[i];
		element = id(field);
		element.checked = getValue(field);
		element.oninput = function(){
			setValue(this.id, this.checked);
			if (this.id === SHOW_PAST_EVENTS) {
				opera.extension.bgProcess.refresh();
			} else {
				opera.extension.bgProcess.redraw();
			}
		}
	}
}
function init(){

	// populate the title, name, author, ...
	setText('widget-title', 'Options of ' + widget.name);
	setText('widget-name', widget.name + ' v' + widget.version);
	setText('widget-author', widget.author );
	setText('font_size', getValue(FONT_SIZE));

	


	initAccount();
	initOptions();
	initSimpleFields();

	opera.extension.onmessage = function(event){
		var thecatch = event.data;
		if (thecatch === "refresh-end") {
			document.getElementById('refresh-img').style.display = 'none';
		} else if (thecatch === "refresh-start") {
			document.getElementById('refresh-img').style.display = 'inline';
		}
	}



}
function tryLogIn(email, passwd){
	var errorArea = id('error-area');
	var signInButton = id('signin');
	var passwordElement = id('password');
	
	errorArea.style.display = 'none';
	signInButton.value = 'Signing In...';
	signInButton.disabled = true;
	
	logIn(email, passwd, function() {
			window.location.reload();
		}, function(err) {
			signInButton.disabled = false;
			signInButton.value = 'Log In';
			passwordElement.value = '';
			errorArea.style.display = 'block';
			errorArea.innerText = 'Error: ' + err;
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
		opera.extension.bgProcess.refresh();
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


