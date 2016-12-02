/**
 * Created by godshadow on 11/3/16.
 */

    /// <reference path="MIOLib.ts" />

    /// <reference path="MIOCore.ts" />
    /// <reference path="MIONotificationCenter.ts" />
    /// <reference path="MIOURLConnection.ts" />
    /// <reference path="MIOViewController.ts" />

    /// <reference path="MIOWindow.ts" />

var MIOLocalizedStrings = null;

class MIOWebApplication
{
    private static _sharedInstance:MIOWebApplication = new MIOWebApplication();

    delegate = null;
    canvas = null;
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

    private _windows = [];

    constructor()
    {
        if (MIOWebApplication._sharedInstance)
        {
            throw new Error("Error: Instantiation failed: Use sharedInstance() instead of new.");
        }

        MIOWebApplication._sharedInstance = this;

        this._decodeParams();

        MIONotificationCenter.defaultCenter().addObserver(this, "MIODownloadingCoreFile", function(notification){

            this.downloadCoreFileCount++;
        });

        MIONotificationCenter.defaultCenter().addObserver(this, "MIODownloadedCoreFile", function(notification){

            this.downloadCoreFileCount--;
            if (this.downloadCoreFileCount == 0)
                this._showViews();
        });
    }

    public static sharedInstance():MIOWebApplication
    {
        return MIOWebApplication._sharedInstance;
    }

    private _decodeParams()
    {
        MIOLibDecodeParams(window.location.search, this, function (param, value){

            if (param == "lang" || param == "language")
            {
                this.currentLanguage = value;
            }
        });
    }

    run()
    {
        // Check languages
        if (this.currentLanguage == null)
            this.currentLanguage = this.defaultLanguage;

        if (MIOLocalizedStrings == null && this.currentLanguage != null)
        {
            // Download language
            this.downloadLanguage(this.currentLanguage, function(){

                this._run();
            });
        }
        else
            this._run();

    }

    private _run()
    {
        this.canvas = document.body;

        this.delegate.didFinishLaunching();
        //this.canvas.appendChild(this.delegate.window.layer);

        if (this.downloadCoreFileCount == 0)
            this._showViews();
    }

    private _showViews()
    {
        this.delegate.window.rootViewController.onLoadView(this, function () {

            this.delegate.window.rootViewController.viewWillAppear();
            this.delegate.window.rootViewController.viewDidAppear();

            this.ready = true;
        });
    }

    setLanguageURL(key, url)
    {
        if (this.languages == null)
            this.languages = {};

        this.languages[key] = url;
    }

    setDefaultLanguage(key)
    {
        this.defaultLanguage = key;
    }

    downloadLanguage(key, fn)
    {
        var url = this.languages[key];

        // Download

        var conn =  new MIOURLConnection();
        conn.initWithRequestBlock(new MIOURLRequest(url), this, function(error, data){

            if (data != null)
            {
                var json = JSON.parse(data.replace(/(\r\n|\n|\r)/gm, ""));
                MIOLocalizedStrings = json;
            }

            fn.call(this);
        });
    }

    beginSheetViewController(vc)
    {
        var window = this.delegate.window;

        this._sheetViewController = vc;
        this._sheetViewController.presentationStyle = MIOPresentationStyle.PageSheet;
        this._sheetViewController.presentationType = MIOPresentationType.Sheet;

        var frame = FrameWithStyleForViewControllerInView(window.rootViewController.view, this._sheetViewController);
        this._sheetViewController.view.setFrame(frame);
        this._sheetViewController.view.layer.style.borderLeft = "1px solid rgb(170, 170, 170)";
        this._sheetViewController.view.layer.style.borderBottom = "1px solid rgb(170, 170, 170)";
        this._sheetViewController.view.layer.style.borderRight = "1px solid rgb(170, 170, 170)";
        this._sheetViewController.view.layer.style.zIndex = 200;

        window.rootViewController.addChildViewController(vc);
        window.rootViewController.view.addSubview(vc.view);
        window.rootViewController.showViewController(vc, true);

        this._sheetSize = vc.contentSize;
        this._sheetViewController.addObserver(this, "contentSize");
    }

    endSheetViewController()
    {
        if (this._sheetViewController == null) return;

        var window = this.delegate.window;

        this._sheetViewController.removeObserver(this, "contentSize");

        this._sheetViewController.dismissViewController(true);
        window.rootViewController.removeChildViewController(this._sheetViewController);
        this._sheetViewController = null;
    }

    observeValueForKeyPath(key, type, object)
    {
        if (type == "will")
        {
            this._sheetSize = this._sheetViewController.contentSize;
        }
        else if (type == "did")
        {
            var newSize = this._sheetViewController.contentSize;
            if (!newSize.isEqualTo(this._sheetSize))
            {
                // Animate the frame
                this._sheetViewController.view.layer.style.transition = "left 0.25s, width 0.25s, height 0.25s";
                var window = this.delegate.window;
                var frame = FrameWithStyleForViewControllerInView(window.rootViewController.view, this._sheetViewController);
                this._sheetViewController.view.setFrame(frame);
            }
        }
    }

    showModalViewContoller(vc)
    {
        var w = new MIOWindow(MIOViewGetNextLayerID("window"));
        w.initWithRootViewController(vc);

        // Add new window
        document.body.appendChild(vc.view.layer);

        this._windows.push(w);
    }

    showMenuFromControl(control, menu)
    {
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

    hideMenu()
    {
        if (this._popUpMenu != null) {
            this._popUpMenu.removeFromSuperview();
            this._popUpMenu = null;
        }
    }

    forwardResizeEvent(e)
    {
        if (this.ready == true)
            this.delegate.window.layout();
    }

    forwardClickEvent(e)
    {
        if (this.ready == false)
            return;

        if (this._popUpMenu != null) {
            var controlRect = this._popUpMenuControl.layer.getBoundingClientRect();

            if ((e.clientX > controlRect.left && e.clientX < controlRect.right)
                && (e.clientY > controlRect.top && e.clientY < controlRect.bottom)) {

                // Nothing
            }
            else {
                this._popUpMenu.hide();
            }
        }

        if (this._popOverWindow != null)
        {
            // if (this._popOverWindowFirstClick == true) {
            //     this._popOverWindowFirstClick = false;
            //     return;
            // }

            var controlRect = this._popOverWindow.rootViewController.view.layer.getBoundingClientRect();

            console.log("x: " + controlRect.left + " mx: " + e.clientX);

            if ((e.clientX > controlRect.left && e.clientX < controlRect.right)
                && (e.clientY > controlRect.top && e.clientY < controlRect.bottom))
            {
                //Nothing
            }
            else
                this.hidePopOverController();
        }
    }

    showPopOverControllerFromRect(vc, frame)
    {
        if (this._popOverWindow != null) {

            this.hidePopOverController();
        }

        if (this._popOverWindow == null)
        {
            this._popOverWindow = new MIOWindow("popover_window");
            this._popOverWindow.initWithRootViewController(vc);
            this._popOverWindow.layer.style.border = "2px solid rgb(170, 170, 170)";
        }

        this._popOverWindow.rootViewController.onLoadView(this, function () {

            this._popOverWindow.rootViewController.viewWillAppear();
            this._popOverWindow.rootViewController.viewDidAppear();
        });

        this._popOverWindowFirstClick = true;
    }

    hidePopOverController()
    {
        this._popOverWindow.rootViewController.viewWillDisappear();
        this._popOverWindow.removeFromSuperview();
        this._popOverWindow.rootViewController.viewDidDisappear();

        this._popOverWindow = null;
    }
}
