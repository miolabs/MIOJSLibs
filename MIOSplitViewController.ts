/**
 * Created by godshadow on 05/08/16.
 */

/// <reference path="MIOViewController.ts" />

class MIOSplitViewController extends MIOViewController
{
    private _masterViewController = null;
    private _detailViewController = null;
    private _emptyDetailViewController = null;

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
        vc.parent = this;
        this._masterView.addSubview(vc.view);
        this.childViewControllers.push(vc);

        this._masterViewController = vc;
    }

    setDetailViewController(vc)
    {
        vc.parent = this;
        this._detailView.addSubview(vc.view);
        this.childViewControllers.push(vc);

        this._detailViewController = vc;
    }

    setEmptyDetailViewController(vc)
    {
        vc.parent = this;
        this._detailView.addSubview(vc.view);
        this.childViewControllers.push(vc);

        this._emptyDetailViewController = vc;
    }
}

