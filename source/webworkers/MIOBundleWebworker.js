/**
 * Created by godshadow on 25/07/16.
 */

importScripts("MIOHTMLParser.js");

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
    if (data == null) {
        self.postMessage({"Error" : "Couldn't download resource"});
    }
    else
    {
        var result = MIOHTMLParser(data, layerID, path, function(css) {

            // Found link
            var item = [];
            item["Type"] = "CSS";
            item["CSSURL"] = css["url"];
            item["BaseURL"] = url;
            item["Path"] = path;
            item["Media"] = css["media"];
            self.postMessage(item);
        });

        var item = [];
        item["Type"] = "HTML";
        item["Result"] = result;
        self.postMessage(item);
    }
}

function localizeSubLayers(layers)
{
    if (layers.length == 0)
        return;

    for (var index = 0; index < layers.length; index++)
    {
        var layer = layers[index];

        if (layer.tagName != "DIV") continue;

        var key = layer.getAttribute("data-localize-key");
        if (key != null)
            layer.innerHTML = MIOLocalizeString(key, key);

        this.localizeSubLayers(layer.childNodes);
    }
}

function MIOLocalizeString(key, defaultValue)
{
    var strings =  _languageStrings;
    if (strings == null)
        return defaultValue;

    var value = strings[key];
    if (value == null)
        return defaultValue;

    return value;
}


