opera.isReady(function(){
function setupCSS() {
  for (var i in document.styleSheets) {
    var sheet = document.styleSheets[i];
    if (sheet.ownerNode && sheet.href == null) {
      sheet.ownerNode.parentNode.removeChild(sheet.ownerNode);
    }
  }
  var cssNode = document.createElement("style");
  cssNode.innerHTML = "body { background-color: #" + getValue(BG_COLOR) + " !important; }\n";
  cssNode.innerHTML += "td.entry { white-space: " + (getValue(WRAP_LINES) === 'true' ? "normal" : "nowrap") + "; }\n";
  cssNode.innerHTML += "#cal {";
  cssNode.innerHTML += "font-size: " + getValue(FONT_SIZE) + "px;";
  cssNode.innerHTML += "}\n";
  cssNode.innerHTML += "td.entry_day { color: #" + getValue(FONT_COLOR) + "; }";
  cssNode.innerHTML += "td.full_day { color: #" + getValue(ALT_FONT_COLOR) + "; }";
  debugMessage(cssNode.innerHTML);
  document.head.appendChild(cssNode);
}
var setupCSS = window["setupCSS"] = setupCSS;
function pad(s) {
  return s < 10 ? '0' + s : s;
}
var pad = window["pad"] = pad;
function onError() {
  document.getElementById('error').innerHTML = msg('view_unknown_error');
  document.getElementById('error').style.display = 'block';
  document.getElementById('cal').style.display = 'none';
  document.getElementById('loading').style.display = 'none';
	chrome.runtime.sendMessage({status: 'refresh_end'});
}
var onError = window["onError"] = onError;
function showLoading() {
  document.getElementById('error').style.display = 'none';
  document.getElementById('cal').style.display = 'none';
  document.getElementById('loading').style.display = 'block';
}
var showLoading = window["showLoading"] = showLoading;
function displayNoAuth() {
  var text = msg('view_click_signin');
  if (getValue(ACCOUNT_TYPE) != 'share') {
    text = msg('view_signin_prefs');
  }
  document.getElementById('error').innerHTML = text;
  document.getElementById('error').style.display = 'block';
  document.getElementById('cal').style.display = 'none';
  document.getElementById('loading').style.display = 'none';
	chrome.runtime.sendMessage({status: 'refresh_end'});
}
var displayNoAuth = window["displayNoAuth"] = displayNoAuth;
function drawEntries() {
  debugMessage('Drawing entries >>>>>');
  var now = new Date();
  if (typeof entries == 'undefined') {
    return;
  }
  if (entries.length > 0) {
    var today = new Date();
    var s = '<table id="entries" cellspacing="2" cellpadding="" border="0"><tbody>';
    var num = entries.length < getValue(MAX_ENTRIES) ? entries.length : getValue(MAX_ENTRIES);
    debugMessage('Drawing entries: ' + entries.length);
    for (var i = 0; i < num; i++) {
      var e = entries[i];
      if (e.end > now || getValue(SHOW_PAST_EVENTS) === 'true') {
        s += '<tr><td class="entry_day" valign="top">';
        if (i > 0 && e.start.getDate() == entries[i - 1].start.getDate() && e.start.getMonth() == entries[i - 1].start.getMonth()) {
          s += '&nbsp;';
        } else {
          s += e.start.format(getDayFormat());
        }
        s += '</td>';
        if (e.fullday) {
          s += '<td valign="top" class="full_day entry" style="background-color: ' + e.color + ';">' + e.title;
        } else {
          s += '<td valign="top" class="entry';
          if (e.end < now) {
            s += ' dim_event';
          }
          s += '" style="color: ' + e.color + ';">';
          s += '<span class="entry_time">' + e.start.format(getTimeFormat());
          if (getValue(SHOW_END_TIME) === 'true') {
            s += '-' + e.end.format(getTimeFormat());
          }
          s += "</span> ";
          s += e.title;
        }
        s += '</td></tr>';
      }
    }
    s += "</dl>";
    s += "</tbody></table>";
  } else {
    s = '<div class="centertext">' + msg('view_no_events') + '</div>';
  }
  document.getElementById('cal').innerHTML = s;
  document.getElementById('cal').style.display = 'block';
  document.getElementById('error').style.display = 'none';
  document.getElementById('loading').style.display = 'none';
}
var drawEntries = window["drawEntries"] = drawEntries;
function redraw() {
  setupCSS();
  drawEntries();
}
var redraw = window["redraw"] = redraw;
});
