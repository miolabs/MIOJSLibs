/**
 * Created by godshadow on 26/08/16.
 */

class AppDelegate {

    window = null;

    private _managedObjectContext = null;

    didFinishLaunching() {

        var vc = new ViewController("view");
        vc.initWithResource("views/base/View.html");

        this.window = new MUIWindow();
        this.window.initWithRootViewController(vc);
    }

}
