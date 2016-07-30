/**
 * Created by godshadow on 12/3/16.
 */

/// <reference path="MIOView.ts" />
/// <reference path="MIOControl.ts" />
/// <reference path="MIOString.ts" />

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

enum MIOTextFieldType {
    NormalType,
    PasswordType,
    SearchType
}

class MIOTextField extends MIOControl
{
    placeHolder = null;
    inputLayer = null;
    type = MIOTextFieldType.NormalType;

    textChangeTarget = null;
    textChangeAction = null;

    enterPressTarget = null;
    enterPressAction = null;

    init()
    {
        super.init();
        this._setupLayer();
    }

    initWithLayer(layer, options?)
    {
        super.initWithLayer(layer, options);
        this._setupLayer();
    }

    _setupLayer()
    {
        switch (this.layerOptions)
        {
            case "SearchType":
                this.type = MIOTextFieldType.SearchType;
                break;

            case "PasswordType":
                this.type = MIOTextFieldType.PasswordType;
                break;

            default:
                this.type = MIOTextFieldType.NormalType;
                break;
        }

        if (this.type == MIOTextFieldType.SearchType)
            this.layer.classList.add("searchfield");
        else
            this.layer.classList.add("textfield");

        this.inputLayer = document.createElement("input");

        if (this.type == MIOTextFieldType.PasswordType)
            this.inputLayer.setAttribute("type", "password");
        else
            this.inputLayer.setAttribute("type", "text");
        this.inputLayer.style.backgroundColor = "transparent";
        this.inputLayer.style.border = "0px";
        this.inputLayer.style.width = "100%";
        if (this.type == MIOTextFieldType.SearchType) {
            this.inputLayer.style.marginLeft = "10px";
            this.inputLayer.style.marginRight = "10px";
        }
        else
        {
            this.inputLayer.style.marginLeft = "5px";
            this.inputLayer.style.marginRight = "5px";
        }
        this.inputLayer.style.height = "100%";
        this.inputLayer.style.color = "inherit";
        this.inputLayer.style.fontSize = "inherit";
        this.inputLayer.style.fontFamily = "inherit";
        this.inputLayer.style.outline = "none";
        this.layer.appendChild(this.inputLayer);

        var placeholderKey = this.layer.getAttribute("data-placeholder-localize-key");
        if (placeholderKey != null)
            this.inputLayer.setAttribute("placeholder", MIOLocalizeString(placeholderKey, placeholderKey));
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
        this.text = text;
    }

    set text(text)
    {
        this.inputLayer.value = text == null ? "" : text;
    }

    get text()
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

        this.layer.oninput = function()
        {
            if (instance.enabled)
                instance.textChangeAction.call(target, instance, instance.inputLayer.value);
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
                    instance.enterPressAction.call(target, instance, instance.inputLayer.value);
            }
        }
    }
}

