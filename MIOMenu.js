/**
 * Created by godshadow on 5/5/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOView.ts" />
var MIOMenuItem = (function (_super) {
    __extends(MIOMenuItem, _super);
    function MIOMenuItem() {
        _super.apply(this, arguments);
        this.checked = false;
        this.title = null;
        this.parent = null;
    }
    MIOMenuItem.itemWithLayer = function (layer) {
        var layerID = layer.getAttribute("id");
        var mi = new MIOMenuItem(layerID);
        mi.initWithLayer(layer);
        mi.title = layer.innerHTML;
        return mi;
    };
    MIOMenuItem.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this.layer.classList.add("menu_item");
        var instance = this;
        this.layer.onclick = function () {
            if (instance.parent != null) {
                var index = instance.parent.items.indexOf(instance);
                instance.parent.action.call(instance.parent.target, instance, index);
            }
        };
    };
    return MIOMenuItem;
}(MIOView));
var MIOMenu = (function (_super) {
    __extends(MIOMenu, _super);
    function MIOMenu() {
        _super.apply(this, arguments);
        this.items = [];
        this._isVisible = false;
        this.target = null;
        this.action = null;
    }
    MIOMenu.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        // Check if we have a menu
        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var layer = this.layer.childNodes[index];
                if (layer.tagName == "DIV") {
                    var item = MIOMenuItem.itemWithLayer(layer);
                    item.parent = this;
                    this._linkViewToSubview(item);
                    this._addMenuItem(item);
                }
            }
        }
        this.layer.classList.add("menu");
        this.layer.style.zIndex = 100;
        this.setAlpha(0);
    };
    MIOMenu.prototype._addMenuItem = function (menuItem) {
        this.items.push(menuItem);
    };
    MIOMenu.prototype.addMenuItem = function (menuItem) {
    };
    MIOMenu.prototype.removeMenuItem = function (menuItem) {
    };
    MIOMenu.prototype.show = function () {
        this._isVisible = true;
        this.layer.style.zIndex = 100;
        this.setAlpha(1, true, 0.25);
    };
    MIOMenu.prototype.hide = function () {
        this._isVisible = false;
        this.layer.style.zIndex = "auto";
        this.setAlpha(0, true, 0.25);
    };
    MIOMenu.prototype.toggle = function () {
        if (this._isVisible)
            this.hide();
        else
            this.show();
    };
    return MIOMenu;
}(MIOView));
//# sourceMappingURL=MIOMenu.js.map