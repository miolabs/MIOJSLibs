/**
 * Created by godshadow on 11/3/16.
 */

/// <reference path="MIOView.ts" />

function MIOLabelFromElementID(view, elementID)
{
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;

    var label = new MIOLabel();
    label.initWithLayer(layer);
    view._linkViewToSubview(label);

    return label;
}


class MIOLabel extends MIOView
{
    text = null;
    textLayer = null;
    autoAdjustFontSize = "none";
    autoAdjustFontSizeValue = 4;

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
        this.textLayer = document.createElement("span");
        this.textLayer.classList.add("label_style");
        this.layer.appendChild(this.textLayer);
    }

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

    setText(text)
    {
        this.text = text;
        this.textLayer.innerHTML = text;
    }

    setTextAlignment(alignment)
    {
        this.layer.style.textAlign = alignment;
    }

    setHightlighted(value)
    {
        if (value == true)
        {
            this.textLayer.classList.add("label_highlighted_color");
        }
        else
        {
            this.textLayer.classList.remove("label_highlighted_color");
        }
    }

    setTextRGBColor(r, g, b)
    {
        var value = "rgb(" + r + ", " + g + ", " + b + ")";
        this.textLayer.style.color = value;
    }

    setFontSize(size)
    {
        this.textLayer.style.fontSize = size + "px";
    }

    setFontStyle(style)
    {
        this.textLayer.style.fontWeight = style;
    }

    setFontFamily(fontFamily)
    {
        this.textLayer.style.fontFamily = fontFamily;
    }
}
