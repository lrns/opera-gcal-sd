
addEventListener('DOMContentLoaded',init,false);

// set the textContent of an element
function setText(id, txt) {
	var e = document.getElementById(id);
	if(e) {
		e.textContent = txt;
	}
}

function init(){

	// populate the title, name, author, ...
	setText( 'widget-title', 'Options of ' + widget.name);
	setText( 'widget-name', widget.name + ' v' + widget.version);
	setText( 'widget-author', widget.author );

	
	var refreshInterval = getRefreshInterval();
    var refreshIntervalElement = id('refresh-interval');
	for(i in refreshIntervalElement)
	{
		var refreshValue = refreshIntervalElement.options[i];
		if(refreshValue.value == refreshInterval){
			refreshValue.selected = true;
			break;
		}
	}

	refreshIntervalElement.onchange = function(){
		setRefreshInterval(refreshIntervalElement.options[refreshIntervalElement.selectedIndex].value);
		opera.extension.bgProcess.refresh();
	}

	id('refresh-cal').onclick = function(){
	    document.getElementById('refresh-img').style.display = 'inline';
		opera.extension.bgProcess.refresh();
	}

	meElement = id('max-entries');
	meElement.value = getMaxEntries();
	meElement.oninput = function(){
		setMaxEntries(meElement.value);
		opera.extension.bgProcess.refresh();
	}

	var calendarType = getCalendarType();
	var calendarTypeElement = id('calendar-type');
	for(i in calendarType)
	{
		var calendarValue = calendarTypeElement.options[i];
		if(calendarValue.value == calendarType){
			calendarValue.selected = true;
			break;
		}
	}
	
	calendarTypeElement.onchange = function(){
		setCalendarType(calendarTypeElement.options[calendarTypeElement.selectedIndex].value);
		opera.extension.bgProcess.refresh();
	}

	opera.extension.onmessage = function(event){
	  var thecatch = event.data;
	  if (thecatch === "refresh-end") {
		  document.getElementById('refresh-img').style.display = 'none';
	  } else if (thecatch === "refresh-start") {
		  document.getElementById('refresh-img').style.display = 'inline';
	  }
	}
	
}
function id(e){return document.getElementById(e)}


