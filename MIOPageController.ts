/**
 * Created by godshadow on 11/3/16.
 */

    /// <reference path="MIOViewController.ts" />

function MIOPageControllerFromElementID(view, elementID)
{
    var v = MIOViewFromElementID(view, elementID);
    if (v == null)
        return null;

    var pc = new MIOPageController();
    pc.initWithView(v);
    view._linkViewToSubview(v);

    return pc;
}

class MIOPageController extends MIOViewController
{
    autoAdjustHeight = false;
    viewControllers = [];
    selectedViewControllerIndex = -1;

    pageHeight = 0;

    constructor()
    {
        super();
    }

    addPageViewController(vc)
    {
        vc.view.setHidden(true);
        this.viewControllers.push(vc);

        // Check if it's in view hierarchy
        var elementID = vc.view.layer.getAttribute("id");
        var found = MIOLayerSearchElementByID(this.view.layer, elementID);
        if (found == null)
            this.view.addSubview(vc.view);
    }

    reloadData()
    {
        this.selectedViewControllerIndex = -1;
        this.showPageAtIndex(0);
    }

    showPageAtIndex(index)
    {
        if (index >= this.viewControllers.length)
            return;

        if (this.selectedViewControllerIndex > -1)
        {
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
    }

    showNextPage()
    {
        this.showPageAtIndex(this.selectedViewControllerIndex + 1);
    }

    showPrevPage()
    {
        this.showPageAtIndex(this.selectedViewControllerIndex - 1);
    }

    setPageHeight(height)
    {
        this.willChangeValue("pageHeight");
        this.pageHeight = height;
        this.view.setHeight(height);
        this.didChangeValue("pageHeight");
    }

    observeValueForKeyPath(keypath, type, object)
    {
        if (keypath == "height" && type == "did")
        {
            this.setPageHeight(object.getHeight());
        }
    }
}
