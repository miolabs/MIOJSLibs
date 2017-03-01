/// <reference path="libs/MIOUI/MIOUI.ts" />
var AppDelegate = (function () {
    function AppDelegate() {
        this.window = null;
    }
    AppDelegate.prototype.didFinishLaunching = function () {
        var vc = new MUIViewController();
        vc.init();
        this.window = new MUIWindow();
        this.window.initWithRootViewController(vc);
    };
    return AppDelegate;
}());
