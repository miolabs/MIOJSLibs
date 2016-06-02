/**
 * Created by godshadow on 12/3/16.
 */

    /// <reference path="MIOControl.ts" />
    /// <reference path="MIOString.ts" />

class MIOButton extends MIOControl
{
    private _titleLayer = null;

    target = null;
    action = null;

    selected = false;

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
        // Check for title layer
        this._titleLayer = MIOLayerGetFirstElementWithTag(this.layer, "SPAN");

        if (this._titleLayer == null) {
            this._titleLayer = document.createElement("span");
            this._titleLayer.style.textAlign = "center";
        }

        this.layer.appendChild(this._titleLayer);

        var key = this.layer.getAttribute("data-title");
        if (key != null)
            this.setTitle(MIOLocalizeString(key, key));

        this.layer.classList.add("button");

        var instance = this;
        this.layer.onmousedown = function()
        {
            if (instance.enabled) {
                instance.setSelected(true);
            }
        }

        this.layer.onmouseup = function()
        {
            if (instance.enabled) {
                instance.setSelected(false);
                if (instance.action != null && instance.target != null)
                    instance.action.call(instance.target);
            }
        }
    }

    initWithAction(target, action)
    {
        super.init();

        this.setAction(target, action);
    }

    setAction(target, action)
    {
        this.target = target;
        this.action = action;
    }

    setTitle(title)
    {
        this._titleLayer.innerHTML = title;
    }

    setSelected(value)
    {
        if (value == true) {
            this.layer.classList.remove("button_normal");
            this.layer.classList.add("button_selected");
        }
        else
        {
            this.layer.classList.remove("button_selected");
            this.layer.classList.add("button_normal");
        }

        this.selected = value;
    }
}



