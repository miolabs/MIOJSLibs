/**
 * Created by godshadow on 11/3/16.
 */

    /// <reference path="MIOView.ts" />

class MIOWindow extends MIOView
{
    rootViewController = null;

    init()
    {
        this.layer = document.createElement("div");
        this.layer.setAttribute("id", "window");
        this.layer.style.position = "absolute";
        this.layer.style.left = "0px";
        this.layer.style.top = "0px";
        this.layer.style.width = "100%";
        this.layer.style.height = "100%";

        // Only windows
        document.body.appendChild(this.layer);
    }

    initWithRootViewController(vc)
    {
        this.init();

        this.rootViewController = vc;
        this.addSubview(vc.view);
    }
}

