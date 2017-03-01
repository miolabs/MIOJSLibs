var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
function MIOCoreDecodeParams(string, target, completion) {
    var param = "";
    var value = "";
    var isParam = false;
    for (var index = 0; index < string.length; index++) {
        var ch = string.charAt(index);
        if (ch == "?") {
            isParam = true;
        }
        else if (ch == "&") {
            MIOCoreEvaluateParam(param, value, target, completion);
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
    MIOCoreEvaluateParam(param, value, target, completion);
}
function MIOCoreEvaluateParam(param, value, target, completion) {
    if (target != null && completion != null)
        completion.call(target, param, value);
}
window.onload = function () {
    var args = {};
    MIOCoreDecodeParams(window.location.search, this, function (param, value) {
        args[param] = value;
    });
    main(args);
};
var MIOObject = (function () {
    function MIOObject() {
    }
    return MIOObject;
}());
var _MUIViewNextLayerID = 0;
function MIOViewGetNextLayerID(prefix) {
    var layerID = null;
    if (prefix == null) {
        _MUIViewNextLayerID++;
        layerID = _MUIViewNextLayerID;
    }
    else {
        layerID = prefix + "_" + _MUIViewNextLayerID;
    }
    return layerID;
}
var MUIView = (function (_super) {
    __extends(MUIView, _super);
    function MUIView(layerID) {
        var _this = _super.call(this) || this;
        _this.layerID = null;
        _this.layer = null;
        if (layerID != null)
            _this.layerID = layerID;
        else
            _this.layerID = MIOViewGetNextLayerID();
        return _this;
    }
    MUIView.prototype.init = function () {
        this.layer = document.createElement("div");
        this.layer.setAttribute("id", this.layerID);
        this.layer.style.position = "absolute";
        this.layer.style.top = "0px";
        this.layer.style.left = "0px";
        this.layer.style.width = "100%";
        this.layer.style.height = "100%";
        this.layer.style.background = "rgb(255, 255, 255)";
    };
    return MUIView;
}(MIOObject));
var MUIWindow = (function (_super) {
    __extends(MUIWindow, _super);
    function MUIWindow(layerID) {
        var _this = _super.call(this, layerID ? layerID : MIOViewGetNextLayerID("window")) || this;
        _this.rootViewController = null;
        return _this;
    }
    MUIWindow.prototype.init = function () {
        _super.prototype.init.call(this);
        document.body.appendChild(this.layer);
    };
    MUIWindow.prototype.initWithRootViewController = function (vc) {
        this.init();
        this.rootViewController = vc;
    };
    return MUIWindow;
}(MUIView));
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
var MUIViewController = (function (_super) {
    __extends(MUIViewController, _super);
    function MUIViewController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._onLoadViewTarget = null;
        _this._onLoadViewAction = null;
        return _this;
    }
    MUIViewController.prototype.init = function () {
    };
    MUIViewController.prototype.initWithResourceURL = function (url) {
    };
    MUIViewController.prototype.onLoadView = function (target, action) {
        this._onLoadViewTarget = target;
        this._onLoadViewAction = action;
        this._onLoadViewAction.call(this._onLoadViewTarget);
    };
    return MUIViewController;
}(MIOObject));
//# sourceMappingURL=app.js.map