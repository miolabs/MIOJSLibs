
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

var _MUIViewNextLayerID = 0;

function MIOViewGetNextLayerID(prefix?):string {
    var layerID = null;
    if (prefix == null)
    {
        _MUIViewNextLayerID++;
        layerID = _MUIViewNextLayerID;
    }
    else
    {
        layerID = prefix + "_" + _MUIViewNextLayerID;
    }

    return layerID;
}


class MUIView extends MIOObject
{
    layerID = null;
    layer = null;

    constructor(layerID?)
    {
        super();
        if (layerID != null)
            this.layerID = layerID;
        else
            this.layerID = MIOViewGetNextLayerID();
    }

    init()
    {
        this.layer = document.createElement("div");
        this.layer.setAttribute("id", this.layerID);
        this.layer.style.position = "absolute";
        this.layer.style.top = "0px";
        this.layer.style.left = "0px";
        this.layer.style.width = "100%";
        this.layer.style.height = "100%";
        this.layer.style.background = "rgb(255, 255, 255)";
    }

}