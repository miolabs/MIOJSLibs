/**
 * Created by godshadow on 26/08/16.
 */
var MIOLibIsLoaded = false;
var _MIOLibLoadedTarget = null;
var _MIOLibLoadedCompletion = null;
var _MIOLibFileIndex = 0;
var _MIOLibFiles = [
    "MIOCore",
    "MIOCoreTypes",
    "MIOObject",
    "MIOString",
    "MIODate",
    "Date+MIO",
    "MIOUUID",
    "MIONotificationCenter",
    "MIOWebApplication",
    "MIOURLConnection",
    "MIOBundle",
    "MIOPredicate",
    "MIOSortDescriptor",
    "MIOManagedObjectContext",
    "MIOFetchedResultsController",
    "MIOView",
    "MIOScrollView",
    "MIOWindow",
    "MIOLabel",
    "MIOTableView",
    "MIOCalendarView",
    "MIOImageView",
    "MIOMenu",
    "MIOActivityIndicator",
    "MIOWebView",
    "MIOControl",
    "MIOButton",
    "MIOComboBox",
    "MIOPopUpButton",
    "MIOCheckButton",
    "MIOSegmentedControl",
    "MIOTextField",
    "MIOTextArea",
    "MIOTabBar",
    "MIOPageControl",
    "MIOViewController",
    "MIOViewController+Animation",
    "MIONavigationController",
    "MIOPageController",
    "MIOSplitViewController",
    "extras/MIOHTMLParser"
];
function MIOLibDownloadScript(url, target, completion) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.status == 200 && this.responseText != null) {
            // success!
            completion.call(target, this.responseText);
        }
        else {
            throw "We couldn't download the mio libs";
        }
    };
    xhr.open("GET", url);
    xhr.send();
}
function MIOLibLoadStyle(url) {
    var ss = document.createElement("link");
    ss.type = "text/css";
    ss.rel = "stylesheet";
    ss.href = url;
    document.getElementsByTagName("head")[0].appendChild(ss);
}
function MIOLibLoadScript(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    //script.onreadystatechange = callback;
    script.onload = callback;
    // Fire the loading
    head.appendChild(script);
}
function MIOLibLoadScriptCallback() {
    console.log("Download completed " + _MIOLibFileIndex);
    _MIOLibFileIndex++;
    if (_MIOLibFileIndex < _MIOLibFiles.length)
        MIOLibDownloadNextFile();
    else {
        MIOLibIsLoaded = true;
        if (_MIOLibLoadedCompletion != null && _MIOLibLoadedTarget != null)
            _MIOLibLoadedCompletion.call(_MIOLibLoadedTarget);
        _MIOLibLoadedTarget = null;
        _MIOLibLoadedCompletion = null;
    }
}
function MIOLibDownloadNextFile() {
    var file = _MIOLibFiles[_MIOLibFileIndex];
    var url = "src/miolib/" + file + ".js";
    console.log("Downloading " + url + " (" + _MIOLibFileIndex + ")");
    MIOLibLoadScript(url, MIOLibLoadScriptCallback);
}
function MIOLibOnLoaded(target, completion) {
    if (MIOLibIsLoaded == true) {
        completion.call(target);
    }
    else {
        _MIOLibLoadedTarget = target;
        _MIOLibLoadedCompletion = completion;
        MIOLibLoadStyle("src/miolib/extras/animate.min.css");
        MIOLibDownloadNextFile();
    }
}
function MIOLibDownloadAppFile(file) {
    _MIOLibFiles.push("../" + file);
    console.log("Added file to download: " + file);
}
//# sourceMappingURL=MIOLib_debug.js.map