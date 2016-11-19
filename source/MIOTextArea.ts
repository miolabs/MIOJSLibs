/**
 * Created by godshadow on 15/3/16.
 */

    /// <reference path="MIOControl.ts" />


class MIOTextArea extends MIOControl
{
    textareaLayer = null;

    textChangeTarget = null;
    textChangeAction = null;

    protected _customizeLayerSetup()
    {
        super._customizeLayerSetup();

        this.textareaLayer = document.createElement("textarea");
        this.textareaLayer.style.width = "98%";
        this.textareaLayer.style.height = "90%";
        //this.textareaLayer.backgroundColor = "transparent";
        this.textareaLayer.style.resize = "none";
        this.textareaLayer.style.borderStyle = "none";
        this.textareaLayer.style.borderColor = "transparent";
        this.textareaLayer.style.outline = "none";
        this.textareaLayer.overflow = "auto";
        this.layer.appendChild(this.textareaLayer);
    }

    get text()
    {
        return this.textareaLayer.value;
    }

    set text(text)
    {
        this.textareaLayer.value = text;
    }

    setText(text)
    {
        this.text = text;
    }

    getText()
    {
        return this.text;
    }

    setEditMode(value)
    {
        this.textareaLayer.disabled = !value;
    }

    setOnChangeText(target, action)
    {
        this.textChangeTarget = target;
        this.textChangeAction = action;
        var instance = this;

        this.layer.oninput = function()
        {
            if (instance.enabled) {
                var value = instance.textareaLayer.value;
                instance.textChangeAction.call(target, instance, value);
            }
        }
    }
}
