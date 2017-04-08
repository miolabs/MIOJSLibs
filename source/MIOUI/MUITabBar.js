/**
 * Created by godshadow on 25/08/16.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="MUIView.ts" />
/// <reference path="MUIButton.ts" />
var MUITabBarItem = (function (_super) {
    __extends(MUITabBarItem, _super);
    function MUITabBarItem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._titleStatusStyle = null;
        _this._titleLayer = null;
        _this._imageStatusStyle = null;
        _this._imageLayer = null;
        _this.isSelected = false;
        return _this;
    }
    MUITabBarItem.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        if (this.layer.childNodes.length < 2)
            throw new Error("Tab bar item broken!");
        var count = 0;
        for (var index = 0; index < this.layer.childNodes.length; index++) {
            var l = this.layer.childNodes[index];
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
    MUITabBarItem.prototype.setSelected = function (value) {
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
    return MUITabBarItem;
}(MUIView));
var MUITabBar = (function (_super) {
    __extends(MUITabBar, _super);
    function MUITabBar() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.items = [];
        _this.selectedTabBarItemIndex = -1;
        return _this;
    }
    MUITabBar.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        // TODO: change to buttons
        // Check for tab items
        for (var index = 0; index < this.layer.childNodes.length; index++) {
            var tabItemLayer = this.layer.childNodes[index];
            if (tabItemLayer.tagName == "DIV") {
                var ti = new MUITabBarItem();
                ti.initWithLayer(tabItemLayer);
                this._addTabBarItem(ti);
            }
        }
        if (this.items.length > 0)
            this.selectTabBarItemAtIndex(0);
    };
    MUITabBar.prototype._addTabBarItem = function (item) {
        this.items.push(item);
        var instance = this;
        item.layer.onclick = function () {
            instance.selectTabBarItem.call(instance, item);
        };
    };
    MUITabBar.prototype.addTabBarItem = function (item) {
        this._addTabBarItem(item);
        this.addSubview(item);
    };
    MUITabBar.prototype.selectTabBarItem = function (item) {
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
    MUITabBar.prototype.selectTabBarItemAtIndex = function (index) {
        var item = this.items[index];
        this.selectTabBarItem(item);
    };
    MUITabBar.prototype.layout = function () {
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
    return MUITabBar;
}(MUIView));
