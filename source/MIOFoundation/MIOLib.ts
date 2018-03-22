/**
 * Created by godshadow on 20/5/16.
 */

var MIOLibIsLoaded = false;

var _MIOLibLoadedTarget = null;
var _MIOLibLoadedCompletion = null;

var _MIOLibFileIndex = 0;
var _MIOLibFiles = [];

var _mc_force_mobile = false;

export enum MIOLibInitType
{
    Release,
    Debug
}

var _MIOLibMainFn = null;

export function MIOLibInit(mainFn, type?:MIOLibInitType) {

    _MIOLibMainFn = mainFn;

    MIOLibDecodeParams(window.location.search, this, function (param, value) {

        // Only for test
        if (param == "forceMobile")
            _mc_force_mobile = value == "true" ? true : false;
    });

    // If debug load MIOJS Libs
    if (type == MIOLibInitType.Debug)
    {
        _MIOLibDownloadLibFiles();
    }
}

export function MIOLibDownloadScript(url, target, completion)
{
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){

        if(xhr.status == 200 && xhr.responseText != null)
        {
            // success!
            completion.call(target, xhr.responseText);
        }
        else {
            throw new Error("We couldn't download the mio libs");
        }
    };

    xhr.open("GET", url);
    xhr.send();
}

export function MIOLibLoadStyle(url)
{
    var ss = document.createElement("link");
    ss.type = "text/css";
    ss.rel = "stylesheet";
    ss.href = url;
    document.getElementsByTagName("head")[0].appendChild(ss);
}

export function MIOLibLoadScript(url, callback)
{
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

export function MIOLibLoadScriptCallback()
{
    console.log("Download completed " + _MIOLibFileIndex);
    _MIOLibFileIndex++;

    if (_MIOLibFileIndex < _MIOLibFiles.length)
        MIOLibDownloadNextFile();
    else
    {
        MIOLibIsLoaded = true;
        if (_MIOLibLoadedCompletion != null && _MIOLibLoadedTarget != null)
            _MIOLibLoadedCompletion.call(_MIOLibLoadedTarget);

        _MIOLibLoadedTarget = null;
        _MIOLibLoadedCompletion = null;
    }
}

export function MIOLibDownloadNextFile()
{
    var file = _MIOLibFiles[_MIOLibFileIndex];
    var url = "src/miolib/" + file + ".js";

    console.log("Downloading " + url + " (" + _MIOLibFileIndex + ")");
    MIOLibLoadScript(url, MIOLibLoadScriptCallback);
}

export function MIOLibOnLoaded(target, completion)
{
    if (MIOLibIsLoaded == true)
    {
        completion.call(target);
    }
    else
    {
        MIOLibLoadStyle("src/miolib/extras/animate.min.css");
        if (_MIOLibFiles.length == 0)
        {
            MIOLibIsLoaded = true;
            completion.call(target);
        }
        else {

            _MIOLibLoadedTarget = target;
            _MIOLibLoadedCompletion = completion;

            MIOLibDownloadNextFile();
        }
    }
}

export function MIOLibDownloadLibFile(file)
{
    _MIOLibFiles.push(file);
    console.log("Added file to download: " + file);
}

export function MIOLibDownloadFile(file)
{
    _MIOLibFiles.push("../" + file);
    console.log("Added file to download: " + file);
}

export function MIOLibIsRetina ()
{
    var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
            (min--moz-device-pixel-ratio: 1.5),\
            (-o-min-device-pixel-ratio: 3/2),\
            (min-resolution: 1.5dppx)";
    if (window.devicePixelRatio > 1)
        return true;

    if (window.matchMedia && window.matchMedia(mediaQuery).matches)
        return true;

    return false;
}

export function MIOLibDecodeParams(string, target?, completion?)
{
    var param = "";
    var value = "";
    var isParam = false;

    for (var index = 0; index < string.length; index++)
    {
        var ch = string.charAt(index);

        if (ch == "?")
        {
            isParam = true;
        }
        else if (ch == "&")
        {
            // new param
            MIOLibEvaluateParam(param, value, target, completion);
            isParam = true;
            param = "";
            value = "";
        }
        else if (ch == "=")
        {
            isParam = false;
        }
        else
        {
            if (isParam == true)
                param += ch;
            else
                value += ch;
        }
    }

    MIOLibEvaluateParam(param, value, target, completion);
}

export function MIOLibEvaluateParam(param, value, target, completion)
{
    if (target != null && completion != null)
        completion.call(target, param, value);
}

// Download files individually in debug mode
export function _MIOLibDownloadLibFiles()
{
    // MIOLib files
    MIOLibDownloadLibFile("MIOCore");
    MIOLibDownloadLibFile("MIOCoreTypes");
    MIOLibDownloadLibFile("MIOObject");
    MIOLibDownloadLibFile("MIOUserDefaults");
    MIOLibDownloadLibFile("MIOString");
    MIOLibDownloadLibFile("MIODate");
    MIOLibDownloadLibFile("Date_MIO");
    MIOLibDownloadLibFile("MIOUUID");
    MIOLibDownloadLibFile("MIONotificationCenter");
    MIOLibDownloadLibFile("MIOWebApplication");
    MIOLibDownloadLibFile("MIOURLConnection");
    MIOLibDownloadLibFile("MIOBundle");
    MIOLibDownloadLibFile("MIOPredicate");
    MIOLibDownloadLibFile("MIOSortDescriptor");
    MIOLibDownloadLibFile("MIOManagedObjectContext");
    MIOLibDownloadLibFile("MIOFetchedResultsController");
    MIOLibDownloadLibFile("MIOView");
    MIOLibDownloadLibFile("MIOScrollView");
    MIOLibDownloadLibFile("MIOWindow");
    MIOLibDownloadLibFile("MUILabel");
    MIOLibDownloadLibFile("MIOTableView");
    MIOLibDownloadLibFile("MIOCollectionView");
    MIOLibDownloadLibFile("MIOCalendarView");
    MIOLibDownloadLibFile("MIOImageView");
    MIOLibDownloadLibFile("MIOMenu");
    MIOLibDownloadLibFile("MIOActivityIndicator");
    MIOLibDownloadLibFile("MIOWebView");
    MIOLibDownloadLibFile("MIOControl");
    MIOLibDownloadLibFile("MUIButton");
    MIOLibDownloadLibFile("MIOComboBox");
    MIOLibDownloadLibFile("MIOPopUpButton");
    MIOLibDownloadLibFile("MIOCheckButton");
    MIOLibDownloadLibFile("MIOSegmentedControl");
    MIOLibDownloadLibFile("MUITextField");
    MIOLibDownloadLibFile("MIOTextArea");
    MIOLibDownloadLibFile("MIOTabBar");
    MIOLibDownloadLibFile("MIOPageControl");
    MIOLibDownloadLibFile("MIOViewController");
    MIOLibDownloadLibFile("MIOViewController_Animation");
    MIOLibDownloadLibFile("MIOViewController_PresentationController");
    MIOLibDownloadLibFile("MIOViewController_PopoverPresentationController");
    MIOLibDownloadLibFile("MIONavigationController");
    MIOLibDownloadLibFile("MIOPageController");
    MIOLibDownloadLibFile("MIOSplitViewController");
    MIOLibDownloadLibFile("MIOUIKit");
}

/*
    Window events mapping
*/

// window.onload = function()
// {
//     MIOLibOnLoaded(this, function () {

//         _MIOLibMainFn(null);
//     });
// };

// window.onresize = function(e)
// {
//     if (MIOLibIsLoaded == false)
//         return;

//     var app = MIOWebApplication.sharedInstance();
//     app.forwardResizeEvent.call(app, e);
// };

// window.addEventListener("click", function (e) {

//     if (MIOLibIsLoaded == false)
//         return;

//     var app = MIOWebApplication.sharedInstance();
//     app.forwardClickEvent.call(app, e.target, e.clientX, e.clientY);

//     //e.preventDefault();

// }, false);

// window.addEventListener('touchend', function(e){

//     if (MIOLibIsLoaded == false)
//         return;

//     //TODO: Declare changedTouches interface for typescript
//     var touch = e.changedTouches[0] // reference first touch point for this event

//     var app = MIOWebApplication.sharedInstance();
//     app.forwardClickEvent.call(app, e.target, touch.clientX, touch.clientY);

//     //e.preventDefault();

// }, false);

// // output errors to console log
// window.onerror = function (e) {
//     console.log("window.onerror ::" + JSON.stringify(e));
// };

