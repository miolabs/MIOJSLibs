/**
 * Created by godshadow on 05/08/16.
 */

/// <reference path="MIOViewController.ts" />

class MIOSplitViewController extends MIOViewController
{
    private _masterViewController = null;
    private _detailViewController = null;

    private _masterView = null;
    private _detailView = null;

    init()
    {
        super.init();

        this._masterView = new MIOView(MIOViewGetNextLayerID("split_mater_view"));
        this._masterView.init();
        this._masterView.layer.style.width = "320px";
        this.view.addSubview(this._masterView);

        this._detailView = new MIOView(MIOViewGetNextLayerID("split_detail_view"));
        this._detailView.init();
        this._detailView.layer.style.left = "321px";
        this._detailView.layer.style.width = "auto";
        this._detailView.layer.style.right = "0px";
        this.view.addSubview(this._detailView);
    }

    setMasterViewController(vc)
    {
        if (this._masterViewController != null)
        {
            this._masterViewController.view.removeFromSuperview();
            this.removeChildViewController(this._masterViewController);
            this._masterViewController = null;
        }

        if (vc != null)
        {
            vc.parent = this;
            vc.splitViewController = this;

            this._masterView.addSubview(vc.view);
            this.addChildViewController(vc);
            this._masterViewController = vc;
        }
    }

    setDetailViewController(vc)
    {
        if (this._detailViewController != null)
        {
            this._detailViewController.view.removeFromSuperview();
            this.removeChildViewController(this._detailViewController);
            this._detailViewController = null;
        }

        if (vc != null)
        {
            vc.parent = this;
            vc.splitViewController = this;

            this._detailView.addSubview(vc.view);
            this.addChildViewController(vc);
            this._detailViewController = vc;
        }
    }

    showDetailViewController(vc)
    {
        var oldVC = this._detailViewController;
        var newVC = vc;

        newVC.onLoadView(this, function () {

            this._detailView.addSubview(newVC.view);
            this.addChildViewController(newVC);

            _MIUShowViewController(oldVC, newVC, this, false, this, function () {

                oldVC.view.removeFromSuperview();
                this.removeChildViewController(oldVC);
            });
        });
    }
}

