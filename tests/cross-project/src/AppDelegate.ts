/**
 * Created by godshadow on 26/08/16.
 */

class AppDelegate {

    window = null;

    private _managedObjectContext = null;

    didFinishLaunching() {

        var vc = new ViewController("view");
        vc.initWithResource("dlorderweblib/layout/View.html");

        this.window = new MIOWindow();
        this.window.initWithRootViewController(vc);
    }

    get managedObjectContext() {
	    
        if (this._managedObjectContext != null)
            return this._managedObjectContext;

        // TODO: make object model and persistent store coordinator

        this._managedObjectContext = new MIOManagedObjectContext();
        this._managedObjectContext.init();

        return this._managedObjectContext;
    }

}
