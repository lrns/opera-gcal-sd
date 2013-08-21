
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
	var text = msg('view_click_signin');
	if (getValue("account_type") != 'share') {
		text = msg('view_signin_prefs');
	}
	document.getElementById('error').innerHTML = text;
	document.getElementById('error').style.display = 'block';
	document.getElementById('cal').style.display = 'none';
	document.getElementById('loading').style.display = 'none';
	chrome.runtime.sendMessage({ status : 'refresh_end' });
}

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
			if (e.end > now || getValue("show_past_events") === 'true') {
				s += '<tr><td class="entry_day" valign="top">';
				if (i > 0 && e.start.getDate() == entries[i - 1].start.getDate() && e.start.getMonth() == entries[i - 1].start.getMonth()) {
					s += '&nbsp;';
				}
				else {
					s += e.start.format(getDayFormat());
				}
				s += '</td>';
				if (e.fullday) {
					s += '<td valign="top" class="full_day entry" style="background-color: ' + e.color + ';">' + e.title;
				}
				else {
					s += '<td valign="top" class="entry';
					if (e.end < now) {
						s += ' dim_event';
					}
					s += '" style="color: ' + e.color + ';">';
					s += '<span class="entry_time">' + e.start.format(getTimeFormat());
					if (getValue("show_end_time") === 'true') {
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

