/**
 * Created by godshadow on 11/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOViewController.ts" />
function MIOPageControllerFromElementID(view, elementID) {
    var v = MIOViewFromElementID(view, elementID);
    if (v == null)
        return null;
    var pc = new MIOPageController();
    pc.initWithView(v);
    view._linkViewToSubview(v);
    return pc;
}
var MIOPageController = (function (_super) {
    __extends(MIOPageController, _super);
    function MIOPageController() {
        _super.call(this);
        this.autoAdjustHeight = false;
        this.viewControllers = [];
        this.selectedViewControllerIndex = -1;
        this.pageHeight = 0;
    }
    MIOPageController.prototype.addPageViewController = function (vc) {
        vc.view.setHidden(true);
        this.viewControllers.push(vc);
        // Check if it's in view hierarchy
        var elementID = vc.view.layer.getAttribute("id");
        var found = MIOLayerSearchElementByID(this.view.layer, elementID);
        if (found == null)
            this.view.addSubview(vc.view);
    };
    MIOPageController.prototype.reloadData = function () {
        this.selectedViewControllerIndex = -1;
        this.showPageAtIndex(0);
    };
    MIOPageController.prototype.showPageAtIndex = function (index) {
        if (index >= this.viewControllers.length)
            return;
        if (this.selectedViewControllerIndex > -1) {
            var vc = this.viewControllers[this.selectedViewControllerIndex];
            vc.view.removeObserver(this, "height");
            vc.view.setHidden(true);
        }
        this.selectedViewControllerIndex = index;
        var vc = this.viewControllers[index];
        vc.view.setHidden(false);
        if (this.autoAdjustHeight == true) {
            vc.view.addObserver(this, "height");
            this.setPageHeight(vc.view.getHeight());
        }
        vc.viewWillAppear();
        this.view.layer.scrollTop = 0;
        vc.viewDidAppear();
    };
    MIOPageController.prototype.showNextPage = function () {
        this.showPageAtIndex(this.selectedViewControllerIndex + 1);
    };
    MIOPageController.prototype.showPrevPage = function () {
        this.showPageAtIndex(this.selectedViewControllerIndex - 1);
    };
    MIOPageController.prototype.setPageHeight = function (height) {
        this.willChangeValue("pageHeight");
        this.pageHeight = height;
        this.view.setHeight(height);
        this.didChangeValue("pageHeight");
    };
    MIOPageController.prototype.observeValueForKeyPath = function (keypath, type, object) {
        if (keypath == "height" && type == "did") {
            this.setPageHeight(object.getHeight());
        }
    };
    return MIOPageController;
})(MIOViewController);
//# sourceMappingURL=MIOPageController.js.map