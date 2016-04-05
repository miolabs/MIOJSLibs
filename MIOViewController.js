/**
 * Created by godshadow on 11/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOView.ts" />
function MIOViewControllerFromElementID(view, elementID) {
    var v = MIOViewFromElementID(view, elementID);
    if (v == null)
        return null;
    var vc = new MIOViewController();
    vc.initWithView(v);
    view._linkViewToSubview(v);
    return vc;
}
var MIOViewController = (function (_super) {
    __extends(MIOViewController, _super);
    function MIOViewController() {
        _super.call(this);
        this.view = null;
    }
    MIOViewController.prototype.init = function () {
        this.view = new MIOView();
        this.view.init();
        this.loadView();
    };
    MIOViewController.prototype.initWithTagID = function (tagID) {
        this.view = new MIOView();
        this.view.initWithTagID(tagID);
        this.loadView();
    };
    MIOViewController.prototype.initWithView = function (view) {
        this.view = view;
        this.loadView();
    };
    MIOViewController.prototype.initWithResource = function (htmlFile, cssFile, itemID) {
        this.view = MIOViewFromResource(htmlFile, cssFile, itemID);
        this.loadView();
    };
    MIOViewController.prototype.localizeLayerIDWithKey = function (layerID, key) {
        var layer = MIOLayerSearchElementByID(this.view.layer, layerID);
        layer.innerHTML = MIOLocalizeString(key, key);
    };
    MIOViewController.prototype.loadView = function () {
        this.viewDidLoad();
        //		this.view.layout();
    };
    MIOViewController.prototype.viewDidLoad = function () { };
    MIOViewController.prototype.viewWillAppear = function () {
        this.view.layout();
    };
    MIOViewController.prototype.viewDidAppear = function () { };
    MIOViewController.prototype.viewWillDisappear = function () { };
    MIOViewController.prototype.viewDidDisappear = function () { };
    MIOViewController.prototype.contentHeight = function () {
        return this.view.getHeight();
    };
    return MIOViewController;
})(MIOObject);
//# sourceMappingURL=MIOViewController.js.map