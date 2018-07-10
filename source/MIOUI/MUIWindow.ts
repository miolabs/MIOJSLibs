import { MUIWebApplication } from "./MUIWebApplication";
import { MUIViewController } from "./MUIViewController";
import { MUIView } from "./MUIView";
import { MUIPopoverPresentationController } from "./MUIViewController_PopoverPresentationController";
import { MUICoreLayerAddStyle } from ".";

/**
 * Created by godshadow on 11/3/16.
 */

export class MUIWindow extends MUIView
{
    rootViewController:MUIViewController = null;

    private _resizeWindow = false;

    init(){
        super.init();
        MUICoreLayerAddStyle(this.layer, "view");
    }

    initWithRootViewController(vc){
        this.init();        

        this.rootViewController = vc;
        this.addSubview(vc.view);        
    }

    makeKey(){
        MUIWebApplication.sharedInstance().makeKeyWindow(this);
    }

    makeKeyAndVisible(){
        this.makeKey();
        this.setHidden(false);
    }

    layoutSubviews(){
        if (this.rootViewController != null)
            this.rootViewController.view.layoutSubviews();
        else
            super.layoutSubviews();                
    }

    addSubview(view:MUIView){
        view._window = this;
        super.addSubview(view);
    }

    protected _addLayerToDOM(){
        if (this._isLayerInDOM == true)
            return;

        if (this.layer == null)
            return;

        document.body.appendChild(this.layer);

        this._isLayerInDOM = true;
    }

    removeFromSuperview(){                
        this._removeLayerFromDOM();
    }

    protected _removeLayerFromDOM(){
        if (this._isLayerInDOM == false)
            return;

        document.body.removeChild(this.layer);
        this._isLayerInDOM = false;
    }

    setHidden(hidden){
        if (hidden == false){
            this._addLayerToDOM();
        }
        else{
            this._removeLayerFromDOM();
        }
    }

    _eventHappendOutsideWindow(){
        this._dismissRootViewController();        
    }

    _becameKeyWindow(){
        
    }

    _resignKeyWindow(){
        this._dismissRootViewController();
    }

    private _dismissRootViewController(){
        if (this.rootViewController.isPresented == true){
            let pc = this.rootViewController.presentationController;
            if (pc instanceof MUIPopoverPresentationController)
                this.rootViewController.dismissViewController(true);
        }
    }
}

