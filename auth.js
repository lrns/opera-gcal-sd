var LOGIN_URL = 'https://www.google.com/accounts/ClientLogin'
var LOGIN_ADDITIONAL_PARAMS = 'accountType=HOSTED_OR_GOOGLE&service=reader'
var TITLE_UNREAD_COUNT_RE = /\s+\((\d+)(\+?)\)$/; 
var READER_URL = 'http://www.google.com/reader/view/';
var READER_URL_RE = /^https?:\/\/www\.google\.[^\/]+\/reader\/view\//
var REQUEST_URL_ =
	'http://www.google.com/reader/api/0/unread-count' +
	'?output=json&client=chromenotifier&refresh=true';

var READING_LIST_RE_ =
	new RegExp('user/[\\d]+/state/com\\.google/reading-list');

var REQUEST_TIMEOUT_MS_ = 30 * 1000; // 30 seconds

var lastCountText = 'start';
var requestTimeout;
var isSignedIn = false;

function init()
{
	var ToolbarUIItemProperties = {
		title: "Google Reader Notifier",
		icon: getSignOutIcon(),
		onclick: function(){
			// Open Options if not Signed In
			if(!isSignedIn){
				if(opera.extension.tabs)
					opera.extension.tabs.create({url: "options.html", focused: true});
				return;
			}

			// Do nothing if Google Reader is in current focused tab
			if( opera.extension.tabs &&
				opera.extension.tabs.getFocused() &&
				READER_URL_RE.exec(opera.extension.tabs.getFocused().url) )
					return;
			
			/* Unfortunately this code does not work with Opera 11.01
			// Try to find Google Reader tab
			var windows = opera.extension.windows.getAll()
			for(i in windows){
				var tabs = windows[i].tabs
				for(j in tabs){
					if(READER_URL_RE.exec(tabs[j].url)){
						tabs[j].update({focused: true});
						return;
					}
				}
			}*/

			// Otherwise open Google Reader in new focused tab
			if(opera.extension.tabs)
				opera.extension.tabs.create({url: READER_URL, focused: true});
		},
		badge: {
			display: "block",
			textContent: "",
			color: "white",
			backgroundColor: getSignOutBadgeColor()
		}
	}
	theButton = opera.contexts.toolbar.createItem(ToolbarUIItemProperties)
	opera.contexts.toolbar.addItem(theButton)
	
	// listen to storage events
	addEventListener( 'storage', storageHandler, false );
	function storageHandler( e )
	{
		// check if the storage effected is the widget.preferences
		if( e.storageArea!==widget.preferences )
			return;

		if( e.key == USER_AUTH || e.key == SIGN_IN_ICON){
			if(getUserAuth()){
				startRequest();
			}
			else {
				if (requestTimeout) {
					window.clearInterval(requestTimeout);
				}
				requestTimeout = null;
				showSignedOut(true); // no error
			}
		}
	}
	
	// Try to get unread count from current focused tab every X sec
	window.setInterval(function(){
		var tab = opera.extension.tabs.getFocused();
		if (!tab || !READER_URL_RE.exec(tab.url) || !getUserAuth())
			return;
		var match = TITLE_UNREAD_COUNT_RE.exec(tab.title);
		var currentUnread = (match && match[1]) ? parseInt(match[1], 10) : 0;
		updateUnreadCount(currentUnread, (match && match[2] && match[2] == '+'));
		scheduleRequest();
	}, getTabRefreshInterval())
	
	if(getUserAuth())
		startRequest()
}

function startRequest(opt_noSchedule) {
	
//	loadingAnimation.start();

	if (requestTimeout) {
		window.clearTimeout(requestTimeout);
	}
	requestTimeout = null;
	getUnreadCount(
		function(count, isMax) {
			//loadingAnimation.stop();
			updateUnreadCount(count, isMax);
			if (!opt_noSchedule) {
				scheduleRequest();
			}
		},
		function(opt_isSignedOut) {
			//loadingAnimation.stop();
			showSignedOut();
			if (!opt_noSchedule) {
				scheduleRequest(!opt_isSignedOut);
			}
			// TODO: test this code
			if(opt_isSignedOut)
				dropAuth();
		}
	);
}
function getUnreadCount(onSuccess, onError)
{
	var xhr = new XMLHttpRequest()
	var abortTimerId = window.setTimeout(function() {
		xhr.abort();
		onError();
	}, REQUEST_TIMEOUT_MS_);

	function handleSuccess(jsonText) {
		window.clearTimeout(abortTimerId);
		var json
		try	{
			json = JSON.parse(xhr.responseText)
		} catch (e) {
			console.log('JSON parse exception: ' + e);
			handleError();
			return;
		}
		
		// Find the reading list unread count
		for (var i = 0, stream; stream = json.unreadcounts[i]; i++)
		{
			if (READING_LIST_RE_.test(stream.id)) {
				onSuccess(stream.count, stream.count >= json.max);
				return;
			}
		}
		
		// Fallthrough: we couldn't find the reading list unread count, assume it's
		// 0 (items with a 0 unread count are not output)
		onSuccess(0, false);
	}
	function handleError(opt_isSignedOut) {
		window.clearTimeout(abortTimerId);
		onError(opt_isSignedOut);
	}

	try{
		xhr.onreadystatechange = function() {
			if (xhr.readyState != 4)
				return

			if (xhr.status >= 400) {
				console.log('Error response code: ' + xhr.status + '/' + xhr.statusText);
				handleError(xhr.status == 401);
			} else if (xhr.responseText) {
				console.log('responseText: ' + xhr.responseText.substring(0, 200) + '...');
				handleSuccess(xhr.responseText);
			} else {
				console.log('No responseText!');
				handleError();
			}
		}
		xhr.onerror = function(error) {
			console.log('XHR error\n' + error);
			handleError();
		}
		xhr.open("GET", REQUEST_URL_, true)
		xhr.setRequestHeader("Authorization","GoogleLogin auth=" + getUserAuth())
		xhr.send(null)
	} catch(e) {
		console.log('XHR exception: ' + e);
		handleError();
	}
}
function updateUnreadCount(count, isMax){
	setIcon(getSignInIcon())
	setBadgeBackgroundColor(getSignInBadgeColor())
	isSignedIn = true

	// show '999+' instead of '1000+' as it doesn't fit the badge
	if(count > 999) {
		count = 999;
		isMax = true;
	}

	var countText = ''
	if (count > 0) {
		countText = count + ''
		if (isMax) {
			countText += '+'
		}
	}

	if (countText == lastCountText) {
		return;
	}

	lastCountText = countText

	setBadgeText(countText)
}
function showSignedOut(opt_noError) {
	isSignedIn = false;
	setIcon(getSignOutIcon());
	setBadgeBackgroundColor(getSignOutBadgeColor());

	lastCountText = (opt_noError) ? '' : '?';
	setBadgeText(lastCountText);
}
function scheduleRequest(opt_rapidRequest) {
	if (requestTimeout) {
		window.clearInterval(requestTimeout);
	}

	var interval = getRefreshInterval();
	// Refresh more often if the previous request ended with error,
	// so that we can pick up the unread count faster
	if (opt_rapidRequest) {
		interval *= .1;
	}
	console.log('scheduling request in ' + interval + 'ms');
	requestTimeout = window.setTimeout(startRequest, interval);
}

function setBadgeText(s){theButton.badge.textContent=/*s*/(s.length<=2&&s.length>0)?' '+s+' ':s}
function setBadgeBackgroundColor(c){theButton.badge.backgroundColor=c}
function setIcon(i){theButton.icon=i}
function setTitle(s){theButton.title=s}