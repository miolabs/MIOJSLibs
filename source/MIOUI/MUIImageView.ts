/**
 * Created by godshadow on 12/3/16.
 */

/// <reference path="MUIView.ts" />

class MUIImageView extends MUIView
{
    private _imageLayer = null;

    initWithLayer(layer, owner, options?)
    {
        super.initWithLayer(layer, owner, options);

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
