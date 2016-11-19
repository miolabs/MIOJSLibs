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
/// <reference path="MIOViewController_Animation.ts" />
/// <reference path="MIOViewController_PopoverPresentationController.ts" />
var MIOViewController = (function (_super) {
    __extends(MIOViewController, _super);
    function MIOViewController(layerID, prefixID) {
        _super.call(this);
        this.layerID = null;
        this.prefixID = null;
        this.view = null;
        this.parent = null;
        this._onViewLoadedTarget = null;
        this._onViewLoadedAction = null;
        this._onLoadLayerTarget = null;
        this._onLoadLayerAction = null;
        this._viewIsLoaded = false;
        this._layerIsReady = false;
        this._childViewControllers = [];
        this.navigationController = null;
        this._popoverPresentationController = null;
        this.presentationStyle = MIOPresentationStyle.CurrentContext;
        this.presentationType = MIOPresentationType.Modal;
        this._contentSize = new MIOSize(320, 200);
        this._preferredContentSize = new MIOSize(320, 200);
        this.layerID = layerID;
        this.prefixID = prefixID;
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
        mainBundle.loadLayoutFromURL(url, this.layerID, this, function (data) {
            //var result = MIOHTMLParser(data, this.layerID);
            var result = data;
            var cssFiles = result.styles;
            var baseURL = url.substring(0, url.lastIndexOf('/')) + "/";
            for (var index = 0; index < cssFiles.length; index++) {
                var cssurl = baseURL + cssFiles[index];
                console.log("Adding CSS: " + cssurl);
                MIOCoreLoadStyle(cssurl);
            }
            var domParser = new DOMParser();
            var items = domParser.parseFromString(result.layout, "text/html");
            var layer = items.getElementById(this.layerID);
            this.localizeSubLayers(layer.childNodes);
            this.view.addSubLayer(layer);
            this.view.awakeFromHTML();
            this._didLayerDownloaded();
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
        this.view.layer.style.overflow = "hidden";
    };
    MIOViewController.prototype._didLayerDownloaded = function () {
        this._layerIsReady = true;
        if (this._onLoadLayerTarget != null && this._onViewLoadedAction != null) {
            this._onLoadLayerAction.call(this._onLoadLayerTarget);
            this._onLoadLayerTarget = null;
            this._onLoadLayerAction = null;
        }
        if (this._onViewLoadedAction != null && this._onViewLoadedTarget != null) {
            this.loadView();
            this.viewDidLoad();
            this._loadChildControllers();
        }
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
        if (value == true && this._onViewLoadedAction != null) {
            this._onViewLoadedAction.call(this._onViewLoadedTarget);
        }
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
            this.viewDidLoad();
            this._loadChildControllers();
        }
    };
    MIOViewController.prototype.onLoadLayer = function (target, action) {
        if (this._layerIsReady == true) {
            action.call(target);
        }
        else {
            this._onLoadLayerTarget = action;
            this._onLoadLayerAction = target;
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
        if (c instanceof MIOView)
            c.awakeFromHTML();
        if (c instanceof MIOViewController)
            this.addChildViewController(c);
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
        if (index != -1) {
            this._childViewControllers.splice(index, 1);
            vc.parent = null;
        }
    };
    // removeFromParentViewController()
    // {
    //     this.parent.removeChildViewController(this);
    //     this.parent = null;
    //     this.view.removeFromSuperview();
    //     //this.didMoveToParentViewController(null);
    // }
    MIOViewController.prototype.presentViewController = function (vc, animate) {
        vc.presentationType = MIOPresentationType.Modal;
        var frame = FrameWithStyleForViewControllerInView(this.view, vc);
        vc.view.setFrame(frame);
        if (vc.presentationStyle == MIOPresentationStyle.ModalPresentationPopover) {
            MIOWebApplication.sharedInstance().showPopOverControllerFromRect(vc, frame);
        }
        else {
            this.addChildViewController(vc);
            this.showViewController(vc, true);
        }
    };
    MIOViewController.prototype.showViewController = function (vc, animate) {
        this.view.addSubview(vc.view);
        var type = AnimationTypeForViewController(this, false);
        this.transitionFromViewControllerToViewController(this, vc, 0.25, type, null, null, false);
        /*vc.onLoadView(this, function () {

            if (vc.presentationStyle == MIOPresentationStyle.CurrentContext
                || vc.presentationStyle == MIOPresentationStyle.FullScreen)
            {
                this.viewWillDisappear();
                this._childControllersWillDisappear();
            }

            vc.viewWillAppear();
            vc._childControllersWillAppear();

            vc.view.layout();

            if (animate)
            {
                var newVC = vc;
                var oldVC = this;

                newVC.view.layer.style.animationDuration = "0.25s";
                AddAnimationClassesForType(newVC, false);
                newVC.view.layer.addEventListener("animationend", function(e) {

                    RemoveAnimationClassesForType(newVC, false);
                    newVC.view.layer.removeEventListener("animationend", null);

                    newVC.viewDidAppear();
                    newVC._childControllersDidAppear();

                    if (newVC.presentationStyle == MIOPresentationStyle.CurrentContext
                        || newVC.presentationStyle == MIOPresentationStyle.FullScreen)
                    {
                        oldVC.viewDidDisappear();
                        oldVC._childControllersDidDisappear();
                    }
                });
            }
            else
            {
                vc.viewDidAppear();
                vc._childControllersDidAppear();

                if (vc.presentationStyle == MIOPresentationStyle.CurrentContext
                    || vc.presentationStyle == MIOPresentationStyle.FullScreen)
                {
                    this.viewDidDisappear();
                    this._childControllersDidDisappear();
                }
            }
        });*/
    };
    MIOViewController.prototype.dismissViewController = function (animate) {
        var type = AnimationTypeForViewController(this, true);
        this.transitionFromViewControllerToViewController(this, this.parent, 0.25, type, this, function () {
            this.view.removeFromSuperview();
        }, true);
        /*        if (this.presentationStyle == MIOPresentationStyle.CurrentContext
                    || this.presentationStyle == MIOPresentationStyle.FullScreen)
                {
                    this.parent.viewWillAppear();
                    this.parent._childControllersWillAppear();
                    this.parent.view.layout();
                }
        
                this.viewWillDisappear();
                this._childControllersWillDisappear();
        
                if (animate)
                {
                    var newVC = this.parent;
                    var oldVC = this;
        
                    oldVC.view.layer.style.animationDuration = "0.25s";
                    AddAnimationClassesForType(oldVC, true);
                    oldVC.view.layer.addEventListener("animationend", function(e) {
        
                        RemoveAnimationClassesForType(oldVC, true);
                        oldVC.view.layer.removeEventListener("animationend", null);
        
                        oldVC.viewDidDisappear();
                        oldVC._childControllersDidDisappear();
        
                        if (oldVC.presentationStyle == MIOPresentationStyle.CurrentContext
                            || oldVC.presentationStyle == MIOPresentationStyle.FullScreen)
                        {
                            newVC.viewDidAppear();
                            newVC._childControllersDidAppear();
                        }
        
                        oldVC.view.removeFromSuperview();
                    });
                }
                else
                {
                    this.viewDidDisappear();
                    this._childControllersDidDisappear();
        
                    if (this.presentationStyle == MIOPresentationStyle.CurrentContext
                        || this.presentationStyle == MIOPresentationStyle.FullScreen)
                    {
                        this.parent.viewDidAppear();
                        this.parent._childControllersDidAppear();
                    }
        
                    this.view.removeFromSuperview();
                }*/
    };
    MIOViewController.prototype.transitionFromViewControllerToViewController = function (fromVC, toVC, duration, animationType, target, completion, reverse) {
        toVC.onLoadView(this, function () {
            var presentationStyle = reverse ? fromVC.presentationStyle : toVC.presentationStyle;
            if (fromVC.presentationStyle == MIOPresentationStyle.CurrentContext
                || fromVC.presentationStyle == MIOPresentationStyle.FullScreen) {
                fromVC.viewWillDisappear();
                fromVC._childControllersWillDisappear();
                toVC.viewWillAppear();
                toVC._childControllersWillAppear();
                toVC.view.layout();
            }
            else {
                if (reverse == false) {
                    toVC.viewWillAppear();
                    toVC._childControllersWillAppear();
                    toVC.view.layout();
                }
                else {
                    fromVC.viewWillDisappear();
                    fromVC._childControllersWillDisappear();
                }
            }
            if (duration > 0) {
                var vc = reverse == true ? fromVC : toVC;
                vc.view.layer.style.animationDuration = duration + "s";
                AddAnimationClasses(vc, ClassListForAnimationType(animationType));
                vc.view.layer.animationParams = {};
                vc.view.layer.animationParams["type"] = animationType;
                vc.view.layer.animationParams["toVC"] = toVC;
                vc.view.layer.animationParams["fromVC"] = fromVC;
                if (target != null)
                    vc.view.layer.animationParams["target"] = target;
                if (completion != null)
                    vc.view.layer.animationParams["completion"] = completion;
                vc.view.layer.animationParams["instance"] = this;
                vc.view.layer.animationParams["reverse"] = reverse;
                vc.view.layer.addEventListener("animationend", this._animationDidFinish);
            }
            else {
                if (fromVC.presentationStyle == MIOPresentationStyle.CurrentContext
                    || fromVC.presentationStyle == MIOPresentationStyle.FullScreen) {
                    toVC.viewDidAppear();
                    toVC._childControllersDidAppear();
                    fromVC.viewDidDisappear();
                    fromVC._childControllersDidDisappear();
                }
                else {
                    if (reverse == false) {
                        toVC.viewDidAppear();
                        toVC._childControllersDidAppear();
                    }
                    else {
                        fromVC.viewDidDisappear();
                        fromVC._childControllersDidDisappear();
                    }
                }
                if (target != null && completion != null)
                    completion.call(target);
            }
        });
    };
    MIOViewController.prototype._animationDidFinish = function (event) {
        var type = event.target.animationParams["type"];
        var toVC = event.target.animationParams["toVC"];
        var fromVC = event.target.animationParams["fromVC"];
        var target = event.target.animationParams["target"];
        var completion = event.target.animationParams["completion"];
        var instance = event.target.animationParams["instance"];
        var reverse = event.target.animationParams["reverse"];
        if (reverse == true) {
            RemoveAnimationClasses(fromVC, ClassListForAnimationType(type));
            toVC.view.layer.removeEventListener("animationend", instance._animationDidFinish);
        }
        else {
            RemoveAnimationClasses(toVC, ClassListForAnimationType(type));
            fromVC.view.layer.removeEventListener("animationend", instance._animationDidFinish);
        }
        if (fromVC.presentationStyle == MIOPresentationStyle.CurrentContext
            || fromVC.presentationStyle == MIOPresentationStyle.FullScreen) {
            toVC.viewDidAppear();
            toVC._childControllersDidAppear();
            fromVC.viewDidDisappear();
            fromVC._childControllersDidDisappear();
        }
        else {
            if (reverse == false) {
                toVC.viewDidAppear();
                toVC._childControllersDidAppear();
            }
            else {
                fromVC.viewDidDisappear();
                fromVC._childControllersDidDisappear();
            }
        }
        if (target != null && completion != null)
            completion.call(target);
    };
    MIOViewController.prototype.popoverPresentationController = function () {
        if (this._popoverPresentationController == null) {
            this._popoverPresentationController = new MIOPopoverPresentationController(this.layerID + "_popovervc");
            this._popoverPresentationController.initWithRootViewController(this);
        }
        return this._popoverPresentationController;
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
    Object.defineProperty(MIOViewController.prototype, "contentSize", {
        get: function () {
            return this._contentSize;
        },
        set: function (size) {
            this.willChangeValue("contentSize");
            this._contentSize = size;
            this.didChangeValue("contentSize");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOViewController.prototype, "preferredContentSize", {
        get: function () {
            return this._preferredContentSize;
        },
        enumerable: true,
        configurable: true
    });
    return MIOViewController;
}(MIOObject));
//# sourceMappingURL=MIOViewController.js.map