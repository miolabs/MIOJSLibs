/**
 * Created by godshadow on 9/4/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOCore.ts" />
var MIONavigationController = (function (_super) {
    __extends(MIONavigationController, _super);
    function MIONavigationController() {
        _super.apply(this, arguments);
        this.rootViewController = null;
        this.viewControllersStack = [];
        this.currentViewControllerIndex = -1;
    }
    MIONavigationController.prototype.initWithRootViewController = function (vc) {
        this.init();
        this.rootViewController = vc;
        this.viewControllersStack.push(vc);
        this.currentViewControllerIndex = 0;
        this.rootViewController.navigationController = this;
        this._showViewController(vc);
    };
    MIONavigationController.prototype.pushViewController = function (vc) {
        var lastVC = this.viewControllersStack[this.currentViewControllerIndex];
        this.viewControllersStack.push(vc);
        this.currentViewControllerIndex++;
        vc.navigationController = this;
        this._showViewController(vc, lastVC);
    };
    MIONavigationController.prototype._showViewController = function (newVC, oldVC) {
        this.view.addSubview(newVC.view);
        if (newVC.viewLoaded()) {
            newVC.viewWillAppear();
            if (oldVC != null) {
                oldVC.viewWillDisappear();
                oldVC.view.setAlpha(0);
                oldVC.viewDidDisappear();
            }
            newVC.view.layout();
            newVC.viewDidAppear();
        }
        else {
            var item = { "new_vc": newVC };
            if (oldVC != null)
                item["old_vc"] = oldVC;
            newVC.setOnViewLoaded(item, this, function (object) {
                var newVC = object["new_vc"];
                var oldVC = object["old_vc"];
                newVC.viewWillAppear();
                newVC.viewWillAppear();
                if (oldVC != null) {
                    oldVC.viewWillDisappear();
                    oldVC.view.setAlpha(0);
                    oldVC.viewDidDisappear();
                }
                newVC.view.layout();
                newVC.viewDidAppear();
            });
        }
    };
    MIONavigationController.prototype.popViewController = function () {
        if (this.currentViewControllerIndex == 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewWillDisappear();
        vc.view.removeFromSuperview();
        vc.viewDidDisappear();
        this.currentViewControllerIndex--;
        this.viewControllersStack.pop();
        var newVC = this.viewControllersStack[this.currentViewControllerIndex];
        newVC.viewWillAppear();
        newVC.view.setAlpha(1);
        newVC.viewDidAppear();
    };
    MIONavigationController.prototype.popToRootViewController = function () {
        for (var index = this.currentViewControllerIndex; index > 0; index--) {
            var vc = this.viewControllersStack[this.currentViewControllerIndex];
            vc.view.removeFromSuperview();
        }
        this.rootViewController.view.setAlpha(1);
        this.currentViewControllerIndex = 0;
        this.viewControllersStack = [];
        this.viewControllersStack.push(this.rootViewController);
    };
    return MIONavigationController;
})(MIOViewController);
//# sourceMappingURL=MIONavigationController.js.map