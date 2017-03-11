/**
 * Created by godshadow on 25/07/16.
 */

importScripts("MIOHTMLParser.js");

var _languageStrings = null;

self.addEventListener('message', function(e) {

    var item = e.data;

    var cmd = item["CMD"];

    if (cmd == "SetLanguage")
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
            instance.parseHTML.call(instance);
        }
    };

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
        var result = MIOHTMLParser(data, layerID, path, function(cssURL) {

            // Found link
            var item = [];
            item["Type"] = "CSS";
            item["CSSURL"] = cssURL;
            item["BaseURL"] = url;
            item["Path"] = path;
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


