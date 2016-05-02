/**
 * Created by godshadow on 12/3/16.
 */

    /// <reference path="MIOView.ts" />
    /// <reference path="MIOStepControlButton.ts" />

function MIOStepControlFromElementID(view, elementID)
{
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;

    var step = new MIOStepControl();
    step.initWithLayer(layer);
    view._linkViewToSubview(step);

    return step;
}

class MIOStepControl extends MIOView
{
    buttons = [];
    separators = [];
    selectedButtonIndex = -1;

    addButton(percentage, title, image)
    {
        if (this.buttons.length > 0)
        {
            var separator = new MIOStepControlSeparator();
            separator.init();
            this.addSubview(separator);
            this.separators.push(separator);
        }

        var button = new MIOStepControlButton();
        button.initWithTitle(percentage, title, this.buttons.length + 1);
        this.addSubview(button);
        this.buttons.push(button);

        if (this.buttons.length == 1)
            this.selectButtonAtIndex(0);
    }

    layout()
    {
        super.layout();

        var maxWidth = this.layer.clientWidth - (2 * (this.buttons.length - 1));

        // Calculate widths
        for (var index = 0; index < this.buttons.length; index++)
        {
            var button = this.buttons[index];
            var p = parseInt(button.percentage.slice(0, -1));
            var w = (p * maxWidth) / 100;
            button.width = w;
        }

        var x = 0;

        for (var index = 0; index < this.buttons.length; index++)
        {
            var button = this.buttons[index];

            button.layer.style.top = "0px";
            button.layer.style.left = x + "px";
            button.layer.style.width = button.width + "px";
            button.layer.style.height = this.layer.clientHeight + "px";

            x += button.width;

            if (index < this.buttons.length - 1)
            {
                var separator = this.separators[index];
                separator.layer.style.left = x + "px";

                x += 2;
            }
        }

    }

    selectButtonAtIndex(index)
    {
        if (index == this.selectedButtonIndex)
            return;

        if (this.selectedButtonIndex > -1)
            MIOStepControlButtonUnselect(this.buttons[this.selectedButtonIndex]);

        if (index >= this.buttons.length)
            return;

        MIOStepControlButtonSelect(this.buttons[index]);

        this.selectedButtonIndex = index;
    }

    selectNextButton()
    {
        this.selectButtonAtIndex(this.selectedButtonIndex + 1);
    }

    selectPrevButton()
    {
        this.selectButtonAtIndex(this.selectedButtonIndex - 1);
    }

}

function MIOStepControlButtonSelect(step_button)
{
    var layer = step_button.layer;
    var button_index = layer.childNodes[0];
    button_index.classList.remove("step_control_button_unselected");
    button_index.classList.add("step_control_button_selected");

    var button_title = layer.childNodes[1];
    button_title.classList.remove("step_control_button_unselected");
    button_title.classList.add("step_control_button_selected");
}

function MIOStepControlButtonUnselect(step_button)
{
    var layer = step_button.layer;
    var button_index = layer.childNodes[0];
    button_index.classList.remove("step_control_button_selected");
    button_index.classList.add("step_control_button_unselected");

    var button_title = layer.childNodes[1];
    button_title.classList.remove("step_control_button_selected");
    button_title.classList.add("step_control_button_unselected");
}

