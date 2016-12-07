/**
 * Created by godshadow on 12/3/16.
 */

    /// <reference path="MIOControl.ts" />

function MIOCheckButtonFromElementID(view, elementID)
{
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;

    var button = new MIOCheckButton();
    button.initWithLayer(layer);
    view._linkViewToSubview(button);

    return button;
}

class MIOCheckButton extends MIOControl
{
    target = null;
    action = null;
    on = false; //Off

    initWithLayer(layer, options?)
    {
        super.initWithLayer(layer, options);

        this.layer.classList.add("check_button");
        this.layer.classList.add("check_button_state_off");

        var instance = this;
        this.layer.onclick = function() {

            if (instance.enabled) {
                instance.toggleValue.call(instance);
            }
        }
    }

    setOnChangeValue(target, action)
    {
        this.target = target;
        this.action = action;
    }

    setOn(on)
    {
        this.on = on;
        if (on == true)
        {
            this.layer.classList.remove("check_button_state_off");
            this.layer.classList.add("check_button_state_on");
        }
        else
        {
            this.layer.classList.remove("check_button_state_on");
            this.layer.classList.add("check_button_state_off");
        }
    }

    toggleValue()
    {
        this.setOn(!this.on);

        if (this.target != null && this.action != null)
            this.action.call(this.target, this, this.on);
    }
}
