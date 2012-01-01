var TITLE_UNREAD_COUNT_RE = /\s+\((\d+)(\+?)\)$/; 
var months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

function redraw() {
	//TODO
	setupCSS();
}

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
	cssNode.innerHTML += ".entries dd { white-space: " + (getValue(WRAP_LINES) == 'true' ? "normal" : "nowrap") + "; }\n";
	cssNode.innerHTML += "#cal {";
	cssNode.innerHTML += "font-size: " + getValue(FONT_SIZE) + "px;";
	cssNode.innerHTML += "line-height: " + (parseInt(getValue(FONT_SIZE), 10) + 3) + "px;";
	cssNode.innerHTML += "}\n";
	cssNode.innerHTML += ".entries dt { color: #" + getValue(FONT_COLOR) + "; }";
	cssNode.innerHTML += ".entries dd.full-day { color: #" + getValue(ALT_FONT_COLOR) + "; }";
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
function displayData() {

	//TODO past today's events
	//TODO events in progress
	if (entries.length > 0) {
		var today = new Date();
		var s = '<dl class="entries">';
		var num = entries.length < getValue(MAX_ENTRIES) ? entries.length : getValue(MAX_ENTRIES);
		for (var i = 0; i < num; i++) {
			var e = entries[i];
			s += '<dt>';
			if (i > 0 && e.start.getDate() == entries[i-1].start.getDate() &&
					e.start.getMonth() == entries[i-1].start.getMonth()) {
				// same day as for previous entry
				s += '&nbsp;';
			} else {
				// first event of a day
				s += pad(e.start.getDate()) + " " + months[e.start.getMonth()];
			}
			s += '</dt>';
			if (e.fullday) {
				s += '<dd class="full-day" style="background-color: '+ e.color
					+';">' + e.title; 
			} else {
				s += '<dd class="entry" style="color: ' + e.color +';">';
				s += '<span class="entry-time">' + pad(e.start.getHours()) + ":" 
					+ pad(e.start.getMinutes()) + "</span> ";
				s += e.title; 
			}
			s += '</dd>';
		}
		s += "</dl>";
	} else {
		// no events 
		s = '<div class="centertext">No events in your calendar(s)</div>';
	}
	
	document.getElementById('cal').innerHTML = s;
	document.getElementById('cal').style.display = 'block';
	document.getElementById('error').style.display = 'none';
	document.getElementById('loading').style.display = 'none';	
}


