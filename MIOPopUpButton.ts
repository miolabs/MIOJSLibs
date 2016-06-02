/**
 * Created by godshadow on 12/3/16.
 */

    /// <reference path="MIOButton.ts" />
    /// <reference path="MIOMenu.ts" />

class MIOPopUpButton extends MIOButton
{
    popUpMenu = null;

    initWithLayer(layer, options?)
    {
        super.initWithLayer(layer, options);

        // Check if we have a menu
        if (this.layer.childNodes.length > 0)
        {
            // Get the first div element. We don't support more than one element
            var index = 0;
            var menuLayer = this.layer.childNodes[index];
            while(menuLayer.tagName != "DIV")
            {
                index++;
                if (index >= this.layer.childNodes.length) {
                    menuLayer = null;
                    break;
                }

                menuLayer = this.layer.childNodes[index];
            }

            if (menuLayer != null) {
                var layerID = menuLayer.getAttribute("id");
                this.popUpMenu = new MIOMenu(layerID);
                this.popUpMenu.initWithLayer(menuLayer);

                var x = 10;
                var y = this.getHeight();
                this.popUpMenu.setX(x);
                this.popUpMenu.setY(y);

                this._linkViewToSubview(this.popUpMenu);
            }

            // Set action
            this.setAction(this, function(){

                this.popUpMenu.toggle();
            });
        }
    }

    setMenuAction(target, action)
    {
        if (this.popUpMenu != null)
        {
            this.popUpMenu.target = target;
            this.popUpMenu.action = action;
        }
    }

    layout()
    {
        super.layout();

    }


}

