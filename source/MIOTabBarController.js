/**
 * Created by godshadow on 24/08/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOViewController.ts" />
/// <reference path="MIOTabBar.ts" />
var MIOTabBarController = (function (_super) {
    __extends(MIOTabBarController, _super);
    function MIOTabBarController() {
        _super.apply(this, arguments);
        this.tabBar = null;
        this.pageController = null;
    }
    MIOTabBarController.prototype.viewDidLoad = function () {
        _super.prototype.viewDidLoad.call(this);
        this.tabBar = new MIOTabBar(this.layerID + "tabbar");
        this.view.addSubview(this.tabBar);
    };
    MIOTabBarController.prototype.addTabBarViewController = function (vc) {
        this.addChildViewController(vc);
        vc.onLoadLayer(this, function () {
            this.tabBar.addTabBarItem(vc.tabBarItem);
            this.pageController.addPageViewController(vc);
        });
    };
    return MIOTabBarController;
}(MIOViewController));
//# sourceMappingURL=MIOTabBarController.js.map