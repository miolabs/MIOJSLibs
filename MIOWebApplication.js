/**
 * Created by godshadow on 11/3/16.
 */
/// <reference path="MIOCore.ts" />
/// <reference path="MIONotificationCenter.ts" />
/// <reference path="MIOURLConnection.ts" />
/// <reference path="MIOViewController.ts" />
var MIOLocalizedStrings = null;
var MIOWebApplication = (function () {
    function MIOWebApplication() {
        this.delegate = null;
        this.canvas = null;
        this.isMobile = false;
        this.defaultLanguage = null;
        this.currentLanguage = null;
        this.languages = null;
        this.ready = false;
        this.downloadCoreFileCount = 0;
        this._sheetViewController = null;
        if (MIOWebApplication._sharedInstance) {
            throw new Error("Error: Instantiation failed: Use sharedInstance() instead of new.");
        }
        MIOWebApplication._sharedInstance = this;
        this.isMobile = MIOCoreIsMobile();
        this.decodeParams(window.location.search);
        // Add animation lib
        // TODO: Check in a normal web if it works
        MIOCoreLoadStyle("src/miolib/extras/animate.min.css");
        MIONotificationCenter.defaultCenter().addObserver(this, "MIODownloadingCoreFile", function (notification) {
            this.downloadCoreFileCount++;
        });
        MIONotificationCenter.defaultCenter().addObserver(this, "MIODownloadedCoreFile", function (notification) {
            this.downloadCoreFileCount--;
            if (this.downloadCoreFileCount == 0)
                this._showViews();
        });
    }
    MIOWebApplication.sharedInstance = function () {
        return MIOWebApplication._sharedInstance;
    };
    MIOWebApplication.prototype.run = function () {
        // Check languages
        if (this.currentLanguage == null)
            this.currentLanguage = this.defaultLanguage;
        if (MIOLocalizedStrings == null && this.currentLanguage != null) {
            // Download language
            this.downloadLanguage(this.currentLanguage, function () {
                this._run();
            });
        }
        else
            this._run();
    };
    MIOWebApplication.prototype._run = function () {
        this.canvas = document.body;
        this.delegate.didFinishLaunching();
        //this.canvas.appendChild(this.delegate.window.layer);
        if (this.downloadCoreFileCount == 0)
            this._showViews();
    };
    MIOWebApplication.prototype._showViews = function () {
        this.delegate.window.rootViewController.onLoadView(this, function () {
            this.delegate.window.rootViewController.viewWillAppear();
            this.delegate.window.rootViewController.viewDidAppear();
            this.ready = true;
        });
    };
    MIOWebApplication.prototype.decodeParams = function (string) {
        var param = "";
        var value = "";
        var isParam = false;
        for (var index = 0; index < string.length; index++) {
            var ch = string.charAt(index);
            if (ch == "?") {
                isParam = true;
            }
            else if (ch == "&") {
                // new param
                this.evaluateParam(param, value);
                isParam = true;
                param = "";
                value = "";
            }
            else if (ch == "=") {
                isParam = false;
            }
            else {
                if (isParam == true)
                    param += ch;
                else
                    value += ch;
            }
        }
        this.evaluateParam(param, value);
    };
    MIOWebApplication.prototype.evaluateParam = function (param, value) {
        if (param == "lang" || param == "language") {
            this.currentLanguage = value;
        }
    };
    MIOWebApplication.prototype.setLanguageURL = function (key, url) {
        if (this.languages == null)
            this.languages = {};
        this.languages[key] = url;
    };
    MIOWebApplication.prototype.setDefaultLanguage = function (key) {
        this.defaultLanguage = key;
    };
    MIOWebApplication.prototype.downloadLanguage = function (key, fn) {
        var url = this.languages[key];
        // Download
        var conn = new MIOURLConnection();
        conn.initWithRequestBlock(new MIOURLRequest(url), this, function (error, data) {
            if (data != null) {
                var json = JSON.parse(data.replace(/(\r\n|\n|\r)/gm, ""));
                MIOLocalizedStrings = json;
            }
            fn.call(this);
        });
    };
    MIOWebApplication.prototype.beginSheetViewController = function (vc) {
        var window = this.delegate.window;
        this._sheetViewController = vc;
        this._sheetViewController.presentationStyle = MIOPresentationStyle.PageSheet;
        this._sheetViewController.presentationType = MIOPresentationType.Sheet;
        var frame = FrameWithStyleForViewControllerInView(window.rootViewController.view, this._sheetViewController);
        this._sheetViewController.view.setFrame(frame);
        this._sheetViewController.view.layer.style.borderLeft = "1px solid rgb(170, 170, 170)";
        this._sheetViewController.view.layer.style.borderBottom = "1px solid rgb(170, 170, 170)";
        this._sheetViewController.view.layer.style.borderRight = "1px solid rgb(170, 170, 170)";
        window.rootViewController.addChildViewController(vc);
        window.rootViewController.view.addSubview(vc.view);
        window.rootViewController.showViewController(vc, true);
    };
    MIOWebApplication.prototype.endSheetViewController = function () {
        var window = this.delegate.window;
        window.rootViewController.removeChildViewController(this._sheetViewController);
        this._sheetViewController.dismissViewController(true);
        this._sheetViewController = null;
    };
    MIOWebApplication._sharedInstance = new MIOWebApplication();
    return MIOWebApplication;
}());
//# sourceMappingURL=MIOWebApplication.js.map