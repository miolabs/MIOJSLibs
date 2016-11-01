/**
 * Created by godshadow on 25/08/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOCoreTypes.ts" />
/// <reference path="MIOView.ts" />
/// <reference path="MIOButton.ts" />
var MIOTabBarItem = (function (_super) {
    __extends(MIOTabBarItem, _super);
    function MIOTabBarItem() {
        _super.apply(this, arguments);
        this._titleStatusStyle = null;
        this._titleLayer = null;
        this._imageStatusStyle = null;
        this._imageLayer = null;
        this.isSelected = false;
    }
    MIOTabBarItem.prototype.initWithLayer = function (layer) {
        _super.prototype.initWithLayer.call(this, layer);
        if (layer.childNodes.length < 2)
            throw new Error("Tab bar item broken!");
        var count = 0;
        for (var index = 0; index < layer.childNodes.length; index++) {
            var l = layer.childNodes[index];
            if (l.tagName == "DIV") {
                count++;
                if (count == 1) {
                    this._imageLayer = l;
                    this._imageStatusStyle = l.getAttribute("data-status-style");
                }
                else if (count == 2) {
                    this._titleLayer = l;
                    this._titleStatusStyle = l.getAttribute("data-status-style");
                    break;
                }
            }
        }
    };
    MIOTabBarItem.prototype.setSelected = function (value) {
        if (value == true) {
            this._imageLayer.classList.remove(this._imageStatusStyle + "_off");
            this._imageLayer.classList.add(this._imageStatusStyle + "_on");
            this._titleLayer.classList.remove(this._titleStatusStyle + "_off");
            this._titleLayer.classList.add(this._titleStatusStyle + "_on");
        }
        else {
            this._imageLayer.classList.remove(this._imageStatusStyle + "_on");
            this._imageLayer.classList.add(this._imageStatusStyle + "_off");
            this._titleLayer.classList.remove(this._titleStatusStyle + "_on");
            this._titleLayer.classList.add(this._titleStatusStyle + "_off");
        }
        this.isSelected = value;
    };
    return MIOTabBarItem;
}(MIOView));
var MIOTabBar = (function (_super) {
    __extends(MIOTabBar, _super);
    function MIOTabBar() {
        _super.apply(this, arguments);
        this.items = [];
        this.selectedTabBarItemIndex = -1;
    }
    MIOTabBar.prototype.initWithLayer = function (layer) {
        _super.prototype.initWithLayer.call(this, layer);
        // TODO: change to buttons
        // Check for tab items
        for (var index = 0; index < layer.childNodes.length; index++) {
            var tabItemLayer = layer.childNodes[index];
            if (tabItemLayer.tagName == "DIV") {
                var ti = new MIOTabBarItem();
                ti.initWithLayer(tabItemLayer);
                this._addTabBarItem(ti);
            }
        }
        if (this.items.length > 0)
            this.selectTabBarItemAtIndex(0);
    };
    MIOTabBar.prototype._addTabBarItem = function (item) {
        this.items.push(item);
        var instance = this;
        item.layer.onclick = function () {
            instance.selectTabBarItem.call(instance, item);
        };
    };
    MIOTabBar.prototype.addTabBarItem = function (item) {
        this._addTabBarItem(item);
        this.addSubview(item);
    };
    MIOTabBar.prototype.selectTabBarItem = function (item) {
        var index = this.items.indexOf(item);
        if (index == this.selectedTabBarItemIndex)
            return;
        if (this.selectedTabBarItemIndex > -1) {
            // Deselect
            var lastItem = this.items[this.selectedTabBarItemIndex];
            lastItem.setSelected(false);
        }
        item.setSelected(true);
        this.willChangeValue("selectedTabBarItemIndex");
        this.selectedTabBarItemIndex = index;
        this.didChangeValue("selectedTabBarItemIndex");
    };
    MIOTabBar.prototype.selectTabBarItemAtIndex = function (index) {
        var item = this.items[index];
        this.selectTabBarItem(item);
    };
    MIOTabBar.prototype.layout = function () {
        var len = this.items.length;
        var width = this.getWidth();
        var w = width / len;
        var x = 0;
        for (var index = 0; index < this.items.length; index++) {
            var item = this.items[index];
            item.setFrame(MIOFrame.frameWithRect(x, 0, w, this.getHeight()));
            x += w;
        }
    };
    return MIOTabBar;
}(MIOView));
//# sourceMappingURL=MIOTabBar.js.map