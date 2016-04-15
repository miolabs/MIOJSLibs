/**
 * Created by godshadow on 12/3/16.
 */

/// <reference path="MIOCore.ts" />

function MIOTextFieldFromElementID(view, elementID)
{
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;

    var tf = new MIOTextField();
    tf.initWithLayer(layer);
    view._linkViewToSubview(tf);

    return tf;
}

class MIOTextField extends MIOControl
{
    placeHolder = null;
    inputLayer = null;
    textChangeTarget = null;
    textChangeAction = null;

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
        //this.layer.contentEditable = true;

        this.inputLayer = document.createElement("input");
        this.inputLayer.setAttribute("type", "text");
        this.inputLayer.style.backgroundColor = "transparent";
        this.inputLayer.style.border = "0px";
        this.inputLayer.classList.add("text_field_style");
        this.layer.appendChild(this.inputLayer);
    }

    layout()
    {
        super.layout();

        var w = this.getWidth();
        var h = this.getHeight();

        this.inputLayer.style.marginLeft = "4px";
        this.inputLayer.style.width = (w - 8) + "px";
        this.inputLayer.style.marginTop = "4px";
        this.inputLayer.style.height = (h - 8) + "px";
    }

    setText(text)
    {
        this.inputLayer.value = text == null ? "" : text;
    }

    getText()
    {
        return this.inputLayer.value;
    }

    setPlaceholderText(text)
    {
        this.placeHolder = text;
        this.inputLayer.setAttribute("placeholder", text);
    }

    setOnChangeText(target, action)
    {
        this.textChangeTarget = target;
        this.textChangeAction = action;
        var instance = this;

        //this.layer.onkeyup = function()
        //{
        //    if (instance.enabled)
        //        instance.textChangeAction.call(target, instance, instance.inputLayer.value);
        //}
        //
        //this.layer.onfocusout = function()
        //{
        //    if (instance.enabled)
        //        instance.textChangeAction.call(target, instance, instance.inputLayer.value);
        //}

        this.layer.oninput = function()
        {
            if (instance.enabled)
                instance.textChangeAction.call(target, instance, instance.inputLayer.value);
        }
    }
}

