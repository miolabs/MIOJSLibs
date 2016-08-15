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
    };
    MIONavigationController.prototype._loadChildControllers = function () {
        if (this.rootViewController != null) {
            this.rootViewController.onLoadView(this, function () {
                this._setViewLoaded(true);
            });
        }
        else
            this._setViewLoaded(true);
    };
    /*_addLayerToDOM(target?, completion?)
    {
        super._addLayerToDOM(this, function () {

            this.rootViewController._addLayerToDOM(target, completion);
        });
    }*/
    MIONavigationController.prototype.viewWillAppear = function () {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewWillAppear();
        vc._childControllersWillAppear();
    };
    MIONavigationController.prototype.viewDidAppear = function () {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewDidAppear();
        vc._childControllersDidAppear();
    };
    MIONavigationController.prototype.viewWillDisappear = function () {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewWillDisappear();
        vc._childControllersWillDisappear();
    };
    MIONavigationController.prototype.viewDidDisappear = function () {
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
        this.showViewController(vc, animate == null ? false : true);
    };
    MIONavigationController.prototype.popViewController = function (animate) {
        if (this.currentViewControllerIndex == 0)
            return;
        var lastVC = this.viewControllersStack[this.currentViewControllerIndex];
        this.currentViewControllerIndex--;
        this.viewControllersStack.pop();
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        lastVC.viewWillDisappear();
        lastVC._childControllersWillDisappear();
        vc.viewWillAppear();
        vc._childControllersWillAppear();
        vc.view.layout();
        lastVC.view.removeFromSuperview();
        vc.viewDidAppear();
        vc._childControllersDidAppear();
        lastVC.viewDidDisappear();
        lastVC._childControllersDidDisappear();
    };
    MIONavigationController.prototype.popToRootViewController = function () {
        var count = this.currentViewControllerIndex;
        for (var index = count; index > 0; index--) {
            this.popViewController();
        }
    };
    return MIONavigationController;
}(MIOViewController));
//# sourceMappingURL=MIONavigationController.js.map