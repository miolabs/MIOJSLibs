/**
 * Created by godshadow on 9/4/16.
 */

    /// <reference path="MIOCore.ts" />

class MIONavigationController extends MIOViewController
{
    rootViewController = null;
    viewControllersStack = [];
    currentViewControllerIndex = -1;

    initWithRootViewController(vc)
    {
        this.init();

        this.rootViewController = vc;
        this.viewControllersStack.push(vc);
        this.currentViewControllerIndex = 0;

        this.rootViewController.navigationController = this;
        this._showViewController(vc);
    }

    pushViewController(vc)
    {
        var lastVC = this.viewControllersStack[this.currentViewControllerIndex];

        this.viewControllersStack.push(vc);
        this.currentViewControllerIndex++;

        vc.navigationController = this;
        this._showViewController(vc, lastVC);
    }

    _showViewController(newVC, oldVC?)
    {
        this.view.addSubview(newVC.view);

        if (newVC.viewLoaded())
        {
            newVC.viewWillAppear();
            if (oldVC != null) {
                oldVC.view.setAlpha(0);
            }
            newVC.view.layout();
            newVC.viewDidAppear();
        }
        else
        {
            var item = {"new_vc" : newVC};
            if (oldVC != null)
                item["old_vc"] = oldVC;
            newVC.setOnViewLoaded(item, this, function(object){

                var newVC = object["new_vc"];
                var oldVC = object["old_vc"];

                newVC.viewWillAppear();
                newVC.viewWillAppear();
                if (oldVC != null) {
                    oldVC.view.setAlpha(0);
                }
                newVC.view.layout();
                newVC.viewDidAppear();
            });
        }

    }

    popViewController()
    {
        if (this.currentViewControllerIndex == 0)
            return;

        var vc = this.viewControllersStack[this.currentViewControllerIndex];

        vc.view.removeFromSuperview();

        this.currentViewControllerIndex--;
        this.viewControllersStack.pop();

        var newVC = this.viewControllersStack[this.currentViewControllerIndex];
        newVC.view.setAlpha(1);
    }

    popToRootViewController()
    {
        for(var index = this.currentViewControllerIndex; index > 0; index--)
        {
            var vc = this.viewControllersStack[this.currentViewControllerIndex];
            vc.view.removeFromSuperview();
        }

        this.rootViewController.view.setAlpha(1);
        this.currentViewControllerIndex = 0;
        this.viewControllersStack = [];
        this.viewControllersStack.push(this.rootViewController);
    }
}