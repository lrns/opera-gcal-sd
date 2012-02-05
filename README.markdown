# Opera Speed Dial Google Calendar extension

This extension displays Google Calendar entries in a Speed Dial tile.

This is not an official Google Calendar extension.

## Translators needed!
Instructions on how to translate the extension can be found [here][https://www.dropbox.com/s/8h7hu3zymxjqml4/translation.txt]

## How to use it:

1. Install extension
2. Sign in using your Google calendar account normally (if not yet signed in) or sign in into your Google account inside the preferences of an extension
3. Click 'Refresh calendars' button in options page if you are signed into your Goole account but extension still says 'Click to sign in...'
4. (Optional) Select calendars you want to get entries from:
    * Default - only entries from the default calendar are displayed
	* Own calendars - entries from all user's calendars are displayed
	* All calendars - all user's calendars as well as subscribed calendars, e.g. Holidays
	* Selected - you will be allowed to select calendars to sync. Also you will be able to set colours of calendars to your own preference

5. Set other customisation options the way you like!

## Timezone
Set timezone option to your location if your events have wrong times.


## Support page
Please leave comments/issues in the comments of the extension page.

Source code is available on [github][https://github.com/lrns/opera-gcal-sd]. Feel free to enhance the extension! Contributions are always welcome.


## Acknowledgements
Thanks to [Sam][http://my.opera.com/HuRRaCaNe/about/] for Dutch translation.
Thanks to [Damon][http://achey.net/] for finding and fixing an issue with recurring events in v1.0.1.
Google authentication is based on the code of [Google Reader Notifier][https://addons.opera.com/addons/extensions/details/google-reader-notifier/] extension.
Colour selection is done using [JSColor][http://jscolor.com/] library.
Date formating is done using [Date Formatting And Format Validation][http://www.javascripttoolbox.com/lib/date/index.php] library.


## TODO
* More localisation
* ?

## Limitation
* Notifications (alerts) are not possible due to limitation of Opera Extension API
* Syncing Tasks from Google Calendar is not possible because of limitations of Google Calendar Data API

## Changelog

* 2.1 - localisation implemented. Dutch and Lithuanian translations added. 
* 2.0 - selective sync; a lot of customisation options: colours, date format, timezone, font size, do not wrap long event titles, show today's passed events, show the end time of an event; custom Speed Dial title 
* 1.1.1 - option to choose whether to share browser's session or sign in to another Google account 
* 1.1.0 - sharing browser's session (no separe sign in needed), new options page, 'refresh calendars' button in options page
* 1.0.2 - fix for recurring events
* 1.0.1 - fixed parameters for URL of feeds
* 1.0.0 - Initial release

