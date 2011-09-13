var LOGIN_URL = 'https://www.google.com/accounts/ClientLogin'
var LOGIN_ADDITIONAL_PARAMS = 'accountType=HOSTED_OR_GOOGLE&service=cl'

addEventListener('DOMContentLoaded',init,false);

// set the textContent of an element
function setText(id, txt) {
	var e = document.getElementById(id);
	if(e) {
		e.textContent = txt;
	}
}

function init(){

	// populate the title, name, author, ...
	setText( 'widget-title', 'Options of ' + widget.name);
	setText( 'widget-name', widget.name + ' v' + widget.version);
	setText( 'widget-author', widget.author );

	userEmail = getUserEmail();
	if (userEmail){
		id('main-signin').style.display = 'none';
		id('useremail').innerText = (userEmail.indexOf('@')!= -1) ? userEmail : userEmail+'@gmail.com'
	}
	else {
		id('main-signout').style.display = 'none';
	}
	
	var refreshInterval = getRefreshInterval();
    var refreshIntervalElement = id('refresh-interval');
	for(i in refreshIntervalElement)
	{
		var refreshValue = refreshIntervalElement.options[i];
		if(refreshValue.value == refreshInterval){
			refreshValue.selected = true;
			break;
		}
	}

	refreshIntervalElement.onchange = function(){
		setRefreshInterval(refreshIntervalElement.options[refreshIntervalElement.selectedIndex].value);
		opera.extension.bgProcess.refresh();
	}

	id('refresh-cal').onclick = function(){
	    document.getElementById('refresh-img').style.display = 'inline';
		opera.extension.bgProcess.refresh();
	}

	meElement = id('max-entries');
	meElement.value = getMaxEntries();
	meElement.oninput = function(){
		setMaxEntries(meElement.value);
		opera.extension.bgProcess.refresh();
	}

	var calendarType = getCalendarType();
	var calendarTypeElement = id('calendar-type');
	for(i in calendarType)
	{
		var calendarValue = calendarTypeElement.options[i];
		if(calendarValue.value == calendarType){
			calendarValue.selected = true;
			break;
		}
	}
	
	calendarTypeElement.onchange = function(){
		setCalendarType(calendarTypeElement.options[calendarTypeElement.selectedIndex].value);
		opera.extension.bgProcess.refresh();
	}


	opera.extension.onmessage = function(event){
		var thecatch = event.data;
		if (thecatch === "refresh-end") {
			document.getElementById('refresh-img').style.display = 'none';
		} else if (thecatch === "refresh-start") {
			document.getElementById('refresh-img').style.display = 'inline';
		}
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
		setAccountType('share');
		opera.extension.bgProcess.refresh();
	}

	var signinRadio = id('separate-signin');
	signinRadio.onchange = function() {
		id('signin-pane').style.display = 'block';
		setAccountType('signin');
		opera.extension.bgProcess.refresh();
	}

	if (getAccountType() === 'share') {
		signinRadio.checked = false;
		shareRadio.checked = true;
	} else {
		shareRadio.checked = false;
		signinRadio.checked = true;
		id('signin-pane').style.display = 'block';
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
    	setUserAuth(responseText.match(/Auth=(.+)/)[1]);
    	setUserEmail(email);
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
function id(e){return document.getElementById(e)}


