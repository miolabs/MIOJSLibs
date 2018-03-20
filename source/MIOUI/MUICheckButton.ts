import { MUIControl } from "./MUIControl";

/**
 * Created by godshadow on 12/3/16.
 */

export class MUICheckButton extends MUIControl
{
    target = null;
    action = null;
    on = false; //Off

    initWithLayer(layer, owner, options?)
    {
        super.initWithLayer(layer, owner, options);

        this.layer.classList.add("checkbox");
        this.layer.classList.add("off");
        // this.layer.classList.add("check_button_state_off");

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
             this.layer.classList.remove("off");
             this.layer.classList.add("on");
        }
        else
        {
            this.layer.classList.remove("on");
            this.layer.classList.add("off");
        }
    }

    toggleValue()
    {
        this.setOn(!this.on);

        if (this.target != null && this.action != null)
            this.action.call(this.target, this, this.on);
    }
}
