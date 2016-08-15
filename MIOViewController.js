/**
 * Created by godshadow on 11/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOObject.ts" />
/// <reference path="MIOString.ts" />
/// <reference path="MIOView.ts" />
/// <reference path="MIOBundle.ts" />
/// <reference path="MIOCoreTypes.ts" />
var MIOPresentationStyle;
(function (MIOPresentationStyle) {
    MIOPresentationStyle[MIOPresentationStyle["CurrentContext"] = 0] = "CurrentContext";
    MIOPresentationStyle[MIOPresentationStyle["PartialCover"] = 1] = "PartialCover";
    MIOPresentationStyle[MIOPresentationStyle["PageSheet"] = 2] = "PageSheet";
    MIOPresentationStyle[MIOPresentationStyle["FormSheet"] = 3] = "FormSheet";
    MIOPresentationStyle[MIOPresentationStyle["FullScreen"] = 4] = "FullScreen";
})(MIOPresentationStyle || (MIOPresentationStyle = {}));
var MIOPresentationType;
(function (MIOPresentationType) {
    MIOPresentationType[MIOPresentationType["Sheet"] = 0] = "Sheet";
    MIOPresentationType[MIOPresentationType["Modal"] = 1] = "Modal";
    MIOPresentationType[MIOPresentationType["Navigation"] = 2] = "Navigation";
})(MIOPresentationType || (MIOPresentationType = {}));
var MIOAnimationType;
(function (MIOAnimationType) {
    MIOAnimationType[MIOAnimationType["BeginSheet"] = 0] = "BeginSheet";
    MIOAnimationType[MIOAnimationType["EndSheet"] = 1] = "EndSheet";
    MIOAnimationType[MIOAnimationType["Push"] = 2] = "Push";
    MIOAnimationType[MIOAnimationType["Pop"] = 3] = "Pop";
})(MIOAnimationType || (MIOAnimationType = {}));
var MIOViewController = (function (_super) {
    __extends(MIOViewController, _super);
    function MIOViewController(layerID) {
        _super.call(this);
        this.layerID = null;
        this.view = null;
        this.parent = null;
        this._onViewLoadedTarget = null;
        this._onViewLoadedAction = null;
        this._viewIsLoaded = false;
        this._layerIsReady = false;
        this._childViewControllers = [];
        this.navigationController = null;
        this.presentationStyle = MIOPresentationStyle.CurrentContext;
        this.presentationType = MIOPresentationType.Modal;
        this.contentSize = new MIOSize(320, 200);
        this.layerID = layerID;
    }
    MIOViewController.prototype.init = function () {
        _super.prototype.init.call(this);
        this.view = new MIOView(this.layerID);
        this.view.init();
        this._layerIsReady = true;
    };
    MIOViewController.prototype.initWithLayer = function (layer, options) {
        _super.prototype.init.call(this);
        this.view = new MIOView(this.layerID);
        this.view.initWithLayer(layer, options);
        this._layerIsReady = true;
    };
    MIOViewController.prototype.initWithView = function (view) {
        _super.prototype.init.call(this);
        this.view = view;
        this._layerIsReady = true;
    };
    MIOViewController.prototype.initWithResource = function (url) {
        _super.prototype.init.call(this);
        this.view = new MIOView(this.layerID);
        this.view.init();
        var mainBundle = MIOBundle.mainBundle();
        mainBundle.loadLayoutFromURL(url, this.layerID, this, function (layout) {
            //var layer = new MIOCoreResourceParser(layout, this.layerID);
            console.log(this.layerID);
            var parser = new DOMParser();
            var items = parser.parseFromString(layout, "text/html");
            var layer = items.getElementById(this.layerID);
            this.localizeSubLayers(layer.childNodes);
            this.view.addSubLayersFromLayer(layer);
            this.loadView();
            this._loadChildControllers();
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
    MIOViewController.prototype._loadChildControllers = function () {
        var count = this._childViewControllers.length;
        if (count > 0)
            this._loadChildViewController(0, count);
        else
            this._setViewLoaded(true);
    };
    MIOViewController.prototype._loadChildViewController = function (index, max) {
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
    MIOViewController.prototype._setViewLoaded = function (value) {
        this.willChangeValue("viewLoaded");
        this._viewIsLoaded = value;
        this.didChangeValue("viewLoaded");
        if (value == true && this._onViewLoadedAction != null)
            this._onViewLoadedAction.call(this._onViewLoadedTarget);
        this._onViewLoadedTarget = null;
        this._onViewLoadedAction = null;
    };
    MIOViewController.prototype.onLoadView = function (target, action) {
        this._onViewLoadedTarget = target;
        this._onViewLoadedAction = action;
        if (this._viewIsLoaded == true) {
            action.call(target);
        }
        else if (this._layerIsReady == true) {
            this.loadView();
            this._loadChildControllers();
        }
    };
    Object.defineProperty(MIOViewController.prototype, "viewIsLoaded", {
        get: function () {
            return this._viewIsLoaded;
        },
        enumerable: true,
        configurable: true
    });
    MIOViewController.prototype.setOutlet = function (elementID, className, options) {
        //var layer = MIOLayerSearchElementByID(this.view.layer, elementID);
        var layer = document.getElementById(elementID);
        if (className == null)
            className = layer.getAttribute("data-class");
        if (className == null) {
            var view = new MIOView();
            view.initWithLayer(layer);
            this.view._linkViewToSubview(view);
            return view;
        }
        var c = MIOClassFromString(className);
        c.initWithLayer(layer, options);
        this.view._linkViewToSubview(c);
        return c;
    };
    Object.defineProperty(MIOViewController.prototype, "childViewControllers", {
        get: function () {
            return this._childViewControllers;
        },
        enumerable: true,
        configurable: true
    });
    MIOViewController.prototype.addChildViewController = function (vc) {
        vc.parent = this;
        this._childViewControllers.push(vc);
        //vc.willMoveToParentViewController(this);
    };
    MIOViewController.prototype.removeChildViewController = function (vc) {
        var index = this._childViewControllers.indexOf(vc);
        if (index != -1)
            this._childViewControllers.slice(index, 1);
    };
    MIOViewController.prototype.removeFromParentViewController = function () {
        this.parent.removeChildViewController(this);
        this.parent = null;
        this.view.removeFromSuperview();
        //this.didMoveToParentViewController(null);
    };
    MIOViewController.prototype.willMoveToParentViewController = function (parent) {
    };
    MIOViewController.prototype.didMoveToParentViewController = function (parent) {
    };
    MIOViewController.prototype.transitionFromViewControllerToViewController = function (fromVC, toVC, duration, animationStyle, target, completion) {
    };
    MIOViewController.prototype.presentViewController = function (vc, animate) {
        vc.presentationType = MIOPresentationType.Modal;
        var frame = this._frameWithStyleForViewController(vc);
        vc.view.setFrame(frame);
        this.addChildViewController(vc);
        this.showViewController(vc, true);
    };
    MIOViewController.prototype.showViewController = function (vc, animate) {
        this.view.addSubview(vc.view);
        vc.onLoadView(this, function () {
            if (vc.presentationStyle != MIOPresentationStyle.PartialCover) {
                this.viewWillDisappear();
                this._childControllersWillDisappear();
            }
            vc.viewWillAppear();
            vc._childControllersWillAppear();
            vc.view.layout();
            if (animate) {
                var newVC = vc;
                var oldVC = this;
                newVC.view.layer.style.animationDuration = "0.25s";
                newVC._addAnimationClassesForType(newVC.presentationType, false);
                newVC.view.layer.addEventListener("animationend", function (e) {
                    newVC._removeAnimationClassesForType(newVC.presentationType, false);
                    //vc.view.layer.removeEventListener("animationend");
                    newVC.viewDidAppear();
                    newVC._childControllersDidAppear();
                    if (newVC.presentationStyle != MIOPresentationStyle.PartialCover) {
                        oldVC.viewDidDisappear();
                        oldVC._childControllersDidDisappear();
                    }
                });
            }
            else {
                vc.viewDidAppear();
                vc._childControllersDidAppear();
                if (vc.presentationStyle != MIOPresentationStyle.PartialCover) {
                    this.viewDidDisappear();
                    this._childControllersDidDisappear();
                }
            }
        });
    };
    MIOViewController.prototype.dismissViewController = function (animate) {
        if (this.presentationStyle != MIOPresentationStyle.PartialCover) {
            this.parent.viewWillAppear();
            this.parent._childControllersWillAppear();
            this.parent.view.layout();
        }
        this.viewWillDisappear();
        this._childControllersWillDisappear();
        if (animate) {
            var newVC = this.parent;
            var oldVC = this;
            oldVC.view.layer.style.animationDuration = "0.25s";
            oldVC._addAnimationClassesForType(newVC.presentationType, true);
            oldVC.view.layer.addEventListener("animationend", function (e) {
                oldVC._removeAnimationClassesForType(oldVC.presentationType, true);
                //vc.view.layer.removeEventListener("animationend");
                oldVC.viewDidDisappear();
                oldVC._childControllersDidDisappear();
                if (oldVC.presentationStyle != MIOPresentationStyle.PartialCover) {
                    newVC.viewDidAppear();
                    newVC._childControllersDidAppear();
                }
                oldVC.removeFromParentViewController();
            });
        }
        else {
            this.viewDidDisappear();
            this._childControllersDidDisappear();
            if (this.presentationStyle != MIOPresentationStyle.PartialCover) {
                this.parent.viewDidAppear();
                this.parent._childControllersDidAppear();
            }
            this.removeFromParentViewController();
        }
    };
    MIOViewController.prototype.viewDidLoad = function () { };
    MIOViewController.prototype.viewWillAppear = function () { };
    MIOViewController.prototype._childControllersWillAppear = function () {
        for (var index = 0; index < this._childViewControllers.length; index++)
            for (var index = 0; index < this._childViewControllers.length; index++) {
                var vc = this._childViewControllers[index];
                vc.viewWillAppear();
            }
    };
    MIOViewController.prototype.viewDidAppear = function () { };
    MIOViewController.prototype._childControllersDidAppear = function () {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewDidAppear();
        }
    };
    MIOViewController.prototype.viewWillDisappear = function () { };
    MIOViewController.prototype._childControllersWillDisappear = function () {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewWillDisappear();
        }
    };
    MIOViewController.prototype.viewDidDisappear = function () { };
    MIOViewController.prototype._childControllersDidDisappear = function () {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewDidDisappear();
        }
    };
    MIOViewController.prototype.contentHeight = function () {
        return this.view.getHeight();
    };
    // ANIMATION TYPES
    MIOViewController.prototype._classListForAnimationType = function (type) {
        var array = [];
        array.push("animated");
        switch (type) {
            case MIOAnimationType.BeginSheet:
                array.push("slideInDown");
                break;
            case MIOAnimationType.EndSheet:
                array.push("slideOutUp");
                break;
            case MIOAnimationType.Push:
                array.push("slideInRight");
                break;
            case MIOAnimationType.Pop:
                array.push("slideOutLeft");
                break;
        }
        return array;
    };
    MIOViewController.prototype._animationClassesForPresentationType = function (type, reverse) {
        var clasess = null;
        switch (type) {
            case MIOPresentationType.Sheet:
                clasess = this._classListForAnimationType(reverse == false ? MIOAnimationType.BeginSheet : MIOAnimationType.EndSheet);
                break;
            case MIOPresentationType.Modal:
                clasess = this._classListForAnimationType(reverse == false ? MIOAnimationType.BeginSheet : MIOAnimationType.EndSheet);
                break;
            case MIOPresentationType.Navigation:
                clasess = this._classListForAnimationType(reverse == false ? MIOAnimationType.Push : MIOAnimationType.Pop);
                break;
        }
        return clasess;
    };
    MIOViewController.prototype._addAnimationClassesForType = function (type, reverse) {
        var classes = this._animationClassesForPresentationType(type, reverse);
        for (var index = 0; index < classes.length; index++)
            this.view.layer.classList.add(classes[index]);
    };
    MIOViewController.prototype._removeAnimationClassesForType = function (type, reverse) {
        var classes = this._animationClassesForPresentationType(type, reverse);
        for (var index = 0; index < classes.length; index++)
            this.view.layer.classList.remove(classes[index]);
    };
    MIOViewController.prototype._frameWithStyleForViewController = function (vc) {
        var w = 0;
        var h = 0;
        var x = 0;
        var y = 0;
        if (vc.presentationStyle == MIOPresentationStyle.PageSheet) {
            w = vc.contentSize.width;
            h = vc.contentSize.height;
            x = (this.view.getWidth() - w) / 2;
            y = 0;
        }
        else if (vc.presentationStyle == MIOPresentationStyle.FormSheet) {
            w = this.view.getWidth() * 0.75; // 75% of the view
            h = this.view.getHeight() * 0.90; // 90% of the view
            x = (this.view.getWidth() - w) / 2;
            y = (this.view.getHeight() - h) / 2;
        }
        else {
            w = this.view.getWidth();
            h = this.view.getHeight();
        }
        return MIOFrame.frameWithRect(x, y, w, h);
    };
    return MIOViewController;
}(MIOObject));
//# sourceMappingURL=MIOViewController.js.map