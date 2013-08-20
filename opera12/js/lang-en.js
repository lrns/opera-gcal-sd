var defaultDateFormat = {
	'time' : '',
	'day'  : 'dd NNN',
	'sd-title' : 'EE, d MMM yyyy, H:mm',
	'months-short' : new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
						'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'),
	'months' : new Array('January', 'February', 'March', 'April', 'May', 'June', 
				'July', 'August', 'September', 'October', 'November', 'December'),
	'weekdays-short' : new Array('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
	'weekdays' : new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')
}

var defaultText = {

	'index-title' : 'Google Calendar',
	'description' : 'Google Calendar events in your Speed Dial.',
	'options-title' : 'Options of Google Calendar',

	'refresh-cal' : 'Refresh Calendars',
	'options-account' : 'Account',
	'options-share-session' : 'Share browser\'s session',
	'options-separate-signin' : 'Sign in to another Google account:',
	'options-email' : 'Email',
	'options-password' : 'Password',
	'signin' : 'Sign In',
	'signout' : 'Sign Out',
	'options-signed' : 'You are signed in with your Google account:',
	'options-user-email' : 'Email:',

	'options-options' : 'Options',
	'options-language' : 'Language',
	'options-lang-auto' : 'Auto',


	'options-1-min' : '1 minute',
	'options-5-min' : '5 minutes',
	'options-10-min' : '10 minutes',
	'options-15-min' : '15 minutes',
	'options-30-min' : '30 minutes',
	'options-1-h' : '1 hour',
	'options-5-h' : '5 hours',

	'options-refresh-interval' : 'Refresh interval',
	'options-auto' : 'Auto',
	'options-time-zone' : 'Time zone',
	'options-default-cal' : 'Default calendar',
	'options-own-cals' : 'Own calendars',
	'options-all-cals' : 'All calendars',
	'options-selected-cals' : 'Selected calendars',
	'options-calendars' : 'Calendar(s)',
	'options-all-cal-note' : '*All calendars include subscribed calendars.',
	'options-cals-to-use' : 'Calendars to use',
	'options-appearance' : 'Appearance',
	'options-bg-color' : 'Background color',
	'options-font-color' : 'Font color',
	'options-alt-font-color' : 'Alternative font color (for all day events)',
	'options-mx-entries' : 'Max. entries to display',
	'options-past-events' : 'Show all today\'s events (including passed events)',
	'options-end-time' : 'Show event end time',
	'options-clock-12h' : '12h clock',
	'options-date-format' : 'Date format, see <a target="_blank" href="http://www.javascripttoolbox.com/lib/date/documentation.php">examples</a>',
	'options-title-date' : 'Speed Dial title format, see <a target="_blank" href="http://www.javascripttoolbox.com/lib/date/documentation.php">examples</a>',
	'options-font-size' : 'Font size: ',
	'options-font-px' : 'pixels',
	'options-wrap-lines' : 'Wrap event titles',
	'options-reset-prefs' : 'Reset preferences',
	'options-footer' : 'All connections are done to Google servers via HTTPS protocol. Password is not saved anywhere, it is only used when signing in for the first time.',

	'options-login' : 'Log In',
	'options-error' : 'Error: ',
	'options-signing-in' : 'Signing In...',

	'options-reset-confirm' : 'Are you sure to reset preferences?',
	'options-debug-data' : 'Debug data',

	'view-unknown-error' : 'Unknown error!',
	'view-click-signin' : 'Click to sign in ...',
	'view-signin-prefs' : 'Please sign in inside extension preferences',
	'view-no-events' : 'No events in your calendars'

}

var text = {};
var dateFormat = {};

// these will be overriden in locale files
var translatedDateFormat = {};
var translatedText = {};

function updateDate() {
	console.log('Dates updated: ' + dateFormat['months'][0]);
	Date.monthNames = dateFormat['months'];
	Date.monthAbbreviations = dateFormat['months-short'];
	Date.dayNames = dateFormat['weekdays'];
	Date.dayAbbreviations = dateFormat['weekdays-short'];
}
function resetTranslation() {
	text = {}
	dateFormat = {}

	for (i in defaultDateFormat) {
		dateFormat[i] = defaultDateFormat[i];
	}
	for (i in defaultText) {
		text[i] = defaultText[i];
	}
	updateDate();
	//opera.extension.bgProcess.redraw();
	if (opera.extension.bgProcess) {
		opera.extension.bgProcess.redraw();
	} else {
		redraw();
	}
}

function updateTranslation() {
	resetTranslation();
	for (i in translatedDateFormat) {
		dateFormat[i] = translatedDateFormat[i];
	}
	for (i in translatedText) {
		text[i] = translatedText[i];
	}
	updateDate();
	translate();
	if (opera.extension.bgProcess) {
		opera.extension.bgProcess.redraw();
	} else {
		redraw();
	}
}
resetTranslation();

