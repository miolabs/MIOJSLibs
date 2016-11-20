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
    }
    MIONavigationController.prototype.initWithRootViewController = function (vc) {
        _super.prototype.init.call(this);
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
        vc.presentationType = MIOPresentationType.Navigation;
        this.view.addSubview(vc.view);
        this.addChildViewController(vc);
        this.contentSize = vc.preferredContentSize;
        this.transitionFromViewControllerToViewController(lastVC, vc, 0.25, MIOAnimationType.Push);
    };
    MIONavigationController.prototype.popViewController = function (animate) {
        if (this.currentViewControllerIndex == 0)
            return;
        var fromVC = this.viewControllersStack[this.currentViewControllerIndex];
        this.currentViewControllerIndex--;
        this.viewControllersStack.pop();
        var toVC = this.viewControllersStack[this.currentViewControllerIndex];
        this.contentSize = toVC.preferredContentSize;
        this.transitionFromViewControllerToViewController(fromVC, toVC, 0.25, MIOAnimationType.Pop, this, function () {
            fromVC.view.removeFromSuperview();
            this.removeChildViewController(fromVC);
        }, true);
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
        this.transitionFromViewControllerToViewController(rootVC, currentVC, 0.25, MIOAnimationType.Pop, this, function () {
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
    return MIONavigationController;
}(MIOViewController));
//# sourceMappingURL=MIONavigationController.js.map