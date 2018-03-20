import { MUIButton } from "./MUIButton";
import { MUIMenuItem, MUIMenu } from "./MUIMenu";

/**
 * Created by godshadow on 12/3/16.
 */

export class MUIPopUpButton extends MUIButton
{
    private _menu = null;
    private _isVisible = false;

    initWithLayer(layer, owner, options?)
    {
        super.initWithLayer(layer, owner, options);

        // Check if we have a menu
        /*if (this.layer.childNodes.length > 0)
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
         }*/

        // Set action
        this.setAction(this, function() {

            if (this._menu == null) return;

            if (this._menu.isVisible == false) {
                this._menu.showFromControl(this);
            }
            else {
                this._menu.hide();
            }
        });
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
            this._menu = new MUIMenu();
            this._menu.init();
        }

        this._menu.addMenuItem(MUIMenuItem.itemWithTitle(title));
    }
}

