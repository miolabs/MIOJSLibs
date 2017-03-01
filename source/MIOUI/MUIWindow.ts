/**
 * Created by godshadow on 11/3/16.
 */

/// <reference path="MUIView.ts" />
/// <reference path="MUIViewController.ts" />

class MUIWindow extends MUIView
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
