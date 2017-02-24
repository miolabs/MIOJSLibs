/**
 * Created by godshadow on 06/12/2016.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOViewController.ts" />
var MIOModalPresentationStyle;
(function (MIOModalPresentationStyle) {
    MIOModalPresentationStyle[MIOModalPresentationStyle["CurrentContext"] = 0] = "CurrentContext";
    MIOModalPresentationStyle[MIOModalPresentationStyle["FullScreen"] = 1] = "FullScreen";
    MIOModalPresentationStyle[MIOModalPresentationStyle["PageSheet"] = 2] = "PageSheet";
    MIOModalPresentationStyle[MIOModalPresentationStyle["FormSheet"] = 3] = "FormSheet";
    MIOModalPresentationStyle[MIOModalPresentationStyle["Popover"] = 4] = "Popover";
    MIOModalPresentationStyle[MIOModalPresentationStyle["None"] = 5] = "None";
})(MIOModalPresentationStyle || (MIOModalPresentationStyle = {}));
var MIOModalTransitionStyle;
(function (MIOModalTransitionStyle) {
    MIOModalTransitionStyle[MIOModalTransitionStyle["CoverVertical"] = 0] = "CoverVertical";
    MIOModalTransitionStyle[MIOModalTransitionStyle["FlipHorizontal"] = 1] = "FlipHorizontal";
    MIOModalTransitionStyle[MIOModalTransitionStyle["CrossDisolve"] = 2] = "CrossDisolve";
})(MIOModalTransitionStyle || (MIOModalTransitionStyle = {}));
var MIOPresentationController = (function (_super) {
    __extends(MIOPresentationController, _super);
    function MIOPresentationController() {
        _super.apply(this, arguments);
        this.presentationStyle = MIOModalPresentationStyle.CurrentContext;
        this.shouldPresentInFullscreen = true;
        this._presentedViewController = null; //ToVC
        this.presentingViewController = null; //FromVC
        this.presentedView = null;
    }
    MIOPresentationController.prototype.initWithPresentedViewControllerAndPresentingViewController = function (presentedViewController, presentingViewController) {
        _super.prototype.init.call(this);
        this.presentedViewController = presentedViewController;
        this.presentingViewController = presentingViewController;
    };
    MIOPresentationController.prototype.setPresentedViewController = function (vc) {
        this._presentedViewController = vc;
        this.presentedView = vc.view;
    };
    Object.defineProperty(MIOPresentationController.prototype, "presentedViewController", {
        get: function () {
            return this._presentedViewController;
        },
        set: function (vc) {
            this.setPresentedViewController(vc);
        },
        enumerable: true,
        configurable: true
    });
    MIOPresentationController.prototype.presentationTransitionWillBegin = function () {
        if (MIOLibIsMobile() == false) {
            this.presentedView.layer.style.borderLeft = "1px solid rgb(170, 170, 170)";
            this.presentedView.layer.style.borderBottom = "1px solid rgb(170, 170, 170)";
            this.presentedView.layer.style.borderRight = "1px solid rgb(170, 170, 170)";
        }
    };
    MIOPresentationController.prototype.presentationTransitionDidEnd = function (completed) {
    };
    MIOPresentationController.prototype.dismissalTransitionWillBegin = function () {
    };
    MIOPresentationController.prototype.dismissalTransitionDidEnd = function (completed) {
    };
    return MIOPresentationController;
}(MIOObject));
var MIOModalTransitioningDelegate = (function (_super) {
    __extends(MIOModalTransitioningDelegate, _super);
    function MIOModalTransitioningDelegate() {
        _super.apply(this, arguments);
        this.modalTransitionStyle = null;
    }
    MIOModalTransitioningDelegate.prototype.animationControllerForPresentedController = function (presentedViewController, presentingViewController, sourceController) {
    };
    MIOModalTransitioningDelegate.prototype.animationControllerForDismissedController = function (dismissedController) {
    };
    return MIOModalTransitioningDelegate;
}(MIOObject));
var MIOPresentAnimationController = (function (_super) {
    __extends(MIOPresentAnimationController, _super);
    function MIOPresentAnimationController() {
        _super.apply(this, arguments);
    }
    MIOPresentAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0;
    };
    MIOPresentAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations before transitions
    };
    MIOPresentAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations after transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOPresentAnimationController.prototype.animations = function (transitionContext) {
        return null;
    };
    return MIOPresentAnimationController;
}(MIOObject));
var MIOModalPresentAnimationController = (function (_super) {
    __extends(MIOModalPresentAnimationController, _super);
    function MIOModalPresentAnimationController() {
        _super.apply(this, arguments);
    }
    MIOModalPresentAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.15;
    };
    MIOModalPresentAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations before transitions
        var fromVC = transitionContext.presentingViewController;
        var toVC = transitionContext.presentedViewController;
        if (toVC.modalPresentationStyle == MIOModalPresentationStyle.CurrentContext) {
            if (MIOLibIsMobile() == false) {
                // Present like desktop sheet window
                var ws = MUIWindowSize();
                var w = toVC.preferredContentSize.width;
                var h = toVC.preferredContentSize.height;
                var x = (ws.width - w) / 2;
                toVC.view.setFrame(MIOFrame.frameWithRect(x, 0, w, h));
            }
            else {
                var w = fromVC.view.getWidth();
                var h = fromVC.view.getHeight();
                toVC.view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
            }
        }
    };
    MIOModalPresentAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations after transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOModalPresentAnimationController.prototype.animations = function (transitionContext) {
        var animations = null;
        if (MIOLibIsMobile() == true)
            animations = MUIClassListForAnimationType(MUIAnimationType.SlideInUp);
        else
            animations = MUIClassListForAnimationType(MUIAnimationType.BeginSheet);
        return animations;
    };
    return MIOModalPresentAnimationController;
}(MIOObject));
var MIOModalDismissAnimationController = (function (_super) {
    __extends(MIOModalDismissAnimationController, _super);
    function MIOModalDismissAnimationController() {
        _super.apply(this, arguments);
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
        if (MIOLibIsMobile() == true)
            animations = MUIClassListForAnimationType(MUIAnimationType.SlideOutDown);
        else
            animations = MUIClassListForAnimationType(MUIAnimationType.EndSheet);
        return animations;
    };
    return MIOModalDismissAnimationController;
}(MIOObject));
