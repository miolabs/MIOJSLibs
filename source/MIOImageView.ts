/**
 * Created by godshadow on 12/3/16.
 */

    /// <reference path="MIOView.ts" />

function MIOImageViewFromElementID(view, elementID)
{
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;

    var iv = new MIOImageView();
    iv.initWithLayer(layer);
    view._linkViewToSubview(iv);

    return iv;
}

class MIOImageView extends MIOView
{
    private _imageLayer = null;

    initWithLayer(layer, options?)
    {
        super.initWithLayer(layer, options);

        this._imageLayer = MIOLayerGetFirstElementWithTag(this.layer, "IMG");
        if (this._imageLayer == null) {
            this._imageLayer = document.createElement("img");
            this._imageLayer.style.width = "100%";
            this._imageLayer.style.height = "100%";
            this.layer.appendChild(this._imageLayer);
        }
    }

    setImage(imageURL)
    {
        this._imageLayer.setAttribute("src", imageURL);
    }
}
