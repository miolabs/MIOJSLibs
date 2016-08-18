/**
 * Created by godshadow on 9/4/16.
 */

    /// <reference path="MIOViewController.ts" />

class MIONavigationController extends MIOViewController
{
    rootViewController = null;
    viewControllersStack = [];
    currentViewControllerIndex = -1;

    initWithRootViewController(vc)
    {
        super.init();

        this.setRootViewController(vc);
    }

    setRootViewController(vc)
    {
        this.rootViewController = vc;
        this.view.addSubview(vc.view);

        this.viewControllersStack.push(vc);
        this.currentViewControllerIndex = 0;

        this.rootViewController.navigationController = this;

        this.addChildViewController(vc);
    }

    // protected _loadChildControllers()
    // {
    //     if (this.rootViewController != null)
    //     {
    //         this.rootViewController.onLoadView(this, function () {
    //
    //             this._setViewLoaded(true);
    //         });
    //     }
    //     else
    //         this._setViewLoaded(true);
    // }

    viewWillAppear()
    {
        if (this.currentViewControllerIndex < 0)
            return;

        var vc = this.viewControllersStack[this.currentViewControllerIndex];

        vc.viewWillAppear();
        vc._childControllersWillAppear();
    }

    viewDidAppear()
    {
        if (this.currentViewControllerIndex < 0)
            return;

        var vc = this.viewControllersStack[this.currentViewControllerIndex];

        vc.viewDidAppear();
        vc._childControllersDidAppear();
    }

    viewWillDisappear()
    {
        if (this.currentViewControllerIndex < 0)
            return;

        var vc = this.viewControllersStack[this.currentViewControllerIndex];

        vc.viewWillDisappear();
        vc._childControllersWillDisappear();
    }

    viewDidDisappear()
    {
        if (this.currentViewControllerIndex < 0)
            return;

        var vc = this.viewControllersStack[this.currentViewControllerIndex];

        vc.viewDidDisappear();
        vc._childControllersDidDisappear();
    }

    pushViewController(vc, animate?)
    {
        var lastVC = this.viewControllersStack[this.currentViewControllerIndex];

        this.viewControllersStack.push(vc);
        this.currentViewControllerIndex++;

        vc.navigationController = this;
        vc.presentationType = MIOPresentationType.Navigation;

        this.view.addSubview(vc.view);
        this.addChildViewController(vc);
        this.transitionFromViewControllerToViewController(lastVC, vc, 0.25, MIOAnimationType.Push);
    }

    popViewController(animate?)
    {
        if (this.currentViewControllerIndex == 0)
            return;

        var vc = this.viewControllersStack[this.currentViewControllerIndex];

        this.currentViewControllerIndex--;
        this.viewControllersStack.pop();

        var lastVC = this.viewControllersStack[this.currentViewControllerIndex];

        this.transitionFromViewControllerToViewController(lastVC, vc, 0.25, MIOAnimationType.Pop, this, function () {

            vc.view.removeFromSuperview();
            this.removeChildViewController(vc);
        });
    }

    popToRootViewController()
    {
        var currentVC = this.viewControllersStack.pop();

        for(var index = this.currentViewControllerIndex - 1; index > 0; index--)
        {
            var vc = this.viewControllersStack.pop();
            vc.view.removeFromSuperview();
            this.removeChildViewController(vc);
        }

        this.currentViewControllerIndex = 0;
        var rootVC = this.viewControllersStack[0];

        this.transitionFromViewControllerToViewController(rootVC, currentVC, 0.25, MIOAnimationType.Pop, this, function () {

            currentVC.view.removeFromSuperview();
            this.removeChildViewController(currentVC);
        });

    }
}