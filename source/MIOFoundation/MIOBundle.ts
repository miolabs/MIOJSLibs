/**
 * Created by godshadow on 9/4/16.
 */

/// <reference path="MIOObject.ts" />
/// <reference path="MIOURL.ts" />

class MIOBundle extends MIOObject
{
    url:MIOURL = null;

    private static _mainBundle = null;

    private _webBundle:MIOCoreBundle = null;

    public static mainBundle():MIOBundle
    {
        if (this._mainBundle == null)
        {
            // Main url. Getting from broser window url search field

            var url = MIOCoreGetMainBundleURLString();

            this._mainBundle = new MIOBundle();
            this._mainBundle.initWithURL(url);
        }

        return this._mainBundle;
    }

    initWithURL(url:MIOURL)
    {
        this.url = url;
    }

    loadHTMLNamed(path, layerID, target?, completion?)
    {
        if (MIOCoreGetAppType() == MIOCoreAppType.Web)
        {
            if (this._webBundle == null)
            {
                this._webBundle = new MIOCoreBundle();
                this._webBundle.baseURL = this.url;
            }

            this._webBundle.loadHMTLFromPath(path, layerID, this, function(layerData){

                    var domParser = new DOMParser();
                    var items = domParser.parseFromString(layerData, "text/html");
                    var layer = items.getElementById(layerID);

                    //this.localizeSubLayers(layer.childNodes);

                    if (target != null && completion != null)
                        completion.call(target, layer);
            });
        }
    }

    private _loadResourceFromURL(url:MIOURL, target, completion)
    {
        var request = MIOURLRequest.requestWithURL(url);
        var conn =  new MIOURLConnection();
        conn.initWithRequestBlock(request, this, function(error, data){

            completion.call(target, data);
        });
    }


}