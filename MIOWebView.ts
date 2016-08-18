/**
 * Created by godshadow on 04/08/16.
 */

/// <reference path="MIOView.ts" />

class MIOWebView extends MIOView
{
    private _iframeLayer = null;

    init()
    {
        super.init();
        this._setupLayer();
    }

    initWithLayer(layer, options?)
    {
        super.initWithLayer(layer, options);
        this._setupLayer();
    }

    private _setupLayer()
    {
        this._iframeLayer = document.createElement("iframe");
        this._iframeLayer.setAttribute("scrolling", "auto");
        this._iframeLayer.setAttribute("frameborder", "0");
        this.layer.appendChild(this._iframeLayer);
    }


    setURL(url)
    {
        this._iframeLayer.setAttribute("src", url);
        this._iframeLayer.setAttribute("width", "100%");
        this._iframeLayer.setAttribute("height", "100%");
    }
}