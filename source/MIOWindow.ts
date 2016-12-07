/**
 * Created by godshadow on 11/3/16.
 */

    /// <reference path="MIOView.ts" />
    /// <reference path="MIOViewController.ts" />

class MIOWindow extends MIOView
{
    rootViewController = null;

    constructor(layerID?)
    {
        super(layerID);

        if (layerID == null)
            this.layerID = "main_window";
    }

    init()
    {
        super.init();

        // Only windows
        document.body.appendChild(this.layer);
    }

    initWithRootViewController(vc)
    {
        this.init();

        this.rootViewController = vc;
        this.addSubview(vc.view);
    }

    removeFromSuperview()
    {
        document.body.removeChild(this.layer);
    }

    layout()
    {
        this.rootViewController.view.layout();
    }
}

