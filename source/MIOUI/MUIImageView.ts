import { MUILayerGetFirstElementWithTag, MUIView } from "./MUIView";

/**
 * Created by godshadow on 12/3/16.
 */

export class MUIImageView extends MUIView
{
    private _imageLayer = null;

    init(){
        super.init();
        this.setupLayers();
    }

    initWithLayer(layer, owner, options?){
        super.initWithLayer(layer, owner, options);
        this._imageLayer = MUILayerGetFirstElementWithTag(this.layer, "IMG");
        this.setupLayers();
    }

    private setupLayers(){
        if (this._imageLayer == null) {
            this._imageLayer = document.createElement("img");
            this._imageLayer.style.width = "100%";
            this._imageLayer.style.height = "100%";
            this.layer.appendChild(this._imageLayer);
        }
    }

    setImage(imageURL){
        if (imageURL != null){
            this._imageLayer.setAttribute("src", imageURL);
        }
        else {
            this._imageLayer.removeAttribute("src");
        }

    }

    setHeight(h){
        super.setHeight(h);
        this._imageLayer.setAttribute("height", h);
    }

    setWidth(w){
        super.setWidth(w);
        this._imageLayer.setAttribute("width", w);
    }
}
