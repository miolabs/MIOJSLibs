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

class MIOCheckButton extends MIOButton
{
    on = false; //Off

    constructor()
    {
        super();
    }

    init()
    {
        super.init();
//		this.layer.classList.remove("step_control_button_unselected");
        this.layer.classList.add("check_button_state_off");

    }

    initWithLayer(layer)
    {
        super.initWithLayer(layer);
        this.layer.classList.add("check_button_state_off");
        this.setAction(this, this.toggleCheckButton);
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

    toggleCheckButton()
    {
        this.setOn(!this.on);
    }
}
