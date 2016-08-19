/**
 * Created by godshadow on 12/3/16.
 */

    /// <reference path="MIOWebApplication.ts" />
    /// <reference path="MIOButton.ts" />
    /// <reference path="MIOMenu.ts" />

class MIOPopUpButton extends MIOButton
{
    private _menu = null;

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
                this._menu = new MIOMenu(layerID);
                this._menu.initWithLayer(menuLayer);

                var x = 10;
                var y = this.getHeight();
                this._menu.setX(x);
                this._menu.setY(y);

                this._linkViewToSubview(this._menu);
            }

            // Set action
            this.setAction(this, function(){

                MIOWebApplication.sharedInstance().showMenuFromView(this, this._menu);
                //this._menu.toggle();
            });
        }
    }

    setMenuAction(target, action)
    {
        if (this._menu != null)
        {
            this._menu.target = target;
            this._menu.action = action;
        }
    }

    addMenuItemWithTitle(title)
    {
        if (this._menu == null)
        {
            this._menu = new MIOMenu();
            this._menu.init();
            this.addSubview(this._menu);
        }

        this._menu.addMenuItem(MIOMenuItem.itemWithTitle(title));
    }
}

