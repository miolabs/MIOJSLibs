/**
 * Created by godshadow on 26/08/16.
 */

var MIOLibIsLoaded = false;

var _MIOLibLoadedTarget = null;
var _MIOLibLoadedCompletion = null;

var _MIOLibFileIndex = 0;
var _MIOLibFiles = [
    "MIOCore.js",
    "MIOCoreTypes.js",
    "MIOObject.js",
    "MIOString.js",
    "MIODate.js",
    "Date+MIO.js",
    "MIOUUID.js",
    "MIONotificationCenter.js",
    "MIOWebApplication.js",
    "MIOURLConnection.js",
    "MIOBundle.js",
    "MIOPredicate.js",
    "MIOManagedObjectContext.js",
    "MIOFetchedResultsController.js",
    "MIOView.js",
    "MIOWindow.js",
    "MIOLabel.js",
    "MIOTableView.js",
    "MIOCalendarView.js",
    "MIOImageView.js",
    "MIOMenu.js",
    "MIOActivityIndicator.js",
    "MIOWebView.js",
    "MIOControl.js",
    "MIOButton.js",
    "MIOComboBox.js",
    "MIOPopUpButton.js",
    "MIOCheckButton.js",
    "MIOTextField.js",
    "MIOTextArea.js",
    "MIOTabBar.js",
    "MIOViewController.js",
    "MIOViewController+Animation.js",
    "MIONavigationController.js",
    "MIOPageController.js",
    "MIOSplitViewController.js",
    "extras/MIOHTMLParser.js"
];

function MIOLibDownloadScript(url, target, completion)
{
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){

        if(this.status == 200 && this.responseText != null)
        {
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

function MIOLibLoadScript(url, callback)
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

function MIOLibLoadScriptCallback()
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

function MIOLibDownloadNextFile()
{
    console.log("Downloading " + _MIOLibFileIndex);

    var file = _MIOLibFiles[_MIOLibFileIndex];
    var url = "src/miolib/" + file;
    MIOLibLoadScript(url, MIOLibLoadScriptCallback);
}

function MIOLibOnLoaded(target, completion)
{
    if (MIOLibIsLoaded == true)
    {
        completion.call(target);
    }
    else
    {
        _MIOLibLoadedTarget = target;
        _MIOLibLoadedCompletion = completion;
        MIOLibDownloadNextFile();
    }
}

function MIOLibDownloadAppFile(file)
{
    _MIOLibFiles.push("../" + file);
    console.log("Added file to download: " + file);
}

