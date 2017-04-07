/**
 * Created by godshadow on 06/12/2016.
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
/// <reference path="MUIViewController.ts" />
var MUIModalPresentationStyle;
(function (MUIModalPresentationStyle) {
    MUIModalPresentationStyle[MUIModalPresentationStyle["FullScreen"] = 0] = "FullScreen";
    MUIModalPresentationStyle[MUIModalPresentationStyle["PageSheet"] = 1] = "PageSheet";
    MUIModalPresentationStyle[MUIModalPresentationStyle["FormSheet"] = 2] = "FormSheet";
    MUIModalPresentationStyle[MUIModalPresentationStyle["CurrentContext"] = 3] = "CurrentContext";
    MUIModalPresentationStyle[MUIModalPresentationStyle["Custom"] = 4] = "Custom";
    MUIModalPresentationStyle[MUIModalPresentationStyle["OverFullScreen"] = 5] = "OverFullScreen";
    MUIModalPresentationStyle[MUIModalPresentationStyle["OverCurrentContext"] = 6] = "OverCurrentContext";
    MUIModalPresentationStyle[MUIModalPresentationStyle["Popover"] = 7] = "Popover";
    MUIModalPresentationStyle[MUIModalPresentationStyle["None"] = 8] = "None";
})(MUIModalPresentationStyle || (MUIModalPresentationStyle = {}));
var MUIModalTransitionStyle;
(function (MUIModalTransitionStyle) {
    MUIModalTransitionStyle[MUIModalTransitionStyle["CoverVertical"] = 0] = "CoverVertical";
    MUIModalTransitionStyle[MUIModalTransitionStyle["FlipHorizontal"] = 1] = "FlipHorizontal";
    MUIModalTransitionStyle[MUIModalTransitionStyle["CrossDisolve"] = 2] = "CrossDisolve";
})(MUIModalTransitionStyle || (MUIModalTransitionStyle = {}));
var MUIPresentationController = (function (_super) {
    __extends(MUIPresentationController, _super);
    function MUIPresentationController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.presentationStyle = MUIModalPresentationStyle.PageSheet;
        _this.shouldPresentInFullscreen = false;
        _this._presentedViewController = null; //ToVC
        _this.presentingViewController = null; //FromVC
        _this.presentedView = null;
        _this._transitioningDelegate = null;
        _this._window = null;
        _this.isPresented = false;
        return _this;
    }
    MUIPresentationController.prototype.initWithPresentedViewControllerAndPresentingViewController = function (presentedViewController, presentingViewController) {
        _super.prototype.init.call(this);
        this.presentedViewController = presentedViewController;
        this.presentingViewController = presentingViewController;
    };
    MUIPresentationController.prototype.setPresentedViewController = function (vc) {
        this._presentedViewController = vc;
        this.presentedView = vc.view;
    };
    Object.defineProperty(MUIPresentationController.prototype, "presentedViewController", {
        get: function () {
            return this._presentedViewController;
        },
        set: function (vc) {
            this.setPresentedViewController(vc);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUIPresentationController.prototype, "transitioningDelegate", {
        get: function () {
            if (this._transitioningDelegate == null) {
                this._transitioningDelegate = new MIOModalTransitioningDelegate();
                this._transitioningDelegate.init();
            }
            return this._transitioningDelegate;
        },
        enumerable: true,
        configurable: true
    });
    MUIPresentationController.prototype.presentationTransitionWillBegin = function () {
        var toVC = this.presentedViewController;
        var view = this.presentedView;
        this._calculateFrame();
        if (toVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet && MIOLibIsMobile() == false) {
            view.layer.style.borderLeft = "1px solid rgb(170, 170, 170)";
            view.layer.style.borderBottom = "1px solid rgb(170, 170, 170)";
            view.layer.style.borderRight = "1px solid rgb(170, 170, 170)";
        }
    };
    MUIPresentationController.prototype._calculateFrame = function () {
        var fromVC = this.presentingViewController;
        var toVC = this.presentedViewController;
        var view = this.presentedView;
        if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen) {
            var ws = MUIWindowSize();
            view.setFrame(MIOFrame.frameWithRect(0, 0, ws.width, ws.height));
        }
        else if (toVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext) {
            var w = fromVC.view.getWidth();
            var h = fromVC.view.getHeight();
            view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
        }
        else if (toVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet && MIOLibIsMobile() == false) {
            // Present like desktop sheet window
            var ws = MUIWindowSize();
            var size = toVC.preferredContentSize;
            if (size == null)
                size = new MIOSize(320, 200);
            var w = toVC.preferredContentSize.width;
            var h = toVC.preferredContentSize.height;
            var x = (ws.width - w) / 2;
            view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
            this.window.setFrame(MIOFrame.frameWithRect(x, 0, w, h));
            view.layer.style.borderLeft = "1px solid rgb(170, 170, 170)";
            view.layer.style.borderBottom = "1px solid rgb(170, 170, 170)";
            view.layer.style.borderRight = "1px solid rgb(170, 170, 170)";
        }
        else if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FormSheet) {
            // Present at the center of the screen
            var ws = MUIWindowSize();
            var size = toVC.preferredContentSize;
            if (size == null)
                size = new MIOSize(320, 200);
            var w = size.width;
            var h = size.height;
            var x = (ws.width - w) / 2;
            var y = (ws.height - h) / 2;
            view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
            this.window.setFrame(MIOFrame.frameWithRect(x, y, w, h));
            view.layer.style.borderRadius = "5px 5px 5px 5px";
            view.layer.style.border = "1px solid rgb(170, 170, 170)";
        }
        else {
            var w = toVC.preferredContentSize.width;
            var h = toVC.preferredContentSize.height;
            view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
        }
    };
    MUIPresentationController.prototype.presentationTransitionDidEnd = function (completed) {
        this.isPresented = true;
    };
    MUIPresentationController.prototype.dismissalTransitionWillBegin = function () {
    };
    MUIPresentationController.prototype.dismissalTransitionDidEnd = function (completed) {
        this.isPresented = false;
    };
    Object.defineProperty(MUIPresentationController.prototype, "window", {
        get: function () {
            return this._window;
        },
        set: function (window) {
            var vc = this.presentedViewController;
            this._window = window;
            // Track view frame changes
            if (MIOCoreIsMobile() == false && vc.modalPresentationStyle != MUIModalPresentationStyle.CurrentContext) {
                vc.addObserver(this, "contentSize");
            }
        },
        enumerable: true,
        configurable: true
    });
    MUIPresentationController.prototype.observeValueForKeyPath = function (key, type, object) {
        if (key == "contentSize" && type == "did") {
            this._calculateFrame();
            this.window.layer.style.transition = "left 0.25s, width 0.25s, height 0.25s";
        }
    };
    return MUIPresentationController;
}(MIOObject));
var MIOModalTransitioningDelegate = (function (_super) {
    __extends(MIOModalTransitioningDelegate, _super);
    function MIOModalTransitioningDelegate() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.modalTransitionStyle = null;
        _this._presentAnimationController = null;
        _this._dissmissAnimationController = null;
        return _this;
    }
    MIOModalTransitioningDelegate.prototype.animationControllerForPresentedController = function (presentedViewController, presentingViewController, sourceController) {
        if (this._presentAnimationController == null) {
            this._presentAnimationController = new MIOModalPresentAnimationController();
            this._presentAnimationController.init();
        }
        return this._presentAnimationController;
    };
    MIOModalTransitioningDelegate.prototype.animationControllerForDismissedController = function (dismissedController) {
        if (this._dissmissAnimationController == null) {
            this._dissmissAnimationController = new MIOModalDismissAnimationController();
            this._dissmissAnimationController.init();
        }
        return this._dissmissAnimationController;
    };
    return MIOModalTransitioningDelegate;
}(MIOObject));
var MIOAnimationController = (function (_super) {
    __extends(MIOAnimationController, _super);
    function MIOAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0;
    };
    MIOAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations before transitions        
    };
    MIOAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations after transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOAnimationController.prototype.animations = function (transitionContext) {
        return null;
    };
    return MIOAnimationController;
}(MIOObject));
var MIOModalPresentAnimationController = (function (_super) {
    __extends(MIOModalPresentAnimationController, _super);
    function MIOModalPresentAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOModalPresentAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.15;
    };
    MIOModalPresentAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations before transitions
    };
    MIOModalPresentAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations after transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOModalPresentAnimationController.prototype.animations = function (transitionContext) {
        var animations = null;
        var toVC = transitionContext.presentedViewController;
        if (toVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet
            || toVC.modalPresentationStyle == MUIModalPresentationStyle.FormSheet) {
            if (MIOLibIsMobile() == true)
                animations = MUIClassListForAnimationType(MUIAnimationType.SlideInUp);
            else
                animations = MUIClassListForAnimationType(MUIAnimationType.BeginSheet);
        }
        return animations;
    };
    return MIOModalPresentAnimationController;
}(MIOObject));
var MIOModalDismissAnimationController = (function (_super) {
    __extends(MIOModalDismissAnimationController, _super);
    function MIOModalDismissAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOModalDismissAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.15;
    };
    MIOModalDismissAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations after transitions
    };
    MIOModalDismissAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations before transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOModalDismissAnimationController.prototype.animations = function (transitionContext) {
        var animations = null;
        var fromVC = transitionContext.presentingViewController;
        if (fromVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet
            || fromVC.modalPresentationStyle == MUIModalPresentationStyle.FormSheet) {
            if (MIOLibIsMobile() == true)
                animations = MUIClassListForAnimationType(MUIAnimationType.SlideOutDown);
            else
                animations = MUIClassListForAnimationType(MUIAnimationType.EndSheet);
        }
        return animations;
    };
    return MIOModalDismissAnimationController;
}(MIOObject));
