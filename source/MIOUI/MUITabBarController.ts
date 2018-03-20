import { MUITabBar } from "./MUITabBar";
import { MUIViewController } from "./MUIViewController";

/**
 * Created by godshadow on 24/08/16.
 */

export class MIOTabBarController extends MUIViewController
{
    tabBar = null;
    private pageController = null;

    viewDidLoad()
    {
        super.viewDidLoad();

        this.tabBar = new MUITabBar(this.layerID + "tabbar");
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