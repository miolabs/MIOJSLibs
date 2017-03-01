/// <reference path="../MIOFoundation/MIOFoundation.ts" />
var MUIWebApplication = (function () {
    function MUIWebApplication() {
        this._canvas = document.body;
        this.delegate = null;
        if (MUIWebApplication._sharedInstance != null) {
            throw new Error("Error: Instantiation failed: Use sharedInstance() instead of new.");
        }
    }
    MUIWebApplication.sharedInstance = function () {
        if (MUIWebApplication._sharedInstance == null) {
            MUIWebApplication._sharedInstance = new MUIWebApplication();
        }
        return MUIWebApplication._sharedInstance;
    };
    MUIWebApplication.prototype.run = function () {
        this.delegate.didFinishLaunching();
        this.delegate.window.rootViewController.onLoadView(this, function () {
            console.log("VIEW DID LOAD");
        });
    };
    return MUIWebApplication;
}());
