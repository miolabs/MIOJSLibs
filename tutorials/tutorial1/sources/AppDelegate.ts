/**
 * Created by godshadow on 30/11/2016.
 */

/// <reference path="../libs/MIOFoundation/MIOFoundation.ts" />

/// <reference path="ViewController.ts" />

class AppDelegate {

    window = null;

    private _persistentStoreCoordinator = null;
    private _managedObjectModel = null;
    private _managedObjectContext = null;

    didFinishLaunching() {
        
        var vc = new ViewController("view");
        vc.initWithResource("layout/View.html");

        this.window = new MUIWindow();
        this.window.initWithRootViewController(vc);
    }

    get managedObjectContext():MIOManagedObjectContext {
        
        if (this._managedObjectContext != null)
            return this._managedObjectContext;

        // TODO: make object model and persistent store coordinator

        this._managedObjectContext = new MIOManagedObjectContext();
        this._managedObjectContext.init();

        var coordinator = this.persistentStoreCoordinator;
        this._managedObjectContext.persistentStoreCoordinator = coordinator;

        return this._managedObjectContext;
    }

    get managedObjectModel():MIOManagedObjectModel {
        
        if (this._managedObjectModel)
            return this._managedObjectModel;
	
        this._managedObjectModel =  new MIOManagedObjectModel(); 
        this._managedObjectModel.initWithContentsOfURL(MIOURL.urlWithString("datamodel.xml")); 
    
        return this._managedObjectModel;
    }

    get persistentStoreCoordinator():MIOPersistentStoreCoordinator {
    
        if (this._persistentStoreCoordinator)
            return this._persistentStoreCoordinator;
    
        var mom = this.managedObjectModel;
        if (!mom) throw ("No model to generate a store from app delegate"); //[self class], NSStringFromSelector(_cmd));
    
        var coordinator = new MIOPersistentStoreCoordinator();
        coordinator.initWithManagedObjectModel(mom);

        this._persistentStoreCoordinator = coordinator;    
        return this._persistentStoreCoordinator;
    }
}

