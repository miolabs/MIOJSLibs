/**
 * Created by godshadow on 12/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOButton.ts" />
/// <reference path="MIOMenu.ts" />
var MIOPopUpButton = (function (_super) {
    __extends(MIOPopUpButton, _super);
    function MIOPopUpButton() {
        _super.apply(this, arguments);
        this.popUpMenu = null;
    }
    MIOPopUpButton.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        // Check if we have a menu
        if (this.layer.childNodes.length > 0) {
            // Get the first div element. We don't support more than one element
            var index = 0;
            var menuLayer = this.layer.childNodes[index];
            while (menuLayer.tagName != "DIV") {
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
            this.setAction(this, function () {
                this.popUpMenu.toggle();
            });
        }
    };
    MIOPopUpButton.prototype.setMenuAction = function (target, action) {
        if (this.popUpMenu != null) {
            this.popUpMenu.target = target;
            this.popUpMenu.action = action;
        }
    };
    MIOPopUpButton.prototype.layout = function () {
        _super.prototype.layout.call(this);
    };
    return MIOPopUpButton;
})(MIOButton);
//# sourceMappingURL=MIOPopUpButton.js.map