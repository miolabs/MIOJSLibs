/**
 * Created by godshadow on 9/4/16.
 */
/// <reference path="MIOObject.ts" />
/// <reference path="MIOURLConnection.ts" />
/// <reference path="MIOWebApplication.ts" />
var MIOBundle = (function () {
    function MIOBundle() {
        this._layoutWorker = null;
        this._layoutQueue = null;
        this._layoutCache = null;
        this._isDownloadResource = false;
        if (MIOBundle._mainBundle) {
            throw new Error("Error: Instantiation failed: Use defaultCenter() instead of new.");
        }
        MIOBundle._mainBundle = this;
    }
    MIOBundle.mainBundle = function () {
        return MIOBundle._mainBundle;
    };
    MIOBundle.prototype.loadFromResource = function (url, target, completion) {
        var conn = new MIOURLConnection();
        conn.initWithRequestBlock(new MIOURLRequest(url), this, function (error, data) {
            completion.call(target, data);
        });
    };
    MIOBundle.prototype.loadLayoutFromURL = function (url, layerID, target, completion) {
        if (this._layoutWorker == null) {
            this._layoutWorker = new Worker("src/miolib/webworkers/MIOBundleDownloadLayout.js");
            this._layoutWorker.postMessage({ "CMD": "SetLanguage", "LanguageStrings": MIOLocalizedStrings });
            var instance = this;
            this._layoutWorker.onmessage = function (event) {
                instance.layerDidDownload(event.data);
            };
        }
        if (this._layoutQueue == null)
            this._layoutQueue = [];
        if (this._layoutCache == null)
            this._layoutCache = {};
        if (this._layoutCache[url] != null) {
            var layout = this._layoutCache[url];
            completion.call(target, layout);
        }
        else {
            // add to a queue
            var url2 = document.URL;
            if (url2.lastIndexOf(".") > -1) {
                url2 = url2.substr(0, url2.lastIndexOf('/'));
            }
            url2 = url2 + "/" + url;
            var item = { "URL": url2, "LayerID": layerID, "Target": target, "Completion": completion };
            this._layoutQueue.push(item);
            this.checkQueue();
        }
    };
    MIOBundle.prototype.checkQueue = function () {
        if (this._isDownloadResource == true)
            return;
        if (this._layoutQueue.length == 0)
            return;
        this._isDownloadResource = true;
        var item = this._layoutQueue[0];
        // Send only the information need
        var msg = { "CMD": "DownloadResource", "URL": item["URL"], "LayerID": item["LayerID"] };
        this._layoutWorker.postMessage(msg);
    };
    MIOBundle.prototype.layerDidDownload = function (layer) {
        var item = this._layoutQueue[0];
        this._layoutQueue.splice(0, 1);
        this._isDownloadResource = false;
        item["Layer"] = layer;
        var url = item["URL"];
        this._layoutCache[url] = item;
        var target = item["Target"];
        var completion = item["Completion"];
        completion.call(target, layer);
        delete item["Target"];
        delete item["Completion"];
        this.checkQueue();
    };
    MIOBundle._mainBundle = new MIOBundle();
    return MIOBundle;
}());
//# sourceMappingURL=MIOBundle.js.map