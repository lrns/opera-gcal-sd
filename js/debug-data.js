function showDebugContent() {
  document.getElementById('debug_textarea').innerHTML = chrome.extension.getBackgroundPage().getDebugText();
}
function init() {
  showDebugContent();
}

addEventListener('DOMContentLoaded', init, false);

