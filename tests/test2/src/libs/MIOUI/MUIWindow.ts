
/// <reference path="MUIView.ts" />

class MUIWindow extends MUIView
{
    rootViewController = null;

    constructor(layerID?) {
        
        super(layerID ? layerID : MIOViewGetNextLayerID("window"));        
    }    

    init()
    {
        super.init();

        // Only windows
        document.body.appendChild(this.layer);
    }

    initWithRootViewController(vc) {

        this.init();
        this.rootViewController = vc;
        
    }    
}