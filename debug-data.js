addEventListener('DOMContentLoaded',init,false);

function showDebugContent() {
	document.getElementById('debug-textarea').innerHTML = 
			opera.extension.bgProcess.getDebugText();
}

function init() {
	showDebugContent();	
}
