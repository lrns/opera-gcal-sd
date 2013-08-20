opera.isReady(function () {
    function debugMessage(msg) {
        console.log(msg);
    }
    var debugMessage = window["debugMessage"] = debugMessage;
});
