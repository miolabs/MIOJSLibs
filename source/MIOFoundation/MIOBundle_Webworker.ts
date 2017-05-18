
class MIOBundle_Webworker
{
    baseURL:MIOURL = null;

    private _layoutWorker = null;
    private _layoutQueue = null;
    private _layoutCache = null;

    private _isDownloadingResource = false;

    private _loadingCSSCount = 0;

    private _loadCSS(basePath, path)
    {
        this._loadingCSSCount++;

        var url = MIOURL.urlWithString(path);
        var urlString:string = null;
        if (url.scheme != null)
        {
            // Absolute url            
            urlString  = url.absoluteString;
        }
        else 
        {            
            urlString = MIOStringAppendPathComponent(basePath, path);
            urlString = MIOStringStandardizingPath(urlString);
        }                

        console.log("BUNDLE_WEBWORKER: Adding CSS: " + urlString);
        MIOCoreLoadStyle(urlString, this, function (){
            this._loadingCSSCount--;
            this._checkDownloadCount();
        })
    }
    
    loadHMTLFromPath(path, layerID, target, completion)
    {
        if (this._layoutWorker == null)
        {
            this._layoutWorker = new Worker("webworkers/miobundlewebworker.js");
            // TODO: Set language so we can translate every html file in backgorund
            //this._layoutWorker.postMessage({"CMD" : "SetLanguage", "LanguageStrings" : _MIOLocalizedStrings});
            
            var instance = this;
            this._layoutWorker.onmessage = function (event) {

                var item = event.data;
                if (item["Type"] == "CSS")
                {
                    var basePath = MIOStringDeletingLastPathComponent(path);
                    instance._loadCSS(item["Path"], item["CSSURL"]);
                    
                    // var len = cssURL.lastIndexOf('/');
                    // var cssFile = cssURL.substring(len + 1);
                    // if (cssFile == "app.css") return;

                    // var baseURL = url.substring(0, url.lastIndexOf('/')) + "/";
                    // cssURL  = baseURL + cssURL;
                    // MIOCoreLoadStyle(cssURL);
                    // console.log("BUNDLE: Adding CSS: " + cssURL);
                }
                else if (item["Type"] = "HTML")
                {
                    var result = item["Result"];
                    instance.layerDidDownload(result.layout);
                }                
            }
        }

        if (this._layoutQueue == null)
            this._layoutQueue = [];

        if (this._layoutCache == null)
            this._layoutCache = {};

        if (this._layoutCache[path] != null)
        {
            var i = this._layoutCache[path];
            var layout = i["Layer"];
            completion.call(target, layout);
        }
        else
        {
            // add to a queue
            // var url2 = document.URL;
            // if (url2.lastIndexOf(".") > -1)
            // {
            //     url2 = url2.substr(0, url2.lastIndexOf('/'));
            // }
            // url2 = url2 + "/" + url;
            var url = this.baseURL.urlByAppendingPathComponent(path);
            var item = {"Key" : path, "Path" : MIOStringDeletingLastPathComponent(path), "URL": url.absoluteString, "LayerID": layerID, "Target" : target, "Completion" : completion};
            this._layoutQueue.push(item);

            this.checkQueue();        
        }
    }

    private checkQueue()
    {
        if (this._isDownloadingResource == true)
            return;

        if (this._layoutQueue.length == 0)
            return;

        this._isDownloadingResource = true;
        var item = this._layoutQueue[0];

        // Send only the information need
        console.log("Download resource: " + item["URL"]);
        var msg = {"CMD" : "DownloadHTML", "URL" : item["URL"], "Path" : item["Path"], "LayerID" : item["LayerID"]};
        this._layoutWorker.postMessage(msg);
    }

    private layerDidDownload(layer)
    {
        var item = this._layoutQueue[0];

        this._isDownloadingResource = false;

        item["Layer"] = layer;

        var key = item["Key"];
        this._layoutCache[key] = item; 

        this._checkDownloadCount();
    }

    private _checkDownloadCount()
    {
        if (this._isDownloadingResource == true) return;

        if (this._loadingCSSCount > 0) return;

        var item = this._layoutQueue[0];

        this._layoutQueue.splice(0, 1);

        var target = item["Target"];
        var completion = item["Completion"];
        var layer = item["Layer"];

        completion.call(target, layer);

        delete item["Target"];
        delete item["Completion"];

        this.checkQueue();
    }
}