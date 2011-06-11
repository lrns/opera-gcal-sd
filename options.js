var LOGIN_URL = 'https://www.google.com/accounts/ClientLogin'
var LOGIN_ADDITIONAL_PARAMS = 'accountType=HOSTED_OR_GOOGLE&service=cl'

addEventListener('DOMContentLoaded',init,false);

console={log:function(m){window.opera.postError(m)}}
function init(){
	document.title = widget.name + ' - Preferences'
	id('w-name').innerText = widget.name;
	id('w-version').innerText = widget.version;
	id('w-author').innerText = widget.author;


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

	meElement = id('max-entries').value = getMaxEntries();
	meElement.onchange = function(){
		setMaxEntries(meElement.value);
	}

	//var calendarType = getCalendarType();
    //var calendarTypeElement = id('calendar-type');
	//for(i in calendarType)
	//{
		//var calendarValue = calendarTypeElement.options[i];
		//if(calendarValue.value == calendarType){
			//calendarValue.selected = true;
			//break;
		//}
	//}
	
	//calendarTypeElement.onchange = function(){
		//setCalendarType(calendarTypeElement.options[calendarTypeElement.selectedIndex].value);
	//}
	var signInButton = id('signin')
	signInButton.onclick = function() {
		tryLogIn(id('email').value, id('password').value);
	}
	
	var signOutButton = id('signout')
	signOutButton.onclick = function(){
		dropAuth();
		window.location.reload();
	}
	
	id('email').onkeypress = id('password').onkeypress = function(e){if(e.which == 13) id('signin').onclick(e)} 
	
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


