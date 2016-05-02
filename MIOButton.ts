/**
 * Created by godshadow on 12/3/16.
 */

    /// <reference path="MIOControl.ts" />

function MIOButtonFromElementID(view, elementID)
{
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;

    var button = new MIOButton();
    button.initWithLayer(layer);
    view._linkViewToSubview(button);

    return button;
}

class MIOButton extends MIOControl
{
    target = null;
    action = null;

    selected = false;

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
        this.layer.innerHTML = title;
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



