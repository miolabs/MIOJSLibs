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
/// <reference path="../MIOFoundation/MIOFoundation.ts" />
/// <reference path="MIOUI_Core.ts" />
/// <reference path="MIOUI_CoreLayer.ts" />
/// <reference path="MUIViewController_PresentationController.ts" />
/// <reference path="MUIViewController_PopoverPresentationController.ts" />
/// <reference path="MUIWindow.ts" />
//declare var MIOHTMLParser;
var MUIViewController = (function (_super) {
    __extends(MUIViewController, _super);
    function MUIViewController(layerID) {
        var _this = _super.call(this) || this;
        _this.layerID = null;
        _this.view = null;
        _this._htmlResourcePath = null;
        _this._onViewLoadedTarget = null;
        _this._onViewLoadedAction = null;
        _this._onLoadLayerTarget = null;
        _this._onLoadLayerAction = null;
        _this._viewIsLoaded = false;
        _this._layerIsReady = false;
        _this._childViewControllers = [];
        _this.parentViewController = null;
        _this.presentingViewController = null;
        _this.presentedViewController = null;
        _this.navigationController = null;
        _this.splitViewController = null;
        _this.tabBarController = null;
        _this._presentationController = null;
        _this._popoverPresentationController = null;
        _this.modalPresentationStyle = MUIModalPresentationStyle.CurrentContext;
        _this.modalTransitionStyle = MUIModalTransitionStyle.CoverVertical;
        _this.transitioningDelegate = null;
        _this._contentSize = new MIOSize(320, 200);
        _this._preferredContentSize = null;
        _this.layerID = layerID ? layerID : MUICoreLayerIDFromObject(_this);
        return _this;
    }
    MUIViewController.prototype.init = function () {
        _super.prototype.init.call(this);
        this.view = new MUIView(this.layerID);
        this.view.init();
        this._layerIsReady = true;
    };
    MUIViewController.prototype.initWithLayer = function (layer, options) {
        _super.prototype.init.call(this);
        this.view = new MUIView(this.layerID);
        this.view.initWithLayer(layer, options);
        this._layerIsReady = true;
    };
    MUIViewController.prototype.initWithView = function (view) {
        _super.prototype.init.call(this);
        this.view = view;
        this._layerIsReady = true;
    };
    MUIViewController.prototype.initWithResource = function (path) {
        if (path == null)
            throw ("MIOViewController:initWithResource can't be null");
        _super.prototype.init.call(this);
        this._htmlResourcePath = path;
        this.loadView();
    };
    MUIViewController.prototype.localizeSubLayers = function (layers) {
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
    MUIViewController.prototype.localizeLayerIDWithKey = function (layerID, key) {
        var layer = MUILayerSearchElementByID(this.view.layer, layerID);
        layer.innerHTML = MIOLocalizeString(key, key);
    };
    MUIViewController.prototype.loadView = function () {
        this.view = new MUIView(this.layerID);
        //this.view.init();
        var mainBundle = MIOBundle.mainBundle();
        mainBundle.loadHTMLNamed(this._htmlResourcePath, this.layerID, this, function (layerData) {
            //var result = MIOHTMLParser(data, this.layerID);
            // var result = data;
            // var cssFiles = result.styles;
            // var baseURL = url.substring(0, url.lastIndexOf('/')) + "/";
            // for (var index = 0; index < cssFiles.length; index++) {
            //     var cssurl  = baseURL + cssFiles[index];
            //     console.log("Adding CSS: " + cssurl);
            //     MIOCoreLoadStyle(cssurl);
            // }
            var domParser = new DOMParser();
            var items = domParser.parseFromString(layerData, "text/html");
            var layer = items.getElementById(this.layerID);
            this.localizeSubLayers(layer.childNodes);
            //this.view.addSubLayer(layer);
            this.view.initWithLayer(layer);
            this.view.awakeFromHTML();
            this._didLayerDownloaded();
        });
    };
    MUIViewController.prototype._didLayerDownloaded = function () {
        this._layerIsReady = true;
        if (this._onLoadLayerTarget != null && this._onViewLoadedAction != null) {
            this._onLoadLayerAction.call(this._onLoadLayerTarget);
            this._onLoadLayerTarget = null;
            this._onLoadLayerAction = null;
        }
        if (this._onViewLoadedAction != null && this._onViewLoadedTarget != null) {
            //this.loadView();
            this.viewDidLoad();
            this._loadChildControllers();
        }
    };
    MUIViewController.prototype._loadChildControllers = function () {
        var count = this._childViewControllers.length;
        if (count > 0)
            this._loadChildViewController(0, count);
        else
            this._setViewLoaded(true);
    };
    MUIViewController.prototype._loadChildViewController = function (index, max) {
        if (index < max) {
            var vc = this._childViewControllers[index];
            vc.onLoadView(this, function () {
                var newIndex = index + 1;
                this._loadChildViewController(newIndex, max);
            });
        }
        else {
            this._setViewLoaded(true);
        }
    };
    MUIViewController.prototype._setViewLoaded = function (value) {
        this.willChangeValue("viewLoaded");
        this._viewIsLoaded = value;
        this.didChangeValue("viewLoaded");
        if (value == true && this._onViewLoadedAction != null) {
            this._onViewLoadedAction.call(this._onViewLoadedTarget);
        }
        this._onViewLoadedTarget = null;
        this._onViewLoadedAction = null;
    };
    MUIViewController.prototype.onLoadView = function (target, action) {
        this._onViewLoadedTarget = target;
        this._onViewLoadedAction = action;
        if (this._viewIsLoaded == true) {
            action.call(target);
        }
        else if (this._layerIsReady == true) {
            //this.loadView();
            this.viewDidLoad();
            this._loadChildControllers();
        }
    };
    MUIViewController.prototype.onLoadLayer = function (target, action) {
        if (this._layerIsReady == true) {
            action.call(target);
        }
        else {
            this._onLoadLayerTarget = action;
            this._onLoadLayerAction = target;
        }
    };
    Object.defineProperty(MUIViewController.prototype, "viewIsLoaded", {
        get: function () {
            return this._viewIsLoaded;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUIViewController.prototype, "childViewControllers", {
        get: function () {
            return this._childViewControllers;
        },
        enumerable: true,
        configurable: true
    });
    MUIViewController.prototype.addChildViewController = function (vc) {
        vc.parentViewController = this;
        this._childViewControllers.push(vc);
        //vc.willMoveToParentViewController(this);
    };
    MUIViewController.prototype.removeChildViewController = function (vc) {
        var index = this._childViewControllers.indexOf(vc);
        if (index != -1) {
            this._childViewControllers.splice(index, 1);
            vc.parentViewController = null;
        }
    };
    Object.defineProperty(MUIViewController.prototype, "isPresented", {
        // removeFromParentViewController()
        // {
        //     this.parent.removeChildViewController(this);
        //     this.parent = null;
        //     this.view.removeFromSuperview();
        //     //this.didMoveToParentViewController(null);
        // }
        get: function () {
            if (this._presentationController != null)
                return this._presentationController.isPresented;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUIViewController.prototype, "presentationController", {
        get: function () {
            if (this._presentationController == null && this.parentViewController != null)
                return this.parentViewController.presentationController;
            return this._presentationController;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUIViewController.prototype, "popoverPresentationController", {
        get: function () {
            if (this._popoverPresentationController == null) {
                this._popoverPresentationController = new MUIPopoverPresentationController();
                this._popoverPresentationController.init();
                this._popoverPresentationController.presentedViewController = this;
            }
            this._presentationController = this._popoverPresentationController;
            return this._popoverPresentationController;
        },
        enumerable: true,
        configurable: true
    });
    MUIViewController.prototype.showViewController = function (vc, animate) {
        vc.onLoadView(this, function () {
            this.view.addSubview(vc.view);
            this.addChildViewController(vc);
            _MIUShowViewController(this, vc, this, false);
        });
    };
    MUIViewController.prototype.presentViewController = function (vc, animate) {
        var pc = vc.presentationController;
        if (pc == null) {
            pc = new MUIPresentationController();
            pc.init();
            pc.presentedViewController = vc;
            pc.presentingViewController = this;
            vc._presentationController = pc;
        }
        else if (pc.isPresented == true) {
            // You try to presented a presetnation controller that is already presented
            return;
        }
        if (vc.modalPresentationStyle != MUIModalPresentationStyle.FullScreen
            && vc.modalPresentationStyle != MUIModalPresentationStyle.FormSheet
            && vc.modalPresentationStyle != MUIModalPresentationStyle.PageSheet)
            vc.modalPresentationStyle = MUIModalPresentationStyle.PageSheet;
        vc.onLoadView(this, function () {
            if (vc.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext) {
                this.view.addSubview(vc.presentationController.presentedView);
                this.addChildViewController(vc);
            }
            else {
                // It's a window instead of a view
                var w = pc.window;
                if (w == null) {
                    w = new MUIWindow();
                    w.init();
                    w.layer.style.background = "";
                    w.rootViewController = vc;
                    w.addSubview(pc.presentedView);
                    pc.window = w;
                }
                w.setHidden(false);
            }
            _MIUShowViewController(this, vc, null, this, function () {
                w.makeKey();
            });
        });
    };
    MUIViewController.prototype.dismissViewController = function (animate) {
        var pc = this.presentationController;
        var toVC = pc.presentingViewController;
        var fromVC = pc.presentedViewController;
        var fromView = pc.presentedView;
        _MUIHideViewController(fromVC, toVC, null, this, function () {
            if (fromVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext) {
                toVC.removeChildViewController(fromVC);
                var pc = fromVC.presentationController;
                var view = pc.presentedView;
                view.removeFromSuperview();
            }
            else {
                // It's a window instead of a view
                var pc = fromVC.presentationController;
                var w = pc.window;
                w.setHidden(true);
            }
        });
    };
    MUIViewController.prototype.transitionFromViewControllerToViewController = function (fromVC, toVC, duration, animationType, target, completion) {
        //TODO
    };
    MUIViewController.prototype.viewDidLoad = function () { };
    MUIViewController.prototype.viewWillAppear = function () { };
    MUIViewController.prototype._childControllersWillAppear = function () {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewWillAppear();
        }
    };
    MUIViewController.prototype.viewDidAppear = function () { };
    MUIViewController.prototype._childControllersDidAppear = function () {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewDidAppear();
        }
    };
    MUIViewController.prototype.viewWillDisappear = function () { };
    MUIViewController.prototype._childControllersWillDisappear = function () {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewWillDisappear();
        }
    };
    MUIViewController.prototype.viewDidDisappear = function () { };
    MUIViewController.prototype._childControllersDidDisappear = function () {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewDidDisappear();
        }
    };
    MUIViewController.prototype.contentHeight = function () {
        return this.view.getHeight();
    };
    MUIViewController.prototype.setContentSize = function (size) {
        this.willChangeValue("contentSize");
        this._contentSize = size;
        this.didChangeValue("contentSize");
    };
    Object.defineProperty(MUIViewController.prototype, "contentSize", {
        get: function () {
            return this._contentSize;
        },
        set: function (size) {
            this.setContentSize(size);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUIViewController.prototype, "preferredContentSize", {
        get: function () {
            return this._preferredContentSize;
        },
        enumerable: true,
        configurable: true
    });
    return MUIViewController;
}(MIOObject));
