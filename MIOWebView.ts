/**
 * Created by godshadow on 04/08/16.
 */

/// <reference path="MIOView.ts" />

class MIOWebView extends MIOView
{
    init()
    {
        this.layer = document.createElement("iframe");
        this.layer.setAttribute("id", this.layerID);
        this.layer.style.position = "absolute";
        this.layer.style.top = "0px";
        this.layer.style.left = "0px";
        this.layer.style.width = "100%";
        this.layer.style.height = "100%";
    }

    setURL(url)
    {
        this.layer.setAttribute("src", url);
    }
}