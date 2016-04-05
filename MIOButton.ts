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

    constructor()
    {
        super();
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
        var instance = this;

        this.layer.onclick = function()
        {
            if (instance.enabled)
                instance.action.call(target);
        }
    }

    setTitle(title)
    {
        this.layer.innerHTML = title;
    }
}



