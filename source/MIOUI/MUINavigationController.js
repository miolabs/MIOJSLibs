/**
 * Created by godshadow on 9/4/16.
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
var MUINavigationController = (function (_super) {
    __extends(MUINavigationController, _super);
    function MUINavigationController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.rootViewController = null;
        _this.viewControllersStack = [];
        _this.currentViewControllerIndex = -1;
        // public set contentSize(size)
        // {
        //     super.setContentSize(size);
        //     if (MIOLibIsMobile() == false)
        //     {
        //         // Calculate new frame
        //         var ws = MUIWindowSize();
        //         var w = size.width;
        //         var h = size.height;
        //         var x = (ws.width - w) / 2;
        //         var frame = MIOFrame.frameWithRect(x, 0, w, h);
        //         this.view.layer.style.transition = "left 0.25s, width 0.25s, height 0.25s";
        //         this.view.setFrame(frame);
        //     }
        // }
        // Transitioning delegate
        _this._pushAnimationController = null;
        _this._popAnimationController = null;
        return _this;
    }
    MUINavigationController.prototype.init = function () {
        _super.prototype.init.call(this);
        this.view.layer.style.overflow = "hidden";
    };
    MUINavigationController.prototype.initWithRootViewController = function (vc) {
        this.init();
        this.setRootViewController(vc);
    };
    MUINavigationController.prototype.setRootViewController = function (vc) {
        this.rootViewController = vc;
        this.view.addSubview(vc.view);
        this.viewControllersStack.push(vc);
        this.currentViewControllerIndex = 0;
        this.rootViewController.navigationController = this;
        this.addChildViewController(vc);
        if (this.presentationController != null) {
            var size = vc.preferredContentSize;
            this.contentSize = size;
        }
    };
    MUINavigationController.prototype._childControllersWillAppear = function () {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewWillAppear();
        vc._childControllersWillAppear();
    };
    MUINavigationController.prototype._childControllersDidAppear = function () {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewDidAppear();
        vc._childControllersDidAppear();
    };
    MUINavigationController.prototype._childControllersWillDisappear = function () {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewWillDisappear();
        vc._childControllersWillDisappear();
    };
    MUINavigationController.prototype._childControllersDidDisappear = function () {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewDidDisappear();
        vc._childControllersDidDisappear();
    };
    MUINavigationController.prototype.pushViewController = function (vc, animate) {
        var lastVC = this.viewControllersStack[this.currentViewControllerIndex];
        this.viewControllersStack.push(vc);
        this.currentViewControllerIndex++;
        vc.navigationController = this;
        if (vc.transitioningDelegate == null)
            vc.transitioningDelegate = this;
        vc.onLoadView(this, function () {
            this.view.addSubview(vc.view);
            this.addChildViewController(vc);
            if (vc.preferredContentSize != null)
                this.preferredContentSize = vc.preferredContentSize;
            _MIUShowViewController(lastVC, vc, this, false);
        });
    };
    MUINavigationController.prototype.popViewController = function (animate) {
        if (this.currentViewControllerIndex == 0)
            return;
        var fromVC = this.viewControllersStack[this.currentViewControllerIndex];
        this.currentViewControllerIndex--;
        this.viewControllersStack.pop();
        var toVC = this.viewControllersStack[this.currentViewControllerIndex];
        if (toVC.transitioningDelegate == null)
            toVC.transitioningDelegate = this;
        if (toVC.preferredContentSize != null)
            this.contentSize = toVC.preferredContentSize;
        _MUIHideViewController(fromVC, toVC, this, this, function () {
            fromVC.removeChildViewController(this);
            fromVC.view.removeFromSuperview();
        });
    };
    MUINavigationController.prototype.popToRootViewController = function (animate) {
        if (this.viewControllersStack.length == 1)
            return;
        var currentVC = this.viewControllersStack.pop();
        for (var index = this.currentViewControllerIndex - 1; index > 0; index--) {
            var vc = this.viewControllersStack.pop();
            vc.view.removeFromSuperview();
            this.removeChildViewController(vc);
        }
        this.currentViewControllerIndex = 0;
        var rootVC = this.viewControllersStack[0];
        this.contentSize = rootVC.preferredContentSize;
        _MUIHideViewController(currentVC, rootVC, this, this, function () {
            currentVC.view.removeFromSuperview();
            this.removeChildViewController(currentVC);
        });
    };
    Object.defineProperty(MUINavigationController.prototype, "preferredContentSize", {
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
    MUINavigationController.prototype.animationControllerForPresentedController = function (presentedViewController, presentingViewController, sourceController) {
        if (this._pushAnimationController == null) {
            this._pushAnimationController = new MUIPushAnimationController();
            this._pushAnimationController.init();
        }
        return this._pushAnimationController;
    };
    MUINavigationController.prototype.animationControllerForDismissedController = function (dismissedController) {
        if (this._popAnimationController == null) {
            this._popAnimationController = new MUIPopAnimationController();
            this._popAnimationController.init();
        }
        return this._popAnimationController;
    };
    return MUINavigationController;
}(MUIViewController));
/*
    ANIMATIONS
 */
var MUIPushAnimationController = (function (_super) {
    __extends(MUIPushAnimationController, _super);
    function MUIPushAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MUIPushAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.25;
    };
    MUIPushAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations before transitions       
    };
    MUIPushAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations after transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MUIPushAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.Push);
        return animations;
    };
    return MUIPushAnimationController;
}(MIOObject));
var MUIPopAnimationController = (function (_super) {
    __extends(MUIPopAnimationController, _super);
    function MUIPopAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MUIPopAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.25;
    };
    MUIPopAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations after transitions
    };
    MUIPopAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations before transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MUIPopAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.Pop);
        return animations;
    };
    return MUIPopAnimationController;
}(MIOObject));
