# Opera Speed Dial Google Calendar extension

This extension displays Google Calendar entries in a Speed Dial tile.

This is an unofficial Google Calendar extension.

Homepage - https://addons.opera.com/en/extensions/details/google-calendar/

## Translators needed!
To translate the extension to your language, please translate messages in  the following language file (only "message" part!) https://gist.github.com/lrns/6287939 and send the translated file to me (e.g. paste the translated messages or URL in the comments).


## How to use it:

1. Install extension
2. Click on the Speed Dial or Sign in Options page, you will need to approve "Manager Calendars" permission for "Opera Google Calendar Extension" in the popup window
3. Click 'Refresh calendars' button in options page if you are signed into your Goole account but extension still says 'Click to sign in...'
4. (Optional) Select calendars you want to get entries from:
	* All calendars - all user's calendars as well as subscribed calendars, e.g. Holidays
	* Own calendars - entries from all user's calendars are displayed
	* Selected - you will be allowed to select calendars to sync. Also you will be able to set colours of calendars to your own preference

5. Change other customisation options as you like!

## Timezone
Set timezone option to your location if your events have wrong start/end times.


## Support page
Please leave comments/issues in the comments of the extension page.

Source code is available on github [https://github.com/lrns/opera-gcal-sd]. Contributions are always welcome!


## Acknowledgements
* Google authentication is based on the code of Google Reader Notifier [https://addons.opera.com/addons/extensions/details/google-reader-notifier/] extension.
* Colour selection is done using JSColor [http://jscolor.com/] library.
* Date formating is done using http://www.javascripttoolbox.com/lib/date/index.php library.


## Limitations
* Native notifications are not (currently) possible due to limitations of Opera Extension API
* Syncing Tasks from Google Calendar is not possible because of limitations of Google Calendar Data API

## Changelog
* 3.1 - Updated for the new Google Calendar API V3
* 3.0 - Updated for Opera 15+, added Polish translation
* 2.5 - Estonian, Italian and Russian translations
* 2.4 - fixed time zone settings, added German and Japanese translations, 12h clock option
* 2.3 - Czech translation, more debug options
* 2.2 - option to change language independently from browser's language. Turkish translation
* 2.1 - localisation implemented. Dutch and Lithuanian translations added. 
* 2.0 - selective sync; a lot of customisation options: colours, date format, timezone, font size, do not wrap long event titles, show today's passed events, show the end time of an event; custom Speed Dial title 
* 1.1.1 - option to choose whether to share browser's session or sign in to another Google account 
* 1.1.0 - sharing browser's session (no separe sign in needed), new options page, 'refresh calendars' button in options page
* 1.0.2 - fix for recurring events
* 1.0.1 - fixed parameters for URL of feeds
* 1.0.0 - Initial release

