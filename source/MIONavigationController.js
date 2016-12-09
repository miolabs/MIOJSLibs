/**
 * Created by godshadow on 9/4/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOViewController.ts" />
var MIONavigationController = (function (_super) {
    __extends(MIONavigationController, _super);
    function MIONavigationController() {
        _super.apply(this, arguments);
        this.rootViewController = null;
        this.viewControllersStack = [];
        this.currentViewControllerIndex = -1;
        // Transitioning delegate
        this._pushAnimationController = null;
        this._popAnimationController = null;
    }
    MIONavigationController.prototype.init = function () {
        _super.prototype.init.call(this);
        this.view.layer.style.overflow = "hidden";
    };
    MIONavigationController.prototype.initWithRootViewController = function (vc) {
        this.init();
        this.setRootViewController(vc);
    };
    MIONavigationController.prototype.setRootViewController = function (vc) {
        this.rootViewController = vc;
        this.view.addSubview(vc.view);
        this.viewControllersStack.push(vc);
        this.currentViewControllerIndex = 0;
        this.rootViewController.navigationController = this;
        this.addChildViewController(vc);
        this.contentSize = vc.contentSize;
    };
    MIONavigationController.prototype.setPresentationController = function (pc) {
        _super.prototype.setPresentationController.call(this, pc);
        this.rootViewController.presentationController = pc;
    };
    MIONavigationController.prototype._childControllersWillAppear = function () {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewWillAppear();
        vc._childControllersWillAppear();
    };
    MIONavigationController.prototype._childControllersDidAppear = function () {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewDidAppear();
        vc._childControllersDidAppear();
    };
    MIONavigationController.prototype._childControllersWillDisappear = function () {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewWillDisappear();
        vc._childControllersWillDisappear();
    };
    MIONavigationController.prototype._childControllersDidDisappear = function () {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewDidDisappear();
        vc._childControllersDidDisappear();
    };
    MIONavigationController.prototype.pushViewController = function (vc, animate) {
        var lastVC = this.viewControllersStack[this.currentViewControllerIndex];
        this.viewControllersStack.push(vc);
        this.currentViewControllerIndex++;
        vc.navigationController = this;
        if (vc.transitioningDelegate == null)
            vc.transitioningDelegate = this;
        vc.presentationController = this.presentationController;
        vc.onLoadView(this, function () {
            this.view.addSubview(vc.view);
            this.addChildViewController(vc);
            this.contentSize = vc.preferredContentSize;
            _MIUShowViewController(lastVC, vc, this);
        });
    };
    MIONavigationController.prototype.popViewController = function (animate) {
        if (this.currentViewControllerIndex == 0)
            return;
        var fromVC = this.viewControllersStack[this.currentViewControllerIndex];
        this.currentViewControllerIndex--;
        this.viewControllersStack.pop();
        var toVC = this.viewControllersStack[this.currentViewControllerIndex];
        this.contentSize = toVC.preferredContentSize;
        _MUIDismissViewController(fromVC, toVC, this, this, function () {
            fromVC.removeChildViewController(this);
            fromVC.view.removeFromSuperview();
        });
    };
    MIONavigationController.prototype.popToRootViewController = function () {
        var currentVC = this.viewControllersStack.pop();
        for (var index = this.currentViewControllerIndex - 1; index > 0; index--) {
            var vc = this.viewControllersStack.pop();
            vc.view.removeFromSuperview();
            this.removeChildViewController(vc);
        }
        this.currentViewControllerIndex = 0;
        var rootVC = this.viewControllersStack[0];
        this.contentSize = rootVC.preferredContentSize;
        _MUIDismissViewController(currentVC, rootVC, this, this, function () {
            currentVC.view.removeFromSuperview();
            this.removeChildViewController(currentVC);
        });
    };
    Object.defineProperty(MIONavigationController.prototype, "preferredContentSize", {
        // get contentSize()
        // {
        //     if (this.currentViewControllerIndex < 0)
        //         return new MIOSize(320, 200);
        //
        //     var vc = this.viewControllersStack[this.currentViewControllerIndex];
        //
        //     return vc.contentSize;
        // }
        get: function () {
            if (this.currentViewControllerIndex < 0)
                return this._preferredContentSize;
            var vc = this.viewControllersStack[this.currentViewControllerIndex];
            return vc.preferredContentSize;
        },
        enumerable: true,
        configurable: true
    });
    MIONavigationController.prototype.animationControllerForPresentedController = function (presentedViewController, presentingViewController, sourceController) {
        if (this._pushAnimationController == null) {
            this._pushAnimationController = new MIOPushAnimationController();
            this._pushAnimationController.init();
        }
        return this._pushAnimationController;
    };
    MIONavigationController.prototype.animationControllerForDismissedController = function (dismissedController) {
        if (this._popAnimationController == null) {
            this._popAnimationController = new MIOPopAnimationController();
            this._popAnimationController.init();
        }
        return this._popAnimationController;
    };
    return MIONavigationController;
}(MIOViewController));
/*
    ANIMATIONS
 */
var MIOPushAnimationController = (function (_super) {
    __extends(MIOPushAnimationController, _super);
    function MIOPushAnimationController() {
        _super.apply(this, arguments);
    }
    MIOPushAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.25;
    };
    MIOPushAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations before transitions
        var fromVC = transitionContext.presentingViewController;
        var toVC = transitionContext.presentedViewController;
        w = fromVC.view.getWidth();
        h = fromVC.view.getHeight();
        var w = toVC.preferredContentSize.width;
        var h = toVC.preferredContentSize.height;
        toVC.view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
    };
    MIOPushAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations after transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOPushAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.Push);
        return animations;
    };
    return MIOPushAnimationController;
}(MIOObject));
var MIOPopAnimationController = (function (_super) {
    __extends(MIOPopAnimationController, _super);
    function MIOPopAnimationController() {
        _super.apply(this, arguments);
    }
    MIOPopAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.25;
    };
    MIOPopAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations after transitions
    };
    MIOPopAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations before transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOPopAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.Pop);
        return animations;
    };
    return MIOPopAnimationController;
}(MIOObject));
//# sourceMappingURL=MIONavigationController.js.map