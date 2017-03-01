
/// <reference path="../MIOFoundation/MIOFoundation.ts" />
/// <reference path="MUIWindow.ts" />

class MUIWebApplication
{
    private static _sharedInstance : MUIWebApplication;

    static sharedInstance() : MUIWebApplication {

        if (MUIWebApplication._sharedInstance == null) {
            
            MUIWebApplication._sharedInstance = new MUIWebApplication();
        }

        return MUIWebApplication._sharedInstance;
    }

    private constructor () {
        
        if (MUIWebApplication._sharedInstance != null) {
            throw new Error("Error: Instantiation failed: Use sharedInstance() instead of new.");
        }
    }

    private _canvas = document.body;

    delegate = null;

    run() {
        
        this.delegate.didFinishLaunching();
        this.delegate.window.rootViewController.onLoadView(this, function() {

            console.log("VIEW DID LOAD");
        });
    }
}
