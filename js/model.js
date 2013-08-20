opera.isReady(function(){
var CAL_URL = window["CAL_URL"] = 'http://www.google.com/reader/view/';
var ALL_FEEDS_URL = window["ALL_FEEDS_URL"] = 'https://www.google.com/calendar/feeds/default/allcalendars/full';
var OWN_FEEDS_URL = window["OWN_FEEDS_URL"] = 'https://www.google.com/calendar/feeds/default/owncalendars/full';
var SINGLE_FEED_URL = window["SINGLE_FEED_URL"] = 'https://www.google.com/calendar/feeds/default/private/full';
var FEED_URL_SUFFIX = window["FEED_URL_SUFFIX"] = '?singleevents=true&orderby=starttime&sortorder=ascending';
var REQUEST_TIMEOUT_MS = window["REQUEST_TIMEOUT_MS"] = 30 * 1000;
function buildFeedURL(prefix) {
  var url = prefix + FEED_URL_SUFFIX;
  url += '&max-results=' + getValue(MAX_ENTRIES);
  var date = new Date();
  if (getValue(SHOW_PAST_EVENTS) === 'true') {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
  }
  url += '&start-min=' + date.toISOString();
  if (getValue(TIME_ZONE) !== 'auto') {
    url += '&ctz=' + getValue(TIME_ZONE);
  }
  debugMessage('URL: ' + url);
  return url;
}
var buildFeedURL = window["buildFeedURL"] = buildFeedURL;
function initCalendars() {
  calendars = {
  };
  if (getValue(CALENDAR_TYPE) === 'single') {
    calendars[extractID(SINGLE_FEED_URL)] = {
      url: SINGLE_FEED_URL,
      title: 'Default',
      color: '#' + getValue(FONT_COLOR),
      synced: false,
      shouldSync: true
    };
  } else if (getValue(CALENDAR_TYPE) === 'selected') {
    refreshCalendars(ALL_FEEDS_URL, function() {
      var selected = JSON.parse(getValue(SELECTED_CALENDARS));
      for (var id in calendars) {
        calendars[id].shouldSync = false;
        if (id in selected) {
          calendars[id].shouldSync = selected[id].shouldSync;
          calendars[id].color = selected[id].color;
        }
      }
      refreshFeeds();
    });
  }
}
var initCalendars = window["initCalendars"] = initCalendars;
function refreshFeeds() {
  debugMessage("update feeds...");
  chrome.runtime.sendMessage({status: 'refresh_start'});
  if (getValue(CALENDAR_TYPE) === 'all') {
    refreshCalendars(ALL_FEEDS_URL, syncCalendars);
  } else if (getValue(CALENDAR_TYPE) === 'own') {
    calendars = {
    };
    refreshCalendars(OWN_FEEDS_URL, syncCalendars);
  } else {
    syncCalendars();
  }
}
var refreshFeeds = window["refreshFeeds"] = refreshFeeds;
function refreshCalendars(url, handler) {
  debugMessage('Refreshing calendar ' + url);
  getFeed(url, function(data) {
    parseCalendars(data);
    handler();
  });
}
var refreshCalendars = window["refreshCalendars"] = refreshCalendars;
function handleMultiFeeds(data) {
  var feedEntries = parseFeed(data);
  for (var i = 0; i < feedEntries.length; i++) {
    newEntries.push(feedEntries[i]);
  }
  var allSynced = true;
  var numCalendars = 0;
  var numSync = 0;
  for (id in calendars) {
    if (calendars[id].shouldSync) {
      numCalendars++;
      if (!calendars[id].synced) {
        allSynced = false;
      } else {
        numSync++;
      }
    }
  }
  debugMessage('Synced: ' + numSync + '/' + numCalendars);
  if (allSynced) {
    if (numCalendars > 1 && newEntries.length > 1) {
      newEntries = newEntries.sort(function(a, b) {
        if (a.start > b.start) return 1;
        if (a.start < b.start) return -1;
        return 0;
      });
    }
    entries = newEntries;
    drawEntries();
	chrome.runtime.sendMessage({status: 'refresh_end'});
  }
}
var handleMultiFeeds = window["handleMultiFeeds"] = handleMultiFeeds;
function syncCalendars() {
  newEntries = [];
  var numToSync = 0;
  for (id in calendars) {
    calendars[id].synced = false;
    if (calendars[id].shouldSync) {
      numToSync++;
      debugMessage("GET calendar " + id + " => " + calendars[id].url);
      getFeed(buildFeedURL(calendars[id].url), handleMultiFeeds);
    }
  }
  if (numToSync === 0) {
    entries = newEntries;
    drawEntries();
    chrome.runtime.sendMessage({status: 'refresh_end'});
  }
}
var syncCalendars = window["syncCalendars"] = syncCalendars;

function getFeed(feedUrl, handler) {
  var xhr = new XMLHttpRequest();
  var abortTimerId = window.setTimeout(function() {
    xhr.abort();
    chrome.runtime.sendMessage({status: 'refresh_end'});
  }, REQUEST_TIMEOUT_MS);
  function handleError(is401) {
    window.clearTimeout(abortTimerId);
    if (is401) {
      displayNoAuth();
    }
    chrome.runtime.sendMessage({status: 'refresh_end'});
  }
  try {
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (xhr.status >= 400 || xhr.status == 0) {
        debugMessage('Error response code: ' + xhr.status + ' ' + xhr.statusText);
        handleError(xhr.status == 401 || xhr.status == 0);
      } else if (xhr.responseXML) {
        debugMessage('Response received: ' + xhr.responseText.substring(0, 50));
        handler(xhr.responseXML);
      } else {
        debugMessage('No responseText!');
        handleError();
      }
    };
    xhr.onerror = function(error) {
      debugMessage('XHR error\n' + error);
      handleError();
    };
    xhr.open("GET", feedUrl, true);
    if (getValue(ACCOUNT_TYPE) != 'share') {
      xhr.setRequestHeader("Authorization", "GoogleLogin auth=" + getValue(USER_AUTH));
    }
    xhr.send(null);
  } catch (e) {
    debugMessage('XHR exception: ' + e);
    handleError();
  }
}
var getFeed = window["getFeed"] = getFeed;

function parseFeed(xml) {
  var calID = extractID(xml.getElementsByTagName("id")[0].childNodes[0].nodeValue);
  debugMessage("Received: " + calID);
  var color = getValue(FONT_COLOR);
  if (calID in calendars) {
    if (calendars[calID].synced) {
      return {
      };
    }
    color = calendars[calID].color;
    calendars[calID].synced = true;
  }
  try {
    var xmlEntries = xml.getElementsByTagName("entry");
    var feedEntries = [];
    for (var i = 0; i < xmlEntries.length; i++) {
      var title = xmlEntries[i].getElementsByTagName('title')[0].childNodes[0].nodeValue;
      var when = xmlEntries[i].getElementsByTagName('when');
      for (var j = 0; j < when.length; j++) {
        if (when[j].parentNode == xmlEntries[i]) {
          var startString = when[j].attributes["startTime"].nodeValue;
          var endString = when[j].attributes["endTime"].nodeValue;
          var fullday = /^\d{4}-\d\d-\d\d$/.test(startString);
          if (!fullday && getValue(TIME_ZONE) !== 'auto') {
            var start = dateFromString(startString);
            var end = dateFromString(endString);
          } else {
            var start = new Date(startString);
            var end = new Date(endString);
          }
          feedEntries.push({
            title: title,
            start: start,
            end: end,
            color: color,
            fullday: fullday,
            calendar: calID
          });
        }
      }
    }
    debugMessage('Parsed ' + feedEntries.length + ' entries');
    return feedEntries;
  } catch (err) {
    debugMessage("Error: " + err);
    return {
    };
  }
}
var parseFeed = window["parseFeed"] = parseFeed;

function parseCalendars(xml) {
  var xmlEntries = xml.getElementsByTagName("entry");
  var newCalendars = {
  };
  for (var i = 0; i < xmlEntries.length; i++) {
    var title = xmlEntries[i].getElementsByTagName('title')[0].childNodes[0].nodeValue;
    var url = xmlEntries[i].getElementsByTagName('content')[0].attributes["src"].nodeValue;
    var color = xmlEntries[i].getElementsByTagName('color')[0].attributes["value"].nodeValue;
    newCalendars[extractID(url)] = {
      url: url,
      title: title,
      color: color,
      synced: false,
      shouldSync: true
    };
  }
  calendars = newCalendars;
  	chrome.runtime.sendMessage({status: 'calendars_updated'});
}
var parseCalendars = window["parseCalendars"] = parseCalendars;

function extractID(url) {
  return url.replace(/https?:\/\/www\.google\.com\/calendar\/feeds\//i, "").replace(/[^\w\s]/gi, '').substring(0, 20);
}
var extractID = window["extractID"] = extractID;

function dateFromString(s) {
  return new Date(parseInt(s.substring(0, 4), 10), parseInt(s.substring(5, 7), 10) - 1, parseInt(s.substring(8, 10), 10), parseInt(s.substring(11, 13), 10), parseInt(s.substring(14, 16), 10), parseInt(s.substring(17, 19), 10));
}
var dateFromString = window["dateFromString"] = dateFromString;

function clone(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  if (obj instanceof Date) {
    var copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }
  if (obj instanceof Array) {
    var copy = [];
    var len = obj.length;
    for (var i = 0; i < len; ++i) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }
  if (obj instanceof Object) {
    var copy = {
    };
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
  }
  throw new Error("Unable to copy obj! Its type isn't supported.");
}
var clone = window["clone"] = clone;
function hash(text) {
  return "xxxxxxxxx";
}
var hash = window["hash"] = hash;
function getDebugText() {
  var debug = {
  };
  calEntries = clone(entries);
  for (i in calEntries) {
    calEntries[i].title = "XXXXXXXXXXXXXX";
    calEntries[i].calendar = hash("cccccccccc");
  }
  var prefs = clone(widget.preferences);
  delete prefs['user_auth'];
  delete prefs['user_email'];
  var debug = {
    url: buildFeedURL('CALENDAR_URL'),
    entries: calEntries,
    preferences: prefs,
    timezoneOffset: new Date().getTimezoneOffset()
  };
  return JSON.stringify(debug);
}
var getDebugText = window["getDebugText"] = getDebugText;
});
