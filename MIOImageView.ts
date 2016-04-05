/**
 * Created by godshadow on 12/3/16.
 */

    /// <reference path="MIOCore.ts" />

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
    imageLayer = null;

    constructor()
    {
        super();
    }

    init()
    {
        super.init();
        this._setupLayer();
    }

    initWithLayer(layer)
    {
        super.initWithLayer(layer);
        this._setupLayer();
    }

    _setupLayer()
    {
        this.imageLayer = document.createElement("img");
        this.imageLayer.style.width = "100%";
        this.imageLayer.style.height = "100%";
        this.layer.appendChild(this.imageLayer);
    }

    setImage(imageURL)
    {
        this.imageLayer.setAttribute("src", imageURL);
    }
}
