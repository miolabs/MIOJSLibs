/**
 * Created by godshadow on 24/08/16.
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
/// <reference path="MUITabBar.ts" />
var MIOTabBarController = (function (_super) {
    __extends(MIOTabBarController, _super);
    function MIOTabBarController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.tabBar = null;
        _this.pageController = null;
        return _this;
    }
    MIOTabBarController.prototype.viewDidLoad = function () {
        _super.prototype.viewDidLoad.call(this);
        this.tabBar = new MUITabBar(this.layerID + "tabbar");
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
}(MUIViewController));
