/**
 * Created by godshadow on 11/3/16.
 */

    /// <reference path="MIOViewController.ts" />

class MIOPageController extends MIOViewController
{
    selectedViewControllerIndex = -1;

    addPageViewController(vc)
    {
        vc.view.setHidden(true);

        this.addChildViewController(vc);
    }

    viewWillAppear()
    {
        if (this.selectedViewControllerIndex == -1)
        {
            this.selectedViewControllerIndex == 0;
            var vc = this._childViewControllers[0];
            vc.view.setHidden(false);
            vc.viewWillAppear();
            vc._childControllersWillAppear();
        }
        else
        {
            var vc = this._childViewControllers[this.selectedViewControllerIndex];
            vc.viewWillAppear();
            vc._childControllersWillAppear();
        }
    }

    showPageAtIndex(index)
    {
        if (index == this.selectedViewControllerIndex)
            return;

        if (index < 0)
            return;

        if (index >= this._childViewControllers.length)
            return;

        var oldVC = null;
        var newVC = null;

        if (this.selectedViewControllerIndex > -1)
            oldVC = this._childViewControllers[this.selectedViewControllerIndex];

        this.selectedViewControllerIndex = index;

        var newVC = this._childViewControllers[index];
        newVC.onLoadView(this, function () {

            if (oldVC != null)
            {
                oldVC.viewWillDisappear();
                oldVC._childControllersWillDisappear();
            }

            newVC.viewWillAppear();
            newVC._childControllersWillAppear();

            if (oldVC != null) oldVC.view.setHidden(true);
            newVC.view.setHidden(false);

            if (oldVC != null)
            {
                oldVC.viewDidDisappear();
                oldVC._childControllersDidDisappear();
            }

            newVC.viewDidAppear();
            newVC._childControllersDidAppear();
        });

        //this._showViewController(newVC, oldVC);
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
