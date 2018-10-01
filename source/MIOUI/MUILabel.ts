import { MUIView, MUILayerGetFirstElementWithTag } from "./MUIView";
import { MUICoreLayerAddStyle } from ".";

/**
 * Created by godshadow on 11/3/16.
 */


export class MUILabel extends MUIView
{
    private _textLayer = null;
    autoAdjustFontSize = "none";
    autoAdjustFontSizeValue = 4;

    init(){
        super.init();
        MUICoreLayerAddStyle(this.layer, "label");
        this.setupLayers();
    }

    initWithLayer(layer, owner, options?){
        super.initWithLayer(layer, owner, options);
        this._textLayer = MUILayerGetFirstElementWithTag(this.layer, "SPAN");
        this.setupLayers();
    }

    private setupLayers(){
        //MUICoreLayerAddStyle(this.layer, "lbl");
    
        if (this._textLayer == null){
            this.layer.innerHTML = "";
            this._textLayer = document.createElement("span");
            this._textLayer.style.top = "3px";
            this._textLayer.style.left = "3px";
            this._textLayer.style.right = "3px";
            this._textLayer.style.bottom = "3px";
            //this._textLayer.style.font = "inherit";
            //this._textLayer.style.fontSize = "inherit";
            this.layer.appendChild(this._textLayer);
        }
    }
/*
    layout()
    {
        super.layout();

        //var h = this.getHeight();
        //this.textLayer.style.lineHeight = h + "px";

        if (this.autoAdjustFontSize == "width")
        {
            var w = this.getWidth();
            var size = w / this.autoAdjustFontSizeValue;
            this.layer.style.fontSize = size + 'px';
            var maxSize = this.getHeight();
            if (size > maxSize)
                this.layer.style.fontSize = maxSize + 'px';
            else
                this.layer.style.fontSize = size + 'px';
        }
        else if (this.autoAdjustFontSize == "height")
        {
            var h = this.getHeight();
            var size = h / this.autoAdjustFontSizeValue;
            this.layer.style.fontSize = size + 'px';
            var maxSize = this.getHeight();
            if (size > maxSize)
                this.layer.style.fontSize = maxSize + 'px';
            else
                this.layer.style.fontSize = size + 'px';
        }
    }
*/
    setText(text){
        this.text = text;
    }
    
    get text(){
        return this._textLayer.innerHTML;
    }

    set text(text){
        this._textLayer.innerHTML = text != null ? text : "";
    }

    setTextAlignment(alignment)
    {
        this.layer.style.textAlign = alignment;
    }

    setHightlighted(value)
    {
        if (value == true)
        {
            this._textLayer.classList.add("label_highlighted_color");
        }
        else
        {
            this._textLayer.classList.remove("label_highlighted_color");
        }
    }

    setTextRGBColor(r, g, b)
    {
        var value = "rgb(" + r + ", " + g + ", " + b + ")";
        this._textLayer.style.color = value;
    }

    setFontSize(size)
    {
        this._textLayer.style.fontSize = size + "px";
    }

    setFontStyle(style)
    {
        this._textLayer.style.fontWeight = style;
    }

    setFontFamily(fontFamily)
    {
        this._textLayer.style.fontFamily = fontFamily;
    }
}
