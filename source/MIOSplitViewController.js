/**
 * Created by godshadow on 05/08/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOViewController.ts" />
var MIOSplitViewController = (function (_super) {
    __extends(MIOSplitViewController, _super);
    function MIOSplitViewController() {
        _super.apply(this, arguments);
        this._masterViewController = null;
        this._detailViewController = null;
        this._masterView = null;
        this._detailView = null;
    }
    MIOSplitViewController.prototype.init = function () {
        _super.prototype.init.call(this);
        this._masterView = new MIOView(MIOViewGetNextLayerID("split_mater_view"));
        this._masterView.init();
        this._masterView.layer.style.width = "320px";
        this.view.addSubview(this._masterView);
        this._detailView = new MIOView(MIOViewGetNextLayerID("split_detail_view"));
        this._detailView.init();
        this._detailView.layer.style.left = "321px";
        this._detailView.layer.style.width = "auto";
        this._detailView.layer.style.right = "0px";
        this.view.addSubview(this._detailView);
    };
    MIOSplitViewController.prototype.setMasterViewController = function (vc) {
        if (this._masterViewController != null) {
            this._masterViewController.view.removeFromSuperview();
            this.removeChildViewController(this._masterViewController);
            this._masterViewController = null;
        }
        if (vc != null) {
            vc.parent = this;
            vc.splitViewController = this;
            this._masterView.addSubview(vc.view);
            this.addChildViewController(vc);
            this._masterViewController = vc;
        }
    };
    MIOSplitViewController.prototype.setDetailViewController = function (vc) {
        if (this._detailViewController != null) {
            this._detailViewController.view.removeFromSuperview();
            this.removeChildViewController(this._detailViewController);
            this._detailViewController = null;
        }
        if (vc != null) {
            vc.parent = this;
            vc.splitViewController = this;
            this._detailView.addSubview(vc.view);
            this.addChildViewController(vc);
            this._detailViewController = vc;
        }
    };
    MIOSplitViewController.prototype.showDetailViewController = function (vc) {
        var oldVC = this._detailViewController;
        var newVC = vc;
        if (oldVC == newVC)
            return;
        newVC.onLoadView(this, function () {
            this._detailView.addSubview(newVC.view);
            this.addChildViewController(newVC);
            this._detailViewController = vc;
            _MIUShowViewController(oldVC, newVC, this, false, this, function () {
                oldVC.view.removeFromSuperview();
                this.removeChildViewController(oldVC);
            });
        });
    };
    Object.defineProperty(MIOSplitViewController.prototype, "masterViewController", {
        get: function () {
            return this._masterViewController;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOSplitViewController.prototype, "detailViewController", {
        get: function () {
            return this._detailViewController;
        },
        enumerable: true,
        configurable: true
    });
    return MIOSplitViewController;
}(MIOViewController));
//# sourceMappingURL=MIOSplitViewController.js.map