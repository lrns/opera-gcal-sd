
function setupCSS() {
	for (var i in document.styleSheets) {
		var sheet = document.styleSheets[i];
		if (sheet.ownerNode && sheet.href == null) {
			sheet.ownerNode.parentNode.removeChild(sheet.ownerNode);
		}
	}
	var cssNode = document.createElement("style");
	cssNode.innerHTML = "body { background-color: #" + getValue("bg_color") + " !important; }\n";
	cssNode.innerHTML += "td.entry { white-space: " + (getValue("wrap_lines") === 'true' ? "normal" : "nowrap") + "; }\n";
	cssNode.innerHTML += "#cal {";
	cssNode.innerHTML += "font-size: " + getValue("font_size") + "px;";
	cssNode.innerHTML += "}\n";
	cssNode.innerHTML += "td.entry_day { color: #" + getValue("font_color") + "; }";
	cssNode.innerHTML += "td.full_day { color: #" + getValue("alt_font_color") + "; }";
	debugMessage(cssNode.innerHTML);
	document.head.appendChild(cssNode);
}

function pad(s) {
	return s < 10 ? '0' + s : s;
}

function onError() {
	document.getElementById('error').innerHTML = msg('view_unknown_error');
	document.getElementById('error').style.display = 'block';
	document.getElementById('cal').style.display = 'none';
	document.getElementById('loading').style.display = 'none';
	chrome.runtime.sendMessage({ status : 'refresh_end' });
}

function showLoading() {
	document.getElementById('error').style.display = 'none';
	document.getElementById('cal').style.display = 'none';
	document.getElementById('loading').style.display = 'block';
}

function displayNoAuth() {
	cachedToken = "";
	var text = msg('view_click_signin');
	if (getValue("account_type") != 'share') {
		text = msg('view_signin_prefs');
	}
	document.getElementById('error').innerHTML = text;
	document.getElementById('error').style.display = 'block';
	document.getElementById('cal').style.display = 'none';
	document.getElementById('loading').style.display = 'none';
	opr.speeddial.update({ url: "options.html?signin"});
	chrome.runtime.sendMessage({ status : 'refresh_end' });
}

function hideAuth() {
	opr.speeddial.update({ url: DEFAULT_SD_URL});
}

/* Example entry:
{  
   "kind":"calendar#event",
   "etag":"\"283..\"",
   "id":"nv..",
   "status":"confirmed",
   "htmlLink":"https://www.google.com/calendar/event?eid=bn...",
   "created":"2014-11-28T01:00:42.000Z",
   "updated":"2014-11-28T01:00:42.315Z",
   "summary":"test event",
   "creator":{  
      "email":"...@gmail.com",
      "displayName":"Test User",
      "self":true
   },
   "organizer":{  
      "email":"...@gmail.com",
      "displayName":"Test User",
      "self":true
   },
   "start":{  
      "dateTime":"2014-12-03T19:00:00-05:00",
      "realDate":"2014-12-04T00:00:00.000Z"
   },
   "end":{  
      "dateTime":"2014-12-03T20:00:00-05:00",
      "realDate":"2014-12-04T01:00:00.000Z"
   },
   "iCalUID":"nv...@google.com",
   "sequence":0,
   "reminders":{  
      "useDefault":true
   },
   "fullday":false
}
*/

function drawEntries() {
	debugMessage('Drawing entries >>>>>');
	var now =  new Date();
	if (typeof entries == 'undefined') {
		return;
	}
	if (entries.length > 0) {
		var today =  new Date();
		var s = '<table id="entries" cellspacing="2" cellpadding="" border="0"><tbody>';
		var num = entries.length < getValue("max_entries") ? entries.length : getValue("max_entries");
		debugMessage('Drawing entries: ' + entries.length);
		for (var i = 0; i < num; i++) {
			var e = entries[i];
			if (e.end.realDate > now || getValue("show_past_events") === 'true') {
				s += '<tr><td class="entry_day" valign="top">';
				if (i > 0 && e.start.realDate.getDate() == entries[i - 1].start.realDate.getDate() && e.start.realDate.getMonth() == entries[i - 1].start.realDate.getMonth()) {
					// previous entry is on the same day, do not display date
					s += '&nbsp;';
				}
				else {
					s += e.start.realDate.format(getDayFormat());
				}
				s += '</td>';
				if (e.fullday) {
					s += '<td valign="top" class="full_day entry" style="background-color: ' + e.color + ';">' + e.summary;
				}
				else {
					s += '<td valign="top" class="entry';
					if (e.end.realDate < now) {
						s += ' dim_event';
					}
					s += '" style="color: ' + e.color + ';">';
					s += '<span class="entry_time">' + e.start.realDate.format(getTimeFormat());
					if (getValue("show_end_time") === 'true') {
						s += '-' + e.end.realDate.format(getTimeFormat());
					}
					s += "</span> ";
					s += e.summary;
				}
				s += '</td></tr>';
			}
		}
		s += "</dl>";
		s += "</tbody></table>";
	}
	else {
		s = '<div class="centertext">' + msg('view_no_events') + '</div>';
	}
	document.getElementById('cal').innerHTML = s;
	document.getElementById('cal').style.display = 'block';
	document.getElementById('error').style.display = 'none';
	document.getElementById('loading').style.display = 'none';
}

function redraw() {
	setupCSS();
	drawEntries();
}

