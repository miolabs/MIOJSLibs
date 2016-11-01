/**
 * Created by godshadow on 24/08/16.
 */

/// <reference path="MIOViewController.ts" />
/// <reference path="MIOTabBar.ts" />

class MIOTabBarController extends MIOViewController
{
    tabBar = null;
    private pageController = null;

    viewDidLoad()
    {
        super.viewDidLoad();

        this.tabBar = new MIOTabBar(this.layerID + "tabbar");
        this.view.addSubview(this.tabBar);
    }

    addTabBarViewController(vc)
    {
        this.addChildViewController(vc);
        vc.onLoadLayer(this, function () {

            this.tabBar.addTabBarItem(vc.tabBarItem);
            this.pageController.addPageViewController(vc);
        });
    }
}