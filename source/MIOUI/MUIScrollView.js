/**
 * Created by godshadow on 01/09/16.
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
var MUIScrollView = (function (_super) {
    __extends(MUIScrollView, _super);
    function MUIScrollView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.pagingEnabled = false;
        _this.delegate = null;
        _this._lastOffsetX = 0;
        return _this;
    }
    MUIScrollView.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        var instance = this;
        this.layer.onscroll = function (e) {
            instance._layerDidScroll.call(instance);
        };
        this.layer.onwheel = function () {
            instance._layerDidMouseUp.call(instance);
        };
    };
    MUIScrollView.prototype._layerDidMouseUp = function () {
        // if (this.pagingEnabled)
        // {
        //     var width = this.getWidth();
        //     var offset = this.layer.scrollLeft;
        //     if (this._lastOffsetX < offset)
        //     {
        //         // to the right
        //         if (offset >= width)
        //         {
        //             this.layer.classList.add("scroll_left_animation");
        //             this.layer.style.transform = "translate(" + width + "px)";
        //         }
        //     }
        //     else
        //     {
        //         // to the left
        //     }
        // }
    };
    MUIScrollView.prototype._layerDidScroll = function () {
        if (this.delegate != null && typeof this.delegate.scrollViewDidScroll === "function")
            this.delegate.scrollViewDidScroll.call(this.delegate, this);
    };
    Object.defineProperty(MUIScrollView.prototype, "contentOffset", {
        get: function () {
            var p = new MIOPoint(this.layer.scrollLeft, this.layer.scrollTop);
            return p;
        },
        enumerable: true,
        configurable: true
    });
    MUIScrollView.prototype.scrollToTop = function (animate) {
        // if (true)
        //     this.layer.style.transition = "scrollTop 0.25s";
        this.layer.scrollTop = 0;
    };
    MUIScrollView.prototype.scrollToBottom = function (animate) {
        // if (true)
        //     this.layer.style.transition = "scrollTop 0.25s";
        this.layer.scrollTop = this.layer.scrollHeight;
    };
    MUIScrollView.prototype.scrollRectToVisible = function (rect, animate) {
        //TODO: Implenet this
    };
    return MUIScrollView;
}(MUIView));
