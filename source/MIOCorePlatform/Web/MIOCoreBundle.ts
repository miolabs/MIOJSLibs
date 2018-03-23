import {
    MIOCoreStringAppendPathComponent,
    MIOCoreStringDeletingLastPathComponent,
    getMIOLocalizedStrings
} from '../../MIOCore'

export class MIOCoreBundle
{
    baseURL:string = null;

    private _layoutWorker = null;
    private _layoutQueue = null;
    private _layoutCache = null;

    private _isDownloadingResource = false;
    
    loadHMTLFromPath(path, layerID, target, completion)
    {
        if (this._layoutWorker == null)
        {
            this._layoutWorker = new Worker("libs/webworkers/Bundle_WebWorker.js");
            // TODO: Set language so we can translate every html file in background
            this._layoutWorker.postMessage({"CMD" : "SetLanguageStrings", "LanguageStrings" : getMIOLocalizedStrings()});
            
            var instance = this;
            this._layoutWorker.onmessage = function (event) {

                let item = event.data;

                if (item["Type"] == "HTML"){
                    var result = item["Result"];

                    let layerID = item["LayerID"];
                    console.log(" <- layerid: " + layerID);                    
    
                    instance.layerDidDownload(result);
                }     
                else if (item["Error"] != null) {
                    throw new Error(`MIOBundle: ${item["Error"]}`);
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
            var url = MIOCoreStringAppendPathComponent(this.baseURL, path);
            let item = {"Key" : path, "Path" : MIOCoreStringDeletingLastPathComponent(path), "URL": url, "LayerID": layerID, "Target" : target, "Completion" : completion};
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
        let item = this._layoutQueue[0];

        // Send only the information need
        console.log("Download resource: " + item["URL"]);
        var msg = {"CMD" : "DownloadHTML", "URL" : item["URL"], "Path" : item["Path"], "LayerID" : item["LayerID"]};
        console.log(" -> layerid: " + item["LayerID"]);
        this._layoutWorker.postMessage(msg);
    }

    private layerDidDownload(layer)
    {
        let item = this._layoutQueue[0];

        console.log("Downloaded resource: " + item["URL"]);

        this._isDownloadingResource = false;

        item["Layer"] = layer;

        var key = item["Key"];
        this._layoutCache[key] = item; 

        this._checkDownloadCount();
    }

    private _checkDownloadCount()
    {
        if (this._isDownloadingResource == true) return;

        let item = this._layoutQueue[0];

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
