/**
 * Created by godshadow on 11/3/16.
 */

/// <reference path="MUIView.ts" />
/// <reference path="MUIViewController.ts" />

class MUIWindow extends MUIView
{
    rootViewController = null;

    private _resizeWindow = false;

    initWithRootViewController(vc)
    {
        this.init();

        this.rootViewController = vc;
        this.addSubview(vc.view);
    }

    makeKey()
    {
        MUIWebApplication.sharedInstance().makeKeyWindow(this);
    }

    makeKeyAndVisible()
    {
        this.makeKey();
        this.setHidden(false);
    }

    layout()
    {

        if (this.rootViewController != null)
            this.rootViewController.view.layout();
        else
            super.layout();                
    }

    protected _addLayerToDOM()
    {
        if (this._isLayerInDOM == true)
            return;

        if (this.layer == null)
            return;

        document.body.appendChild(this.layer);

        this._isLayerInDOM = true;
    }

    protected _removeLayerFromDOM()
    {
        if (this._isLayerInDOM == false)
            return;

        document.body.removeChild(this.layer);
        this._isLayerInDOM = false;
    }

    setHidden(hidden)
    {
        if (hidden == false)
        {
            this._addLayerToDOM();            
        }
        else
        {
            if (this.rootViewController != null)
                this.rootViewController.dismissViewController(true);
        
            this._removeLayerFromDOM();
        }
    }
}

