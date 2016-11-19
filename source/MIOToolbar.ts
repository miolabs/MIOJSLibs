/**
 * Created by godshadow on 22/5/16.
 */

/// <reference path="MIOButton.ts" />

class MIOToolbarButton extends MIOButton
{
    public static buttonWithLayer(layer)
    {
        var tb = new MIOToolbarButton();
        tb.initWithLayer(layer);

        return tb;
    }
}

class MIOToolbar extends MIOView
{
    buttons = [];

    protected _customizeLayerSetup()
    {
        super._customizeLayerSetup();

        // Check if we have sub nodes
        if (this.layer.childNodes.length > 0)
        {
            for (var index = 0; index < this.layer.childNodes.length; index++)
            {
                var layer = this.layer.childNodes[index];
                if (layer.tagName == "DIV")
                {
                    var button = MIOToolbarButton.buttonWithLayer(layer);
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