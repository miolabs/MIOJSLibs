
import { MIOCoreGetMainBundleURLString, MIOCoreBundle } from "../MIOCorePlatform";
import { MIOCoreAppType, MIOCoreGetAppType } from "../MIOCore";
import { MIOObject } from "./MIOObject";
import { MIOURL } from "./MIOURL";
import { MIOURLRequest } from "./MIOURLRequest";
import { MIOURLConnection } from "./MIOURLConnection";

/**
 * Created by godshadow on 9/4/16.
 */

export class MIOBundle extends MIOObject
{
    url:MIOURL = null;

    private static _mainBundle = null;

    private _webBundle:MIOCoreBundle = null;

    public static mainBundle():MIOBundle
    {
        if (this._mainBundle == null)
        {
            // Main url. Getting from broser window url search field

            var urlString = MIOCoreGetMainBundleURLString();

            this._mainBundle = new MIOBundle();
            this._mainBundle.initWithURL(MIOURL.urlWithString(urlString));
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
            if (this._webBundle == null){
                this._webBundle = new MIOCoreBundle();
                this._webBundle.baseURL = this.url.absoluteString;
            }

            this._webBundle.loadHMTLFromPath(path, layerID, this, function(layerData){
                                
                var domParser = new DOMParser();
                var items = domParser.parseFromString(layerData, "text/html");
                var layer = items.getElementById(layerID);

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