/**
 * Created by godshadow on 12/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOWebApplication.ts" />
/// <reference path="MIOButton.ts" />
/// <reference path="MIOMenu.ts" />
function MIOPopUpButtonFromElementID(view, elementID) {
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var button = new MIOPopUpButton(elementID);
    button.initWithLayer(layer);
    view._linkViewToSubview(button);
    return button;
}
var MIOPopUpButton = (function (_super) {
    __extends(MIOPopUpButton, _super);
    function MIOPopUpButton() {
        _super.apply(this, arguments);
        this._menu = null;
        this._isVisible = false;
    }
    MIOPopUpButton.prototype._customizeLayerSetup = function () {
        _super.prototype._customizeLayerSetup.call(this);
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
        this.setAction(this, function () {
            if (this._menu == null)
                return;
            if (this._menu.isVisible == false) {
                this._menu.showFromControl(this);
            }
            else {
                this._menu.hide();
            }
        });
    };
    MIOPopUpButton.prototype.setMenuAction = function (target, action) {
        if (this._menu != null) {
            this._menu.target = target;
            this._menu.action = action;
        }
    };
    MIOPopUpButton.prototype.addMenuItemWithTitle = function (title) {
        if (this._menu == null) {
            this._menu = new MIOMenu();
            this._menu.init();
        }
        this._menu.addMenuItem(MIOMenuItem.itemWithTitle(title));
    };
    return MIOPopUpButton;
}(MIOButton));
//# sourceMappingURL=MIOPopUpButton.js.map