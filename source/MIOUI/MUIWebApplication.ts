import { MUIWindow } from "./MUIWindow";
import { MIOCoreGetLanguages } from "../MIOCore";
import { MIOCoreGetBrowserLanguage, MIOCoreEventRegisterObserverForType, MIOCoreEventType, MIOCoreEvent, MIOCoreEventInput } from "../MIOCorePlatform";
import { MIOURLRequest, MIOURL, MIOURLConnection, setMIOLocalizedStrings } from "../MIOFoundation";

/**
 * Created by godshadow on 11/3/16.
 */

export class MUIWebApplication {

    private static _sharedInstance: MUIWebApplication;

    static sharedInstance(): MUIWebApplication {

        if (MUIWebApplication._sharedInstance == null) {

            MUIWebApplication._sharedInstance = new MUIWebApplication();
        }

        return MUIWebApplication._sharedInstance;
    }

    private constructor() {

        if (MUIWebApplication._sharedInstance != null) {
            throw new Error("MUIWebApplication: Instantiation failed: Use sharedInstance() instead of new.");
        }
    }

    delegate = null;

    isMobile = false;
    defaultLanguage = null;
    currentLanguage = null;
    languages = null;
    ready = false;

    private downloadCoreFileCount = 0;

    private _sheetViewController = null;
    private _sheetSize = null;
    //private _popUpMenuView = null;
    private _popUpMenu = null;
    private _popUpMenuControl = null;

    private _popOverWindow = null;
    private _popOverWindowFirstClick = false;

    private _popOverViewController = null;

    private _windows = [];
    private _keyWindow:MUIWindow = null;
    private _mainWindow = null;

    run(){

        // Setup language        
        var languages = MIOCoreGetLanguages();
        if (languages == null){
            this._run();
            return;
        }

        var lang = MIOCoreGetBrowserLanguage();
        var url = languages[lang];
        if (url == null){
            this._run();
            return;
        }
        
        let request = MIOURLRequest.requestWithURL(MIOURL.urlWithString(url));
        let con = new MIOURLConnection();
        con.initWithRequestBlock(request, this, function(code, data){
            if (code == 200) {
                setMIOLocalizedStrings(data);
            }
            this._run();
        });        
    }

    private _run() {        

        this.delegate.didFinishLaunching();
        this.delegate.window.makeKeyAndVisible();
        this._mainWindow = this.delegate.window;        
        
        this.delegate.window.rootViewController.onLoadView(this, function () {
            
            this.delegate.window.rootViewController.viewWillAppear(false);
            this.delegate.window.rootViewController.viewDidAppear(false);

            this.ready = true;

            MIOCoreEventRegisterObserverForType(MIOCoreEventType.Click, this, this._clickEvent);
            MIOCoreEventRegisterObserverForType(MIOCoreEventType.Resize, this, this._resizeEvent);
        });
    }

    setLanguageURL(key, url) {
        if (this.languages == null)
            this.languages = {};

        this.languages[key] = url;
    }

    setDefaultLanguage(key) {
        this.defaultLanguage = key;
    }

    downloadLanguage(key, fn) {
        
        var url = this.languages[key];

        // Download
        var conn = new MIOURLConnection();
        conn.initWithRequestBlock(MIOURLRequest.requestWithURL(url), this, function (error, data) {

            if (data != null) {
                var json = JSON.parse(data.replace(/(\r\n|\n|\r)/gm, ""));
                setMIOLocalizedStrings(json);
            }

            fn.call(this);
        });
    }

    showModalViewContoller(vc) {
        var w = new MUIWindow();
        w.initWithRootViewController(vc);

        // Add new window
        document.body.appendChild(vc.view.layer);

        this._windows.push(w);
    }

    showMenuFromControl(control, menu) {
        if (this._popUpMenu != null) {
            if (menu.layerID != this._popUpMenu.layerID)
                this._popUpMenu.hide();
        }

        this._popUpMenuControl = control;
        this._popUpMenu = menu;

        this.delegate.window.addSubview(this._popUpMenu);

        var x = control.layer.getBoundingClientRect().left;
        var y = control.layer.getBoundingClientRect().top + control.layer.getBoundingClientRect().height;
        this._popUpMenu.setX(x);
        this._popUpMenu.setY(y);
        this._popUpMenu.layer.style.zIndex = 200;

        this._popUpMenu.layout();
    }

    hideMenu() {
        if (this._popUpMenu != null) {
            this._popUpMenu.removeFromSuperview();
            this._popUpMenu = null;
        }
    }

    private _resizeEvent(event:MIOCoreEvent) {
        
        this.delegate.window.layoutSubviews();
    }

    private _clickEvent(event:MIOCoreEventInput)
    {
        var target = event.coreEvent.target;
        var x = event.x;
        var y = event.y;
    
        // Checking popup menus
        if (this._popUpMenu != null) {
            let controlRect = this._popUpMenuControl.layer.getBoundingClientRect();

            if ((x > controlRect.left && x < controlRect.right)
                && (y > controlRect.top && y < controlRect.bottom)) {

                // Nothing
            }
            else {
                this._popUpMenu.hide();
            }
        }

        // Checking windows

        if (this._keyWindow != null) 
        {        
            let controlRect = this._keyWindow.layer.getBoundingClientRect();

            //console.log("x: " + controlRect.left + " mx: " + x);

            if ((x > controlRect.left && x < controlRect.right)
                && (y > controlRect.top && y < controlRect.bottom)) {
                //Nothing. Forward the event
            }
            else
                this._keyWindow._eventHappendOutsideWindow();
        }
    }

    setPopOverViewController(vc) {
        if (this._popOverViewController != null)
            this._popOverViewController.dismissViewController(true);

        this._popOverViewController = vc;
    }

    showPopOverControllerFromRect(vc, frame) {
        if (this._popOverWindow != null) {
            this.hidePopOverController();
        }

        if (this._popOverWindow == null) {
            this._popOverWindow = new MUIWindow("popover_window");
            this._popOverWindow.initWithRootViewController(vc.popoverPresentationController());
            //this._popOverWindow.layer.style.border = "2px solid rgb(170, 170, 170)";
            this._popOverWindow.setFrame(vc.popoverPresentationController().frame);
        }

        this._popOverWindow.rootViewController.onLoadView(this, function () {

            this._popOverWindow.rootViewController.viewWillAppear(true);
            this._popOverWindow.rootViewController.viewDidAppear(true);
        });

        this._popOverWindowFirstClick = true;
    }

    hidePopOverController() {
        this._popOverWindow.rootViewController.viewWillDisappear(true);
        this._popOverWindow.removeFromSuperview();
        this._popOverWindow.rootViewController.viewDidDisappear(true);

        this._popOverWindow = null;
    }

    addWindow(window)
    {
        this._windows.push(window);
    }

    makeKeyWindow(window)
    {
        if (this._keyWindow === window) return;

        if (this._keyWindow != null)        
            this._keyWindow._resignKeyWindow();

        this.addWindow(window);
        this._keyWindow = window;
    }
}
