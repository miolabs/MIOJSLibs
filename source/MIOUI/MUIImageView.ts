/**
 * Created by godshadow on 12/3/16.
 */

/// <reference path="MUIView.ts" />

function MUIImageViewFromElementID(view, elementID)
{
    var layer = MUILayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;

    var iv = new MUIImageView();
    iv.initWithLayer(layer);
    view._linkViewToSubview(iv);

    return iv;
}

class MUIImageView extends MUIView
{
    private _imageLayer = null;

    initWithLayer(layer, options?)
    {
        super.initWithLayer(layer, options);

        this._imageLayer = MUILayerGetFirstElementWithTag(this.layer, "IMG");
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
