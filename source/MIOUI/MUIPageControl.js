/**
 * Created by godshadow on 31/08/16.
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
/// <reference path="MUIButton.ts" />
var MUIPageControl = (function (_super) {
    __extends(MUIPageControl, _super);
    function MUIPageControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.numberOfPages = 0;
        _this._items = [];
        _this._currentPage = -1;
        return _this;
    }
    MUIPageControl.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        // Check for page items
        for (var index = 0; index < this.layer.childNodes.length; index++) {
            var itemLayer = this.layer.childNodes[index];
            if (itemLayer.tagName == "DIV") {
                var i = new MUIButton();
                i.initWithLayer(itemLayer);
                this._items.push(i);
            }
        }
        if (this._items.length > 0)
            this.currentPage = 0;
    };
    Object.defineProperty(MUIPageControl.prototype, "currentPage", {
        get: function () {
            return this._currentPage;
        },
        set: function (index) {
            if (this._currentPage == index)
                return;
            if (this._currentPage > -1) {
                var i = this._items[this._currentPage];
                i.setSelected(false);
            }
            var i = this._items[index];
            i.setSelected(true);
            this._currentPage = index;
        },
        enumerable: true,
        configurable: true
    });
    return MUIPageControl;
}(MUIControl));
