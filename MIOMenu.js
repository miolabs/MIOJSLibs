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
    function MIOMenuItem(layerID) {
        _super.call(this, layerID == null ? MIOViewGetNextLayerID("mio_menu_item") : layerID);
        this.checked = false;
        this.title = null;
        this.parent = null;
        this._titleLayer = null;
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
    MIOMenuItem.itemWithTitle = function (title) {
        var mi = new MIOMenuItem();
        mi.initWithTitle(title);
        return mi;
    };
    MIOMenuItem.prototype.initWithTitle = function (title) {
        this.layer = document.createElement("li");
        this._titleLayer = document.createElement("span");
        this._titleLayer.classList.add("menu_item");
        this._titleLayer.innerHTML = title;
        this.layer.appendChild(this._titleLayer);
        this.title = title;
    };
    return MIOMenuItem;
}(MIOView));
var MIOMenu = (function (_super) {
    __extends(MIOMenu, _super);
    function MIOMenu(layerID) {
        _super.call(this, layerID == null ? MIOViewGetNextLayerID("mio_menu") : layerID);
        this.items = [];
        this._isVisible = false;
        this._updateWidth = true;
        this.target = null;
        this.action = null;
    }
    MIOMenu.prototype.init = function () {
        this.layer = document.createElement("ul");
        //this.layer.classList.add("menu");
        //this.layer.style.zIndex = 100;
        //this.setHidden(true);
    };
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
        this.items.push(menuItem);
        this.layer.appendChild(menuItem.layer);
        this._updateWidth = true;
    };
    MIOMenu.prototype.removeMenuItem = function (menuItem) {
    };
    MIOMenu.prototype.show = function () {
        this._isVisible = true;
        this.setHidden(false);
        this.layout();
    };
    MIOMenu.prototype.hide = function () {
        this._isVisible = false;
        this.setHidden(true);
    };
    MIOMenu.prototype.toggle = function () {
        if (this._isVisible)
            this.hide();
        else
            this.show();
    };
    MIOMenu.prototype.layout = function () {
        if (this._isVisible == false)
            return;
        if (this._updateWidth == true) {
            var maxWidth = 0;
            for (var index = 0; index < this.items.length; index++) {
                var item = this.items[index];
                var w = item.getWidth();
                if (w > maxWidth)
                    maxWidth = w;
            }
        }
    };
    return MIOMenu;
}(MIOView));
//# sourceMappingURL=MIOMenu.js.map