/**
 * Created by godshadow on 12/3/16.
 */

    /// <reference path="MIOButton.ts" />

class MIOStepControlButton extends MIOButton
{
    percentage = 0;
    width = 0;
    title = null;
    index = 0;
    selectedButtonIndex = -1;

    initWithTitle(percentage, title, index)
    {
        super.init();

        this.percentage = percentage;
        this.title = title;
        this.index = index;

        this.layer.setAttribute("id", "step_control_button");
        this.layer.style.position = "absolute";

        var button_index = document.createElement("div");
        button_index.setAttribute("id", "step_control_button_index");
        button_index.innerHTML = index;
        button_index.classList.add("step_control_button_unselected");
        this.layer.appendChild(button_index);

        var button_title = document.createElement("div");
        button_title.setAttribute("id", "step_control_button_title");
        button_title.innerHTML = title;
        button_title.classList.add("step_control_button_unselected");
        this.layer.appendChild(button_title);
    }
}

/*
 Separator class
 */

class MIOStepControlSeparator extends MIOView
{
    constructor()
    {
        super();
    }

    init()
    {
        super.init();

        this.layer.setAttribute("id", "step_control_button_separator");
    }
}
