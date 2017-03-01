
/// <reference path="libs/MIOUI/MIOUI.ts" />

class AppDelegate
{
    window = null;

    didFinishLaunching() {

        var vc = new MUIViewController();
        vc.init();

        this.window = new MUIWindow();
        this.window.initWithRootViewController(vc);
    }
}