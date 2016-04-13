/**
 * Created by godshadow on 11/3/16.
 */

    /// <reference path="MIOCore.ts" />

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

    constructor()
    {
        if (MIOWebApplication._sharedInstance)
        {
            throw new Error("Error: Instantiation failed: Use sharedInstance() instead of new.");
        }
        MIOWebApplication._sharedInstance = this;
        this.isMobile = MIOCoreIsMobile();
        
        this.decodeParams(window.location.search);

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

    run()
    {
        // Check languages
        if (this.currentLanguage == null)
            this.currentLanguage = this.defaultLanguage;

        if (MIOLocalizedStrings == null)
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
        this.canvas.appendChild(this.delegate.window.layer);


        if (this.downloadCoreFileCount == 0)
            this._showViews();
    }

    private _showViews()
    {
        this.delegate.window.rootViewController.viewWillAppear();
        this.delegate.window.rootViewController.viewDidAppear();

        this.ready = true;
    }

    decodeParams(string)
    {
        var param = "";
        var value = "";
        var isParam = false;

        for (var index = 0; index < string.length; index++)
        {
            var ch = string.charAt(index);

            if (ch == "?")
            {
                isParam = true;
            }
            else if (ch == "&")
            {
                // new param
                this.evaluateParam(param, value);
                isParam = true;
                param = "";
                value = "";
            }
            else if (ch == "=")
            {
                isParam = false;
            }
            else
            {
                if (isParam == true)
                    param += ch;
                else
                    value += ch;
            }
        }

        this.evaluateParam(param, value);
    }

    evaluateParam(param, value)
    {
        if (param == "lang" || param == "language")
        {
            this.currentLanguage = value;
        }
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
        var instance = this;
        var conn =  new MIOURLConnection();
        conn.initWithRequestBlock(new MIOURLRequest(url), function(error, data){

            if (data != null)
            {
                var json = JSON.parse(data.replace(/(\r\n|\n|\r)/gm, ""));
                MIOLocalizedStrings = json;
            }

            fn.call(instance);
        });
    }

}
