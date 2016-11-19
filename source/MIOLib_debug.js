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
    "MIOUserDefaults",
    "MIOString",
    "MIODate",
    "Date_MIO",
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
    "MIOCollectionView",
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
    "MIOViewController_Animation",
    "MIOViewController_PopoverPresentationController",
    "MIONavigationController",
    "MIOPageController",
    "MIOSplitViewController",
    "webworkers/MIOHTMLParser"
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
var _mc_force_mobile = false;
function MIOLibCheckParams() {
    MIOLibDecodeParams(window.location.search, this, function (param, value) {
        // Only for test
        if (param == "forceMobile")
            _mc_force_mobile = value == "true" ? true : false;
    });
}
function MIOLibIsMobile() {
    if (_mc_force_mobile == true)
        return true;
    ///<summary>Detecting whether the browser is a mobile browser or desktop browser</summary>
    ///<returns>A boolean value indicating whether the browser is a mobile browser or not</returns>
    /*if (sessionStorage .desktop) // desktop storage
     return false;
     else if (localStorage.mobile) // mobile storage
     return true;*/
    // alternative
    var mobile = ['iphone', 'ipad', 'android', 'blackberry', 'nokia', 'opera mini', 'windows mobile', 'windows phone', 'iemobile'];
    for (var i in mobile)
        if (navigator.userAgent.toLowerCase().indexOf(mobile[i].toLowerCase()) > 0)
            return true;
    // nothing found.. assume desktop
    return false;
}
function MIOLibDecodeParams(string, target, completion) {
    var param = "";
    var value = "";
    var isParam = false;
    for (var index = 0; index < string.length; index++) {
        var ch = string.charAt(index);
        if (ch == "?") {
            isParam = true;
        }
        else if (ch == "&") {
            // new param
            MIOLibEvaluateParam(param, value, target, completion);
            isParam = true;
            param = "";
            value = "";
        }
        else if (ch == "=") {
            isParam = false;
        }
        else {
            if (isParam == true)
                param += ch;
            else
                value += ch;
        }
    }
    MIOLibEvaluateParam(param, value, target, completion);
}
function MIOLibEvaluateParam(param, value, target, completion) {
    if (target != null && completion != null)
        completion.call(target, param, value);
}
//# sourceMappingURL=MIOLib_debug.js.map