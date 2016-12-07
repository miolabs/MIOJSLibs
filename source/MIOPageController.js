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
        this.selectedViewControllerIndex = 0;
    }
    MIOPageController.prototype.addPageViewController = function (vc) {
        this.addChildViewController(vc);
    };
    MIOPageController.prototype._loadChildControllers = function () {
        var vc = this.childViewControllers[0];
        this.view.addSubview(vc.view);
        vc.onLoadView(this, function () {
            this._setViewLoaded(true);
        });
    };
    MIOPageController.prototype.viewWillAppear = function () {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewWillAppear();
        vc._childControllersWillAppear();
    };
    MIOPageController.prototype.viewDidAppear = function () {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewDidAppear();
        vc._childControllersDidAppear();
    };
    MIOPageController.prototype.viewWillDisappear = function () {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewWillDisappear();
        vc._childControllersWillDisappear();
    };
    MIOPageController.prototype.viewDidDisappear = function () {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewDidDisappear();
        vc._childControllersDidDisappear();
    };
    MIOPageController.prototype.showPageAtIndex = function (index) {
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
        this.view.addSubview(newVC.view);
        this.transitionFromViewControllerToViewController(oldVC, newVC, 0, MIOAnimationType.None, this, function () {
            oldVC.view.removeFromSuperview();
        });
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