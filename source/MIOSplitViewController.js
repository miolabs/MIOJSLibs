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
        vc.parent = this;
        this._masterView.addSubview(vc.view);
        this.childViewControllers.push(vc);
        this._masterViewController = vc;
    };
    MIOSplitViewController.prototype.setDetailViewController = function (vc) {
        vc.parent = this;
        this._detailView.addSubview(vc.view);
        this.childViewControllers.push(vc);
        this._detailViewController = vc;
    };
    MIOSplitViewController.prototype.showDetailViewController = function (vc) {
    };
    return MIOSplitViewController;
}(MIOViewController));
//# sourceMappingURL=MIOSplitViewController.js.map