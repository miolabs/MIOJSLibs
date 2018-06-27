import { _MIUShowViewController } from "./MIOUI_Core";
import { MUIView } from "./MUIView";
import { MUIViewController } from "./MUIViewController";
import { MUICoreLayerAddStyle } from ".";

/**
 * Created by godshadow on 05/08/16.
 */


export class MUISplitViewController extends MUIViewController
{
    private masterView = null;
    private detailView = null;

    init(){
        super.init();

        this.masterView = new MUIView();
        this.masterView.init();
        MUICoreLayerAddStyle(this.masterView.layer, "master-view");
        // this.masterView.layer.style.position = "absolute";
        // this.masterView.layer.style.left = "0px";
        // this.masterView.layer.style.width = "320px";
        // this.masterView.layer.style.height = "100%";
        this.view.addSubview(this.masterView);

        this.detailView = new MUIView();
        this.detailView.init();
        MUICoreLayerAddStyle(this.detailView.layer, "detail-view");
        // this.detailView.layer.style.position = "absolute";
        // this.detailView.layer.style.left = "320px";
        // this.detailView.layer.style.right = "0px";
        // this.detailView.layer.style.height = "100%";
        this.view.addSubview(this.detailView);
    }

    private _masterViewController = null;    
    setMasterViewController(vc){
        if (this._masterViewController != null){
            this._masterViewController.view.removeFromSuperview();
            this.removeChildViewController(this._masterViewController);
            this._masterViewController = null;
        }

        if (vc != null){
            vc.parent = this;
            vc.splitViewController = this;

            this.masterView.addSubview(vc.view);
            this.addChildViewController(vc);
            this._masterViewController = vc;
        }
    }

    private _detailViewController = null;
    setDetailViewController(vc){
        if (this._detailViewController != null){
            this._detailViewController.view.removeFromSuperview();
            this.removeChildViewController(this._detailViewController);
            this._detailViewController = null;
        }

        if (vc != null){
            vc.parent = this;
            vc.splitViewController = this;

            this.detailView.addSubview(vc.view);
            this.addChildViewController(vc);
            this._detailViewController = vc;
        }
    }

    showDetailViewController(vc){
        let oldVC = this._detailViewController;
        let newVC = vc;

        if (oldVC == newVC) return;

        newVC.onLoadView(this, function () {

            this.detailView.addSubview(newVC.view);
            this.addChildViewController(newVC);
            this._detailViewController = vc;

            _MIUShowViewController(oldVC, newVC, this, this, function () {

                oldVC.view.removeFromSuperview();
                this.removeChildViewController(oldVC);
            });
        });
    }

    get masterViewController():MUIViewController{
        return this._masterViewController;
    }

    get detailViewController():MUIViewController{
        return this._detailViewController;
    }
}

