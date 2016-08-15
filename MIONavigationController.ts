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
    }

    protected _loadChildControllers()
    {
        if (this.rootViewController != null)
        {
            this.rootViewController.onLoadView(this, function () {

                this._setViewLoaded(true);
            });
        }
        else
            this._setViewLoaded(true);
    }

    /*_addLayerToDOM(target?, completion?)
    {
        super._addLayerToDOM(this, function () {

            this.rootViewController._addLayerToDOM(target, completion);
        });
    }*/

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

        this.showViewController(vc, animate == null ? false : true);
    }

    popViewController(animate?)
    {
        if (this.currentViewControllerIndex == 0)
            return;

        var lastVC = this.viewControllersStack[this.currentViewControllerIndex];

        this.currentViewControllerIndex--;
        this.viewControllersStack.pop();

        var vc = this.viewControllersStack[this.currentViewControllerIndex];

        lastVC.viewWillDisappear();
        lastVC._childControllersWillDisappear();

        vc.viewWillAppear();
        vc._childControllersWillAppear();

        vc.view.layout();
        lastVC.view.removeFromSuperview();

        vc.viewDidAppear();
        vc._childControllersDidAppear();

        lastVC.viewDidDisappear();
        lastVC._childControllersDidDisappear();
    }

    popToRootViewController()
    {
        var count = this.currentViewControllerIndex;
        for(var index = count; index > 0; index--)
        {
            this.popViewController();
        }
    }
}