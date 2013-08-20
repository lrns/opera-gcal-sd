opera.isReady(function(){
addEventListener('DOMContentLoaded', init, false);
function showDebugContent() {
  document.getElementById('debug_textarea').innerHTML = opera.extension.bgProcess.getDebugText();
}
var showDebugContent = window["showDebugContent"] = showDebugContent;
function init() {
  showDebugContent();
}
var init = window["init"] = init;
});
