/**
 * Created by godshadow on 11/3/16.
 */

    /// <reference path="MIOViewController.ts" />

class MIOPageController extends MIOViewController
{
    selectedViewControllerIndex = -1;

    addPageViewController(vc)
    {
        this.view.addSubview(vc.view);
        this.addChildViewController(vc);

        if (this.selectedViewControllerIndex == -1)
            this.selectedViewControllerIndex = 0;
        else
            vc.view.setHidden(true);
    }

    protected _loadChildControllers()
    {
        if (this.selectedViewControllerIndex > -1)
        {
            var vc = this.childViewControllers[this.selectedViewControllerIndex];
            vc.onLoadView(this, function () {

                this._setViewLoaded(true);
            });
        }
        else
            this._setViewLoaded(true);
    }

    viewWillAppear()
    {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewWillAppear();
        vc._childControllersWillAppear();
    }

    viewDidAppear()
    {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewDidAppear();
        vc._childControllersDidAppear();
    }

    viewWillDisappear()
    {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewWillDisappear();
        vc._childControllersWillDisappear();
    }

    viewDidDisappear()
    {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewDidDisappear();
        vc._childControllersDidDisappear();
    }

    showPageAtIndex(index)
    {
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

        newVC.view.setHidden(false);
        this.transitionFromViewControllerToViewController(oldVC, newVC, 0, MIOAnimationType.None, this, function () {

            oldVC.view.setHidden(true);
        });
    }

    showNextPage()
    {
        this.showPageAtIndex(this.selectedViewControllerIndex + 1);
    }

    showPrevPage()
    {
        this.showPageAtIndex(this.selectedViewControllerIndex - 1);
    }
}
