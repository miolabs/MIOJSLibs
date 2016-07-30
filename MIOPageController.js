/**
 * Created by godshadow on 11/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOViewController.ts" />
var MIOPageController = (function (_super) {
    __extends(MIOPageController, _super);
    function MIOPageController() {
        _super.apply(this, arguments);
        this.selectedViewControllerIndex = -1;
    }
    MIOPageController.prototype.addPageViewController = function (vc) {
        vc.view.setHidden(true);
        this.addChildViewController(vc);
    };
    MIOPageController.prototype.viewWillAppear = function () {
        if (this.selectedViewControllerIndex == -1) {
            this.selectedViewControllerIndex == 0;
            var vc = this._childViewControllers[0];
            vc.view.setHidden(false);
            vc.viewWillAppear();
            vc._childControllersWillAppear();
        }
        else {
            var vc = this._childViewControllers[this.selectedViewControllerIndex];
            vc.viewWillAppear();
            vc._childControllersWillAppear();
        }
    };
    MIOPageController.prototype.showPageAtIndex = function (index) {
        if (index == this.selectedViewControllerIndex)
            return;
        if (index < 0)
            return;
        if (index >= this._childViewControllers.length)
            return;
        var oldVC = null;
        var newVC = null;
        if (this.selectedViewControllerIndex > -1)
            oldVC = this._childViewControllers[this.selectedViewControllerIndex];
        this.selectedViewControllerIndex = index;
        var newVC = this._childViewControllers[index];
        newVC.onLoadView(this, function () {
            if (oldVC != null) {
                oldVC.viewWillDisappear();
                oldVC._childControllersWillDisappear();
            }
            newVC.viewWillAppear();
            newVC._childControllersWillAppear();
            if (oldVC != null)
                oldVC.view.setHidden(true);
            newVC.view.setHidden(false);
            if (oldVC != null) {
                oldVC.viewDidDisappear();
                oldVC._childControllersDidDisappear();
            }
            newVC.viewDidAppear();
            newVC._childControllersDidAppear();
        });
        //this._showViewController(newVC, oldVC);
    };
    MIOPageController.prototype.showNextPage = function () {
        this.showPageAtIndex(this.selectedViewControllerIndex + 1);
    };
    MIOPageController.prototype.showPrevPage = function () {
        this.showPageAtIndex(this.selectedViewControllerIndex - 1);
    };
    return MIOPageController;
}(MIOViewController));
//# sourceMappingURL=MIOPageController.js.map