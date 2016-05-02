/**
 * Created by godshadow on 11/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOView.ts" />
/// <reference path="MIOURLConnection.ts" />
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
    function MIOViewController(layerID) {
        _super.call(this);
        this.layerID = null;
        this.view = null;
        this._onViewLoadedObject = null;
        this._onViewLoadedTarget = null;
        this._onViewLoadedAction = null;
        this._viewLoaded = false;
        this.childViewControllers = [];
        this.navigationController = null;
        this.layerID = layerID;
    }
    MIOViewController.prototype.init = function () {
        _super.prototype.init.call(this);
        this.view = new MIOView(this.layerID);
        this.view.init();
        this.loadView();
    };
    MIOViewController.prototype.initWithLayer = function (layer, options) {
        this.view = new MIOView();
        this.view.initWithLayer(layer, options);
    };
    MIOViewController.prototype.initWithView = function (view) {
        this.view = view;
        this.loadView();
    };
    MIOViewController.prototype.initWithResource = function (url) {
        this.view = new MIOView();
        MIOCoreDownloadFile(this, url, function (data) {
            var parser = new DOMParser();
            var html = parser.parseFromString(data, "text/html");
            //var styles = html.styleSheets;
            //if (css != null)
            //MIOCoreLoadStyle(css);
            var layer = html.getElementById(this.layerID);
            this.localizeSubLayers(layer.childNodes);
            this.view.initWithLayer(layer);
            this.loadView();
            this.setViewLoaded(true);
        });
    };
    MIOViewController.prototype.localizeSubLayers = function (layers) {
        if (layers.length == 0)
            return;
        for (var index = 0; index < layers.length; index++) {
            var layer = layers[index];
            if (layer.tagName != "DIV")
                continue;
            var key = layer.getAttribute("data-localize-key");
            if (key != null)
                layer.innerHTML = MIOLocalizeString(key, key);
            this.localizeSubLayers(layer.childNodes);
        }
    };
    MIOViewController.prototype.localizeLayerIDWithKey = function (layerID, key) {
        var layer = MIOLayerSearchElementByID(this.view.layer, layerID);
        layer.innerHTML = MIOLocalizeString(key, key);
    };
    MIOViewController.prototype.loadView = function () {
        this.viewDidLoad();
    };
    MIOViewController.prototype.setViewLoaded = function (value) {
        this.willChangeValue("viewLoaded");
        this._viewLoaded = value;
        this.didChangeValue("viewLoaded");
        if (value == true && this._onViewLoadedAction != null)
            this._onViewLoadedAction.call(this._onViewLoadedTarget, this._onViewLoadedObject);
    };
    MIOViewController.prototype.setOnViewLoaded = function (object, target, action) {
        this._onViewLoadedObject = object;
        this._onViewLoadedTarget = target;
        this._onViewLoadedAction = action;
    };
    MIOViewController.prototype.viewLoaded = function () {
        return this._viewLoaded;
    };
    MIOViewController.prototype.setOutlet = function (elementID, className, options) {
        var layer = MIOLayerSearchElementByID(this.view.layer, elementID);
        if (className == null)
            className = layer.getAttribute("data-class");
        if (className == null) {
            var view = new MIOView();
            view.initWithLayer(layer);
            return view;
        }
        var c = MIOClassFromString(className);
        c.initWithLayer(layer, options);
        return c;
    };
    MIOViewController.prototype.addChildViewController = function (vc) {
        this.childViewControllers.push(vc);
    };
    MIOViewController.prototype.removeChildViewController = function (vc) {
        var index = this.childViewControllers.indexOf(vc);
        if (index != -1)
            this.childViewControllers.slice(index, 1);
        vc.removeFromSuperview();
    };
    MIOViewController.prototype.presentViewController = function (vc) {
        this.view.addSubview(vc.view);
    };
    MIOViewController.prototype.viewDidLoad = function () { };
    MIOViewController.prototype.viewWillAppear = function () {
        for (var index = 0; index < this.childViewControllers.length; index++) {
            var vc = this.childViewControllers[index];
            vc.viewWillAppear();
        }
    };
    MIOViewController.prototype.viewDidAppear = function () {
        for (var index = 0; index < this.childViewControllers.length; index++) {
            var vc = this.childViewControllers[index];
            vc.viewDidAppear();
        }
    };
    MIOViewController.prototype.viewWillDisappear = function () {
        for (var index = 0; index < this.childViewControllers.length; index++) {
            var vc = this.childViewControllers[index];
            vc.viewWillDisappear();
        }
    };
    MIOViewController.prototype.viewDidDisappear = function () {
        for (var index = 0; index < this.childViewControllers.length; index++) {
            var vc = this.childViewControllers[index];
            vc.viewDidDisappear();
        }
    };
    MIOViewController.prototype.contentHeight = function () {
        return this.view.getHeight();
    };
    return MIOViewController;
})(MIOObject);
//# sourceMappingURL=MIOViewController.js.map