/**
 * Created by godshadow on 22/5/16.
 */

/// <reference path="MUIButton.ts" />

class MUIToolbarButton extends MUIButton
{
    public static buttonWithLayer(layer)
    {
        var tb = new MUIToolbarButton();
        tb.initWithLayer(layer);

        return tb;
    }
}

class MIOToolbar extends MUIView
{
    buttons = [];

    initWithLayer(layer, options)
    {
        super.initWithLayer(layer, options);

        // Check if we have sub nodes
        if (this.layer.childNodes.length > 0)
        {
            for (var index = 0; index < this.layer.childNodes.length; index++)
            {
                var layer = this.layer.childNodes[index];
                if (layer.tagName == "DIV")
                {
                    var button = MUIToolbarButton.buttonWithLayer(layer);
                    button.parent = this;

                    this._linkViewToSubview(button);
                    this.addToolbarButton(button);
                }
            }
        }
    }

    addToolbarButton(button)
    {
        this.buttons.push(button);
    }
}