/**
 * Created by godshadow on 9/4/16.
 */

/// <reference path="MIO_Core.ts" />

/// <reference path="MIOObject.ts" />
/// <reference path="MIOURL.ts" />

/// <reference path="MIOBundle_Webworker.ts" />


class MIOBundle extends MIOObject
{
    url:MIOURL = null;

    private static _mainBundle = null;

    private _webBundle:MIOBundle_Webworker = null;

    public static mainBundle():MIOBundle
    {
        if (this._mainBundle == null)
        {
            // Main url. Getting from broser window url search field
            
            var url = MIOCoreGetMainBundleURL();

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
                this._webBundle = new MIOBundle_Webworker();
                this._webBundle.baseURL = this.url;
            }

            this._webBundle.loadHMTLFromPath(path, layerID, this, function(layerData){

                if (target != null && completion != null)
                    completion.call(target, layerData);
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