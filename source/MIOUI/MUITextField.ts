/**
 * Created by godshadow on 12/3/16.
 */

/// <reference path="MUIView.ts" />
/// <reference path="MUIControl.ts" />


enum MUITextFieldType {
    NormalType,
    PasswordType,
    SearchType
}

class MUITextField extends MUIControl
{
    placeHolder = null;
    private _inputLayer = null;
    type = MUITextFieldType.NormalType;

    textChangeTarget = null;
    textChangeAction = null;

    enterPressTarget = null;
    enterPressAction = null;

    init()
    {
        super.init();

        this._setupLayer();
    }

    initWithLayer(layer, owner, options?)
    {
        super.initWithLayer(layer, owner, options);

        this._inputLayer = MUILayerGetFirstElementWithTag(this.layer, "INPUT");

        this._setupLayer();
    }

    private _setupLayer()
    {
        if (this._inputLayer == null)
        {
            this._inputLayer = document.createElement("input");

            if (this.type == MUITextFieldType.SearchType) {
                this._inputLayer.style.marginLeft = "10px";
                this._inputLayer.style.marginRight = "10px";
            }
            else {
                this._inputLayer.style.marginLeft = "5px";
                this._inputLayer.style.marginRight = "5px";
            }

            this._inputLayer.style.border = "0px";
            this._inputLayer.style.backgroundColor = "transparent";
            this._inputLayer.style.width = "100%";
            this._inputLayer.style.height = "100%";
            this._inputLayer.style.color = "inherit";
            this._inputLayer.style.fontSize = "inherit";
            this._inputLayer.style.fontFamily = "inherit";
            this._inputLayer.style.outline = "none";

            this.layer.appendChild(this._inputLayer);
        }

        var placeholderKey = this.layer.getAttribute("data-placeholder");
        if (placeholderKey != null)
            this._inputLayer.setAttribute("placeholder", MIOLocalizeString(placeholderKey, placeholderKey));
    }

    layout()
    {
        super.layout();

        var w = this.getWidth();
        var h = this.getHeight();

        this._inputLayer.style.marginLeft = "4px";
        this._inputLayer.style.width = (w - 8) + "px";
        this._inputLayer.style.marginTop = "4px";
        this._inputLayer.style.height = (h - 8) + "px";
    }

    setText(text)
    {
        this.text = text;
    }

    set text(text)
    {
        this._inputLayer.value = text != null ? text : "";
    }

    get text()
    {
        return this._inputLayer.value;
    }

    setPlaceholderText(text)
    {
        this.placeHolder = text;
        this._inputLayer.setAttribute("placeholder", text);
    }

    setOnChangeText(target, action)
    {
        this.textChangeTarget = target;
        this.textChangeAction = action;
        var instance = this;

        this.layer.oninput = function()
        {
            if (instance.enabled)
                instance.textChangeAction.call(target, instance, instance._inputLayer.value);
        }
    }

    setOnEnterPress(target, action)
    {
        this.enterPressTarget = target;
        this.enterPressAction = action;
        var instance = this;

        this.layer.onkeyup = function(e)
        {
            if (instance.enabled) {
                if (e.keyCode == 13)
                    instance.enterPressAction.call(target, instance, instance._inputLayer.value);
            }
        }
    }

    setTextRGBColor(r, g, b)
    {
        var value = "rgb(" + r + ", " + g + ", " + b + ")";
        this._inputLayer.style.color = value;
    }

    set textColor(color)
    {
        this._inputLayer.style.color = color;
    }

    get textColor()
    {
        var color = this._getValueFromCSSProperty("color");
        return color;
    }

    becomeFirstResponder()
    {
        this._inputLayer.focus();
    }

}

