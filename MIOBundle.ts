/**
 * Created by godshadow on 9/4/16.
 */

    /// <reference path="MIOCore.ts" />

class MIOBundle extends MIOObject
{
    constructor()
    {
        super ();
    }

    loadFromResource(url)
    {
        var conn =  MIOURLConnection();
        conn.initWithRequest(new MIOURLRequest(url), this);
    }

    connectionDidReceiveData(error, data)
    {
        if (error == true || data == null || data.length == 0)


            var parser = new DOMParser();
        var html = parser.parseFromString(data, "text/html");

        //var styles = html.styleSheets;

        //if (css != null)
        //MIOCoreLoadStyle(css);

        return(html.getElementById(elementID));
    }
}