import { MUIView, MUILayerGetFirstElementWithTag } from "./MUIView";

/**
 * Created by godshadow on 04/08/16.
 */

export class MUIWebView extends MUIView
{
    private _iframeLayer = null;

    init()
    {
        super.init();
        this._setupLayer();
    }

    initWithLayer(layer, owner, options?)
    {
        super.initWithLayer(layer, owner, options);

        this._iframeLayer = MUILayerGetFirstElementWithTag(this.layer, "IFRAME");
        this._setupLayer();
    }

    private _setupLayer(){

        if (this._iframeLayer == null) {
            this._iframeLayer = document.createElement("iframe");
            this._iframeLayer.setAttribute("scrolling", "auto");
            this._iframeLayer.setAttribute("frameborder", "0");
            this._iframeLayer.setAttribute("width", "100%");
            this._iframeLayer.setAttribute("height", "100%");            
            this.layer.appendChild(this._iframeLayer);
        }
    }

    setURL(url) {
        this._iframeLayer.setAttribute("src", url);
    }

    setHTML(html) {
        var iframe = this._iframeLayer.contentWindow || (this._iframeLayer.contentDocument.document || this._iframeLayer.contentDocument);
        
        iframe.document.open();
        iframe.document.write(html);
        iframe.document.close();        
    }
}