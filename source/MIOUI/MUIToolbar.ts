import { MUIButton } from "./MUIButton";
import { MUIView } from "./MUIView";

/**
 * Created by godshadow on 22/5/16.
 */


export class MUIToolbarButton extends MUIButton
{
    public static buttonWithLayer(layer, owner)
    {        
        var lid = layer.getAttribute("id");
        var tb = new MUIToolbarButton(lid); 
        tb.initWithLayer(layer, owner);

        return tb;
    }
}

export class MUIToolbar extends MUIView
{
    buttons = [];

    initWithLayer(layer, owner, options?)
    {
        super.initWithLayer(layer, owner, options);

        // Check if we have sub nodes
        if (this.layer.childNodes.length > 0)
        {
            for (var index = 0; index < this.layer.childNodes.length; index++)
            {
                let layer = this.layer.childNodes[index]; // TODO: variablename shadows parameter
                if (layer.tagName == "DIV")
                {
                    var lid = layer.getAttribute("id");
                    var tb = new MUIToolbarButton(lid); 
                    var button = MUIToolbarButton.buttonWithLayer(layer, owner);
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