
//importScripts("MIOHTMLParser.js");

var _languageStrings = null;

self.addEventListener('message', function(e) {

    var item = e.data;

    var cmd = item["CMD"];

    if (cmd == "SetLanguageStrings")
    {
        _languageStrings = item["LanguageStrings"];
    }
    else if (cmd == "DownloadHTML")
    {
        var url = item["URL"];
        var layerID = item["LayerID"];
        var path = item["Path"];

        downloadHTML(url, layerID, path);
    }

}, false);


function downloadHTML(url, layerID, path) {

    var instance = this;

    var xhr = new XMLHttpRequest();
    xhr.onload = function(){

        if(this.status == 200 && this.responseText != null)
        {
            // success!
            instance.parseHTML.call(instance, url, this.responseText, layerID, path);
        }
        else
        {
            // something went wrong
            console.log("BUNDLE_WORKER: Error downloading resource at " + url + " (Code: " + this.status + ")");
            instance.parseHTML.call(instance);
        }
    };

    console.log("BUNDLE_WORKER: Downloading resource at " + url);
    xhr.open("GET", url);
    xhr.send();
}

function parseHTML(url, data, layerID, path)
{

}