/**
 * Created by godshadow on 11/3/16.
 */

    /// <reference path="MIOView.ts" />

class MIOWindow extends MIOView
{
    rootViewController = null;

    constructor()
    {
        super();
    }

    init()
    {
        super.init();

        this.layer.setAttribute("id", "window_id");
        this.layer.style.position = "absolute";
        this.layer.style.left = "0px";
        this.layer.style.top = "0px";
        this.layer.style.width = "100%";
        this.layer.style.height = "100%";
    }

    initWithRootViewController(vc)
    {
        this.init();

        this.rootViewController = vc;
        this.addSubview(vc.view);
    }
}

