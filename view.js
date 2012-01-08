
/**
 * Setup CSS for calendar tile
 */
function setupCSS() {
	for (var i in document.styleSheets) {
		var sheet = document.styleSheets[i];
		if (sheet.ownerNode && sheet.href == null) {
			sheet.ownerNode.parentNode.removeChild(sheet.ownerNode);
		}
	}

	var cssNode = document.createElement("style");
	
	cssNode.innerHTML = "body { background-color: #" + getValue(BG_COLOR)+ " !important; }\n";
	cssNode.innerHTML += "td.entry { white-space: " + (getValue(WRAP_LINES) == 'true' ? "normal" : "nowrap") + "; }\n";
	cssNode.innerHTML += "#cal {";
	cssNode.innerHTML += "font-size: " + getValue(FONT_SIZE) + "px;";
	//cssNode.innerHTML += "line-height: " + (parseInt(getValue(FONT_SIZE), 10) + 3) + "px;";
	cssNode.innerHTML += "}\n";
	cssNode.innerHTML += "td.entry-day { color: #" + getValue(FONT_COLOR) + "; }";
	cssNode.innerHTML += "td.full-day { color: #" + getValue(ALT_FONT_COLOR) + "; }";
	console.log(cssNode.innerHTML);	
	document.head.appendChild(cssNode);
}
/**
 * Add leading 0 to a single digit number
 */
function pad(s) {
	return s < 10 ? '0'+s : s;
}

function onError() {
	document.getElementById('error').innerHTML = 'Unknown Error!';
	document.getElementById('error').style.display = 'block';
	document.getElementById('cal').style.display = 'none';
	document.getElementById('loading').style.display = 'none';	
	opera.extension.broadcastMessage('refresh-end');
}

function showLoading() {
	document.getElementById('error').style.display = 'none';
	document.getElementById('cal').style.display = 'none';
	document.getElementById('loading').style.display = 'block';	
}
function displayNoAuth(){
	var text = 'Click to sign in ...';
	if (getValue(ACCOUNT_TYPE) != 'share') {
		text = 'Please sign in inside extension preferences';
	}
	document.getElementById('error').innerHTML = text;
	document.getElementById('error').style.display = 'block';
	document.getElementById('cal').style.display = 'none';
	document.getElementById('loading').style.display = 'none';	
	opera.extension.broadcastMessage('refresh-end');
}
function drawEntries() {
	console.log('Drawing entries >>>>>');
	var now = new Date();
	//TODO past today's events
	//TODO events in progress
	if (entries.length > 0) {
		var today = new Date();
		var s = '<table id="entries" cellspacing="2" cellpadding="" border="0"><tbody>';
		var num = entries.length < getValue(MAX_ENTRIES) ? entries.length : getValue(MAX_ENTRIES);
		console.log('Drawing entries: ' + entries.length);
		for (var i = 0; i < num; i++) {
			var e = entries[i];
			if (e.end > now || getValue(SHOW_PAST_EVENTS) === 'true') {
				s += '<tr><td class="entry-day" valign="top">';
				if (i > 0 && e.start.getDate() == entries[i-1].start.getDate() &&
						e.start.getMonth() == entries[i-1].start.getMonth()) {
					// same day as for previous entry
					s += '&nbsp;';
				} else {
					// first event of a day
					s += e.start.format(getValue(DATE_FORMAT));
				}
				s += '</td>';
				if (e.fullday) {
					s += '<td valign="top" class="full-day entry" style="background-color: '+ e.color
						+';">' + e.title; 
				} else {
					s += '<td valign="top" class="entry';
					if (e.end < now) {
						s += ' dim-event';
					}
					s += '" style="color: ' + e.color +';">';
					s += '<span class="entry-time">' + pad(e.start.getHours()) + ":" 
						+ pad(e.start.getMinutes());
					if (getValue(SHOW_END_TIME) === 'true') {
						s += '-' + pad(e.end.getHours()) + ":" 
							+ pad(e.end.getMinutes());
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
		// no events 
		s = '<div class="centertext">No events in your calendar(s)</div>';
	}
	
	document.getElementById('cal').innerHTML = s;
	document.getElementById('cal').style.display = 'block';
	document.getElementById('error').style.display = 'none';
	document.getElementById('loading').style.display = 'none';	
}

function redraw() {
	//TODO
	setupCSS();
	drawEntries();
}

