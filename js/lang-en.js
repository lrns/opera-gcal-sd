opera.isReady(function(){
function getTranslatedMessage(message) {
	return chrome.i18n.getMessage(message)
}
var getTranslatedMessage = window["getTranslatedMessage"] = getTranslatedMessage;
function updateDate() {
  debugMessage('Dates updated: ' + getTranslatedMessage('months'));
  Date.monthNames = getTranslatedMessage('months').split("|");
  Date.monthAbbreviations = getTranslatedMessage('months_short').split("|");
  Date.dayNames = getTranslatedMessage('weekdays').split("|");
  Date.dayAbbreviations = getTranslatedMessage('weekdays_short').split("|");
}
var updateDate = window["updateDate"] = updateDate;
function resetTranslation() {
	//TODO translatedMessages = {}
  if (opera.extension.bgProcess) {
    opera.extension.bgProcess.redraw();
  } else {
    redraw();
  }
}
var resetTranslation = window["resetTranslation"] = resetTranslation;
function updateTranslation() {
	//TODO
	/*
	var xhr = new XMLHttpRequest();
xhr.onreadystatechange = handleStateChange; // Implemented elsewhere.
xhr.open("GET", chrome.extension.getURL('/config_resources/config.json'), true);
xhr.send();
*/
  resetTranslation();
  updateDate();
  translate();
  if (opera.extension.bgProcess) {
    opera.extension.bgProcess.redraw();
  } else {
    redraw();
  }
}
var updateTranslation = window["updateTranslation"] = updateTranslation;
resetTranslation();
});
