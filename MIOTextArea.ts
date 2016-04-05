/**
 * Created by godshadow on 15/3/16.
 */

    /// <reference path="MIOCore.ts" />

function MIOTextAreaFromElementID(view, elementID)
{
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;

    var ta = new MIOTextArea();
    ta.initWithLayer(layer);
    view._linkViewToSubview(ta);

    return ta;
}


class MIOTextArea extends MIOControl
{
    textareaLayer = null;

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
        this.textareaLayer = document.createElement("textarea");
        this.textareaLayer.style.width = "100%";
        this.textareaLayer.style.height = "100%";
        this.textareaLayer.backgroundColor = "transparent";
        this.layer.appendChild(this.textareaLayer);
    }
}
