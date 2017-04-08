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
/// <reference path="MUIViewController.ts" />
var MUIPageController = (function (_super) {
    __extends(MUIPageController, _super);
    function MUIPageController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.selectedViewControllerIndex = 0;
        // Transitioning delegate
        _this._pageAnimationController = null;
        return _this;
    }
    MUIPageController.prototype.addPageViewController = function (vc) {
        this.addChildViewController(vc);
        if (vc.transitioningDelegate == null)
            vc.transitioningDelegate = this;
    };
    MUIPageController.prototype._loadChildControllers = function () {
        var vc = this.childViewControllers[0];
        this.view.addSubview(vc.view);
        vc.onLoadView(this, function () {
            this._setViewLoaded(true);
        });
    };
    MUIPageController.prototype.viewWillAppear = function () {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewWillAppear();
        vc._childControllersWillAppear();
    };
    MUIPageController.prototype.viewDidAppear = function () {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewDidAppear();
        vc._childControllersDidAppear();
    };
    MUIPageController.prototype.viewWillDisappear = function () {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewWillDisappear();
        vc._childControllersWillDisappear();
    };
    MUIPageController.prototype.viewDidDisappear = function () {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewDidDisappear();
        vc._childControllersDidDisappear();
    };
    MUIPageController.prototype.showPageAtIndex = function (index) {
        if (this.selectedViewControllerIndex == -1)
            return;
        if (index == this.selectedViewControllerIndex)
            return;
        if (index < 0)
            return;
        if (index >= this.childViewControllers.length)
            return;
        var oldVC = this.childViewControllers[this.selectedViewControllerIndex];
        var newVC = this.childViewControllers[index];
        this.selectedViewControllerIndex = index;
        newVC.onLoadView(this, function () {
            this.view.addSubview(newVC.view);
            this.addChildViewController(newVC);
            _MIUShowViewController(oldVC, newVC, this, this, function () {
                oldVC.view.removeFromSuperview();
            });
        });
    };
    MUIPageController.prototype.showNextPage = function () {
        this.showPageAtIndex(this.selectedViewControllerIndex + 1);
    };
    MUIPageController.prototype.showPrevPage = function () {
        this.showPageAtIndex(this.selectedViewControllerIndex - 1);
    };
    MUIPageController.prototype.animationControllerForPresentedController = function (presentedViewController, presentingViewController, sourceController) {
        if (this._pageAnimationController == null) {
            this._pageAnimationController = new MIOPageAnimationController();
            this._pageAnimationController.init();
        }
        return this._pageAnimationController;
    };
    MUIPageController.prototype.animationControllerForDismissedController = function (dismissedController) {
        if (this._pageAnimationController == null) {
            this._pageAnimationController = new MIOPageAnimationController();
            this._pageAnimationController.init();
        }
        return this._pageAnimationController;
    };
    return MUIPageController;
}(MUIViewController));
/*
 ANIMATIONS
 */
var MIOPageAnimationController = (function (_super) {
    __extends(MIOPageAnimationController, _super);
    function MIOPageAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOPageAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0;
    };
    MIOPageAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations before transitions
    };
    MIOPageAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations after transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOPageAnimationController.prototype.animations = function (transitionContext) {
        return null;
    };
    return MIOPageAnimationController;
}(MIOObject));
