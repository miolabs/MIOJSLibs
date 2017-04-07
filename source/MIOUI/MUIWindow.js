/**
 * Created by godshadow on 11/3/16.
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
/// <reference path="MUIViewController.ts" />
var MUIWindow = (function (_super) {
    __extends(MUIWindow, _super);
    function MUIWindow() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.rootViewController = null;
        _this._resizeWindow = false;
        return _this;
    }
    MUIWindow.prototype.initWithRootViewController = function (vc) {
        this.init();
        this.rootViewController = vc;
        this.addSubview(vc.view);
    };
    MUIWindow.prototype.makeKey = function () {
        MUIWebApplication.sharedInstance().makeKeyWindow(this);
    };
    MUIWindow.prototype.makeKeyAndVisible = function () {
        this.makeKey();
        this.setHidden(false);
    };
    MUIWindow.prototype.layout = function () {
        if (this.rootViewController != null)
            this.rootViewController.view.layout();
        else
            _super.prototype.layout.call(this);
    };
    MUIWindow.prototype.addSubview = function (view) {
        view._window = this;
        _super.prototype.addSubview.call(this, view);
    };
    MUIWindow.prototype._addLayerToDOM = function () {
        if (this._isLayerInDOM == true)
            return;
        if (this.layer == null)
            return;
        document.body.appendChild(this.layer);
        this._isLayerInDOM = true;
    };
    MUIWindow.prototype.removeFromSuperview = function () {
        this._removeLayerFromDOM();
    };
    MUIWindow.prototype._removeLayerFromDOM = function () {
        if (this._isLayerInDOM == false)
            return;
        document.body.removeChild(this.layer);
        this._isLayerInDOM = false;
    };
    MUIWindow.prototype.setHidden = function (hidden) {
        if (hidden == false) {
            this._addLayerToDOM();
        }
        else {
            this._removeLayerFromDOM();
        }
    };
    MUIWindow.prototype._eventHappendOutsideWindow = function () {
        this._dismissRootViewController();
    };
    MUIWindow.prototype._becameKeyWindow = function () {
    };
    MUIWindow.prototype._resignKeyWindow = function () {
        this._dismissRootViewController();
    };
    MUIWindow.prototype._dismissRootViewController = function () {
        if (this.rootViewController.isPresented == true) {
            var pc = this.rootViewController.presentationController;
            if (pc instanceof MUIPopoverPresentationController)
                this.rootViewController.dismissViewController(true);
        }
    };
    return MUIWindow;
}(MUIView));
