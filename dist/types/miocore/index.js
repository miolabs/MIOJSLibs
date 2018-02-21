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
var MIOCoreBrowserType;
(function (MIOCoreBrowserType) {
    MIOCoreBrowserType[MIOCoreBrowserType["Safari"] = 0] = "Safari";
    MIOCoreBrowserType[MIOCoreBrowserType["Chrome"] = 1] = "Chrome";
    MIOCoreBrowserType[MIOCoreBrowserType["IE"] = 2] = "IE";
    MIOCoreBrowserType[MIOCoreBrowserType["Edge"] = 3] = "Edge";
    MIOCoreBrowserType[MIOCoreBrowserType["Other"] = 4] = "Other";
})(MIOCoreBrowserType || (MIOCoreBrowserType = {}));
function MIOCoreGetBrowser() {
    var agent = navigator.userAgent.toLowerCase();
    var browserType;
    if (agent.indexOf("chrome") != -1)
        browserType = MIOCoreBrowserType.Chrome;
    else if (agent.indexOf("safari") != -1)
        browserType = MIOCoreBrowserType.Safari;
    else
        browserType = MIOCoreBrowserType.Other;
    return browserType;
}
function MIOCoreGetBrowserLocale() {
    return navigator.languages || navigator.language || navigator.userLanguage;
}
function MIOCoreGetBrowserLanguage() {
    var locale = MIOCoreGetBrowserLocale();
    if (typeof (locale) == "string")
        return locale.substring(0, 2);
    else {
        var l = locale[0];
        return l.substring(0, 2);
    }
}
function MIOCoreGetMainBundleURLString() {
    return window.location.href;
}
function MIOCoreIsPhone() {
    var value = _MIOCoreDebugOptions[MIOCoreDebugOption.Phone];
    if (value != null)
        return value;
    var phone = ['iphone', 'android', 'blackberry', 'nokia', 'opera mini', 'windows mobile', 'windows phone', 'iemobile'];
    for (var index = 0; index < phone.length; index++) {
        if (navigator.userAgent.toLowerCase().indexOf(phone[index].toLowerCase()) > 0) {
            return true;
        }
    }
    return false;
}
function MIOCoreIsPad() {
    var value = _MIOCoreDebugOptions[MIOCoreDebugOption.Pad];
    if (value != null)
        return value;
    var pad = ['ipad'];
    for (var index = 0; index < pad.length; index++) {
        if (navigator.userAgent.toLowerCase().indexOf(pad[index].toLowerCase()) > 0) {
            return true;
        }
    }
    return false;
}
function MIOCoreIsMobile() {
    var value = _MIOCoreDebugOptions[MIOCoreDebugOption.Mobile];
    if (value != null)
        return value;
    var mobile = ['iphone', 'android', 'blackberry', 'nokia', 'opera mini', 'windows mobile', 'windows phone', 'iemobile'];
    for (var index = 0; index < mobile.length; index++) {
        if (navigator.userAgent.toLowerCase().indexOf(mobile[index].toLowerCase()) > 0)
            return true;
    }
    return false;
}
function MIOCoreLoadScript(url) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
}
var _stylesCache = {};
function _MIOCoreLoadStyle_test1(url, target, completion) {
    if (_stylesCache[url] != null)
        return;
    _stylesCache[url] = true;
    var ss = document.createElement("link");
    ss.type = "text/css";
    ss.rel = "stylesheet";
    ss.href = url;
    document.getElementsByTagName("head")[0].appendChild(ss);
}
function _MIOCoreLoadStyle_test2(url, target, completion) {
    if (_stylesCache[url] != null)
        return;
    _stylesCache[url] = true;
    var style = document.createElement('style');
    style.textContent = '@import "' + url + '"';
    var fi = setInterval(function () {
        try {
            style.sheet.cssRules;
            clearInterval(fi);
            if (target != null && completion != null)
                completion.call(target);
        }
        catch (e) { }
    }, 10);
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(style);
}
function MIOCoreLoadStyle(url, media, target, completion) {
    if (_stylesCache[url] != null) {
        if (target != null && completion != null)
            completion.call(target);
        return;
    }
    _stylesCache[url] = true;
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    if (media != null)
        link.media = media;
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(link);
    if (target == null && completion == null)
        return;
    var img = document.createElement('img');
    img.onerror = function () {
        completion.call(target);
    };
    img.src = url;
}
window.onload = function (e) {
    var url = MIOCoreGetMainBundleURLString();
    console.log("Main URL: " + url);
    var args = url;
    main(args);
};
window.onerror = function (e) {
    console.log("window.onerror ::" + JSON.stringify(e));
};
var _miocore_events_event_observers = {};
function MIOCoreEventRegisterObserverForType(eventType, observer, completion) {
    var item = { "Target": observer, "Completion": completion };
    var array = _miocore_events_event_observers[eventType];
    if (array == null) {
        array = [];
        _miocore_events_event_observers[eventType] = array;
    }
    array.push(item);
}
function MIOCoreEventUnregisterObserverForType(eventType, observer) {
    var obs = _miocore_events_event_observers[eventType];
    if (obs == null)
        return;
    var index = -1;
    for (var count = 0; count < obs.length; count++) {
        var item = obs[count];
        var target = item["Target"];
        if (target === observer) {
            index = count;
            break;
        }
    }
    if (index > -1)
        obs.splice(index, 1);
}
function _MIOCoreEventSendToObservers(obs, event) {
    if (obs != null) {
        for (var index = 0; index < obs.length; index++) {
            var o = obs[index];
            var target = o["Target"];
            var completion = o["Completion"];
            completion.call(target, event);
        }
    }
}
window.addEventListener("keydown", function (e) {
    var event = new MIOCoreKeyEvent();
    event.initWithKeyCode(MIOCoreEventType.KeyDown, e.keyCode, e);
    var observers = _miocore_events_event_observers[MIOCoreEventType.KeyDown];
    _MIOCoreEventSendToObservers(observers, event);
}, false);
window.addEventListener('keyup', function (e) {
    var event = new MIOCoreKeyEvent();
    event.initWithKeyCode(MIOCoreEventType.KeyUp, e.keyCode, e);
    var observers = _miocore_events_event_observers[MIOCoreEventType.KeyUp];
    _MIOCoreEventSendToObservers(observers, event);
}, false);
window.addEventListener('mousedown', function (e) {
    var event = new MIOCoreKeyEvent();
    event.initWithType(MIOCoreEventType.MouseDown, e);
    var observers = _miocore_events_event_observers[MIOCoreEventType.MouseDown];
    _MIOCoreEventSendToObservers(observers, event);
}, false);
window.addEventListener('mouseup', function (e) {
    var event = new MIOCoreEventMouse();
    event.initWithType(MIOCoreEventType.MouseUp, e);
    var observers = _miocore_events_event_observers[MIOCoreEventType.MouseUp];
    _MIOCoreEventSendToObservers(observers, event);
    var observers = _miocore_events_event_observers[MIOCoreEventType.Click];
    _MIOCoreEventSendToObservers(observers, event);
}, false);
window.addEventListener('touchend', function (e) {
    var event = new MIOCoreEventTouch();
    event.initWithType(MIOCoreEventType.TouchEnd, e);
    var observers = _miocore_events_event_observers[MIOCoreEventType.TouchEnd];
    _MIOCoreEventSendToObservers(observers, event);
    var observers = _miocore_events_event_observers[MIOCoreEventType.Click];
    _MIOCoreEventSendToObservers(observers, event);
}, false);
window.addEventListener("resize", function (e) {
    var event = new MIOCoreEvent();
    event.initWithType(MIOCoreEventType.Resize, e);
    var observers = _miocore_events_event_observers[MIOCoreEventType.Resize];
    _MIOCoreEventSendToObservers(observers, event);
}, false);
function MIOCoreStringHasPreffix(str, preffix) {
    return str.substring(0, preffix.length) === preffix;
}
function MIOCoreStringHasSuffix(str, suffix) {
    return str.match(suffix + "$") == suffix;
}
function MIOCoreStringAppendPathComponent(string, path) {
    var str = string;
    if (string.charAt(string.length - 2) != "/")
        str += "/";
    if (path.charAt(0) != "/")
        str += path;
    else
        str += path.substr(1);
    return str;
}
function MIOCoreStringLastPathComponent(string) {
    var index = string.lastIndexOf("/");
    var len = string.length - index;
    var str = string.substr(index, len);
    return str;
}
function MIOCoreStringDeletingLastPathComponent(string) {
    var index = string.lastIndexOf("/");
    var str = string.substr(0, index);
    return str;
}
function MIOCoreStringStandardizingPath(string) {
    var array = string.split("/");
    var newArray = [];
    var index = 0;
    for (var count = 0; count < array.length; count++) {
        var component = array[count];
        if (component.substr(0, 2) == "..")
            index--;
        else {
            newArray[index] = component;
            index++;
        }
    }
    var str = "";
    if (index > 0)
        str = newArray[0];
    for (var count = 1; count < index; count++) {
        str += "/" + newArray[count];
    }
    return str;
}
var MIOCoreBundle = (function () {
    function MIOCoreBundle() {
        this.baseURL = null;
        this._layoutWorker = null;
        this._layoutQueue = null;
        this._layoutCache = null;
        this._isDownloadingResource = false;
        this._loadingCSSCount = 0;
    }
    MIOCoreBundle.prototype.loadHMTLFromPath = function (path, layerID, target, completion) {
        if (this._layoutWorker == null) {
            this._layoutWorker = new Worker("webworkers/MIOBundleWebworker.js");
            var instance = this;
            this._layoutWorker.onmessage = function (event) {
                var item = event.data;
                if (item["Type"] == "CSS") {
                }
                else if (item["Type"] == "HTML") {
                    var result = item["Result"];
                    instance.layerDidDownload(result.layout);
                }
                else if (item["Error"] != null) {
                    throw ("MIOBundle: " + item["Error"]);
                }
            };
        }
        if (this._layoutQueue == null)
            this._layoutQueue = [];
        if (this._layoutCache == null)
            this._layoutCache = {};
        if (this._layoutCache[path] != null) {
            var i = this._layoutCache[path];
            var layout = i["Layer"];
            completion.call(target, layout);
        }
        else {
            var url = MIOCoreStringAppendPathComponent(this.baseURL, path);
            var item = { "Key": path, "Path": MIOCoreStringDeletingLastPathComponent(path), "URL": url, "LayerID": layerID, "Target": target, "Completion": completion };
            this._layoutQueue.push(item);
            this.checkQueue();
        }
    };
    MIOCoreBundle.prototype.checkQueue = function () {
        if (this._isDownloadingResource == true)
            return;
        if (this._layoutQueue.length == 0)
            return;
        this._isDownloadingResource = true;
        var item = this._layoutQueue[0];
        console.log("Download resource: " + item["URL"]);
        var msg = { "CMD": "DownloadHTML", "URL": item["URL"], "Path": item["Path"], "LayerID": item["LayerID"] };
        this._layoutWorker.postMessage(msg);
    };
    MIOCoreBundle.prototype.layerDidDownload = function (layer) {
        var item = this._layoutQueue[0];
        console.log("Downloaded resource: " + item["URL"]);
        this._isDownloadingResource = false;
        item["Layer"] = layer;
        var key = item["Key"];
        this._layoutCache[key] = item;
        this._checkDownloadCount();
    };
    MIOCoreBundle.prototype._checkDownloadCount = function () {
        if (this._isDownloadingResource == true)
            return;
        if (this._loadingCSSCount > 0)
            return;
        var item = this._layoutQueue[0];
        this._layoutQueue.splice(0, 1);
        var target = item["Target"];
        var completion = item["Completion"];
        var layer = item["Layer"];
        completion.call(target, layer);
        delete item["Target"];
        delete item["Completion"];
        this.checkQueue();
    };
    return MIOCoreBundle;
}());
var MIOCoreDebugOption;
(function (MIOCoreDebugOption) {
    MIOCoreDebugOption[MIOCoreDebugOption["Phone"] = 0] = "Phone";
    MIOCoreDebugOption[MIOCoreDebugOption["Pad"] = 1] = "Pad";
    MIOCoreDebugOption[MIOCoreDebugOption["Mobile"] = 2] = "Mobile";
    MIOCoreDebugOption[MIOCoreDebugOption["Desktop"] = 3] = "Desktop";
})(MIOCoreDebugOption || (MIOCoreDebugOption = {}));
var _MIOCoreDebugOptions = {};
function MIOCoreSetDebugOption(option, value) {
    _MIOCoreDebugOptions[option] = value;
    switch (option) {
        case MIOCoreDebugOption.Phone:
        case MIOCoreDebugOption.Pad:
            _MIOCoreDebugOptions[MIOCoreDebugOption.Mobile] = value;
            break;
    }
}
var MIOCoreAppType;
(function (MIOCoreAppType) {
    MIOCoreAppType[MIOCoreAppType["Web"] = 0] = "Web";
    MIOCoreAppType[MIOCoreAppType["iOS"] = 1] = "iOS";
    MIOCoreAppType[MIOCoreAppType["macOS"] = 2] = "macOS";
    MIOCoreAppType[MIOCoreAppType["Android"] = 3] = "Android";
    MIOCoreAppType[MIOCoreAppType["WindowsMobile"] = 4] = "WindowsMobile";
    MIOCoreAppType[MIOCoreAppType["Windows"] = 5] = "Windows";
    MIOCoreAppType[MIOCoreAppType["Linux"] = 6] = "Linux";
})(MIOCoreAppType || (MIOCoreAppType = {}));
var _miocore_app_type;
function MIOCoreSetAppType(appType) {
    _miocore_app_type = appType;
}
function MIOCoreGetAppType() {
    return _miocore_app_type;
}
function MIOClassFromString(className) {
    var object = null;
    try {
        object = Object.create(window[className].prototype);
        object.constructor.apply(object);
        object.className = className;
    }
    catch (e) {
        throw 'Error, class (' + className + ') not found.';
    }
    return object;
}
function MIOCoreCreateMD5(s) { function L(k, d) { return (k << d) | (k >>> (32 - d)); } function K(G, k) { var I, d, F, H, x; F = (G & 2147483648); H = (k & 2147483648); I = (G & 1073741824); d = (k & 1073741824); x = (G & 1073741823) + (k & 1073741823); if (I & d) {
    return (x ^ 2147483648 ^ F ^ H);
} if (I | d) {
    if (x & 1073741824) {
        return (x ^ 3221225472 ^ F ^ H);
    }
    else {
        return (x ^ 1073741824 ^ F ^ H);
    }
}
else {
    return (x ^ F ^ H);
} } function r(d, F, k) { return (d & F) | ((~d) & k); } function q(d, F, k) { return (d & k) | (F & (~k)); } function p(d, F, k) { return (d ^ F ^ k); } function n(d, F, k) { return (F ^ (d | (~k))); } function u(G, F, aa, Z, k, H, I) { G = K(G, K(K(r(F, aa, Z), k), I)); return K(L(G, H), F); } function f(G, F, aa, Z, k, H, I) { G = K(G, K(K(q(F, aa, Z), k), I)); return K(L(G, H), F); } function D(G, F, aa, Z, k, H, I) { G = K(G, K(K(p(F, aa, Z), k), I)); return K(L(G, H), F); } function t(G, F, aa, Z, k, H, I) { G = K(G, K(K(n(F, aa, Z), k), I)); return K(L(G, H), F); } function e(G) { var Z; var F = G.length; var x = F + 8; var k = (x - (x % 64)) / 64; var I = (k + 1) * 16; var aa = Array(I - 1); var d = 0; var H = 0; while (H < F) {
    Z = (H - (H % 4)) / 4;
    d = (H % 4) * 8;
    aa[Z] = (aa[Z] | (G.charCodeAt(H) << d));
    H++;
} Z = (H - (H % 4)) / 4; d = (H % 4) * 8; aa[Z] = aa[Z] | (128 << d); aa[I - 2] = F << 3; aa[I - 1] = F >>> 29; return aa; } function B(x) { var k = "", F = "", G, d; for (d = 0; d <= 3; d++) {
    G = (x >>> (d * 8)) & 255;
    F = "0" + G.toString(16);
    k = k + F.substr(F.length - 2, 2);
} return k; } function J(k) { k = k.replace(/rn/g, "n"); var d = ""; for (var F = 0; F < k.length; F++) {
    var x = k.charCodeAt(F);
    if (x < 128) {
        d += String.fromCharCode(x);
    }
    else {
        if ((x > 127) && (x < 2048)) {
            d += String.fromCharCode((x >> 6) | 192);
            d += String.fromCharCode((x & 63) | 128);
        }
        else {
            d += String.fromCharCode((x >> 12) | 224);
            d += String.fromCharCode(((x >> 6) & 63) | 128);
            d += String.fromCharCode((x & 63) | 128);
        }
    }
} return d; } var C = Array(); var P, h, E, v, g, Y, X, W, V; var S = 7, Q = 12, N = 17, M = 22; var A = 5, z = 9, y = 14, w = 20; var o = 4, m = 11, l = 16, j = 23; var U = 6, T = 10, R = 15, O = 21; s = J(s); C = e(s); Y = 1732584193; X = 4023233417; W = 2562383102; V = 271733878; for (P = 0; P < C.length; P += 16) {
    h = Y;
    E = X;
    v = W;
    g = V;
    Y = u(Y, X, W, V, C[P + 0], S, 3614090360);
    V = u(V, Y, X, W, C[P + 1], Q, 3905402710);
    W = u(W, V, Y, X, C[P + 2], N, 606105819);
    X = u(X, W, V, Y, C[P + 3], M, 3250441966);
    Y = u(Y, X, W, V, C[P + 4], S, 4118548399);
    V = u(V, Y, X, W, C[P + 5], Q, 1200080426);
    W = u(W, V, Y, X, C[P + 6], N, 2821735955);
    X = u(X, W, V, Y, C[P + 7], M, 4249261313);
    Y = u(Y, X, W, V, C[P + 8], S, 1770035416);
    V = u(V, Y, X, W, C[P + 9], Q, 2336552879);
    W = u(W, V, Y, X, C[P + 10], N, 4294925233);
    X = u(X, W, V, Y, C[P + 11], M, 2304563134);
    Y = u(Y, X, W, V, C[P + 12], S, 1804603682);
    V = u(V, Y, X, W, C[P + 13], Q, 4254626195);
    W = u(W, V, Y, X, C[P + 14], N, 2792965006);
    X = u(X, W, V, Y, C[P + 15], M, 1236535329);
    Y = f(Y, X, W, V, C[P + 1], A, 4129170786);
    V = f(V, Y, X, W, C[P + 6], z, 3225465664);
    W = f(W, V, Y, X, C[P + 11], y, 643717713);
    X = f(X, W, V, Y, C[P + 0], w, 3921069994);
    Y = f(Y, X, W, V, C[P + 5], A, 3593408605);
    V = f(V, Y, X, W, C[P + 10], z, 38016083);
    W = f(W, V, Y, X, C[P + 15], y, 3634488961);
    X = f(X, W, V, Y, C[P + 4], w, 3889429448);
    Y = f(Y, X, W, V, C[P + 9], A, 568446438);
    V = f(V, Y, X, W, C[P + 14], z, 3275163606);
    W = f(W, V, Y, X, C[P + 3], y, 4107603335);
    X = f(X, W, V, Y, C[P + 8], w, 1163531501);
    Y = f(Y, X, W, V, C[P + 13], A, 2850285829);
    V = f(V, Y, X, W, C[P + 2], z, 4243563512);
    W = f(W, V, Y, X, C[P + 7], y, 1735328473);
    X = f(X, W, V, Y, C[P + 12], w, 2368359562);
    Y = D(Y, X, W, V, C[P + 5], o, 4294588738);
    V = D(V, Y, X, W, C[P + 8], m, 2272392833);
    W = D(W, V, Y, X, C[P + 11], l, 1839030562);
    X = D(X, W, V, Y, C[P + 14], j, 4259657740);
    Y = D(Y, X, W, V, C[P + 1], o, 2763975236);
    V = D(V, Y, X, W, C[P + 4], m, 1272893353);
    W = D(W, V, Y, X, C[P + 7], l, 4139469664);
    X = D(X, W, V, Y, C[P + 10], j, 3200236656);
    Y = D(Y, X, W, V, C[P + 13], o, 681279174);
    V = D(V, Y, X, W, C[P + 0], m, 3936430074);
    W = D(W, V, Y, X, C[P + 3], l, 3572445317);
    X = D(X, W, V, Y, C[P + 6], j, 76029189);
    Y = D(Y, X, W, V, C[P + 9], o, 3654602809);
    V = D(V, Y, X, W, C[P + 12], m, 3873151461);
    W = D(W, V, Y, X, C[P + 15], l, 530742520);
    X = D(X, W, V, Y, C[P + 2], j, 3299628645);
    Y = t(Y, X, W, V, C[P + 0], U, 4096336452);
    V = t(V, Y, X, W, C[P + 7], T, 1126891415);
    W = t(W, V, Y, X, C[P + 14], R, 2878612391);
    X = t(X, W, V, Y, C[P + 5], O, 4237533241);
    Y = t(Y, X, W, V, C[P + 12], U, 1700485571);
    V = t(V, Y, X, W, C[P + 3], T, 2399980690);
    W = t(W, V, Y, X, C[P + 10], R, 4293915773);
    X = t(X, W, V, Y, C[P + 1], O, 2240044497);
    Y = t(Y, X, W, V, C[P + 8], U, 1873313359);
    V = t(V, Y, X, W, C[P + 15], T, 4264355552);
    W = t(W, V, Y, X, C[P + 6], R, 2734768916);
    X = t(X, W, V, Y, C[P + 13], O, 1309151649);
    Y = t(Y, X, W, V, C[P + 4], U, 4149444226);
    V = t(V, Y, X, W, C[P + 11], T, 3174756917);
    W = t(W, V, Y, X, C[P + 2], R, 718787259);
    X = t(X, W, V, Y, C[P + 9], O, 3951481745);
    Y = K(Y, h);
    X = K(X, E);
    W = K(W, v);
    V = K(V, g);
} var i = B(Y) + B(X) + B(W) + B(V); return i.toLowerCase(); }
;
var _miocore_languages = null;
function MIOCoreAddLanguage(lang, url) {
    if (_miocore_languages == null)
        _miocore_languages = {};
    _miocore_languages[lang] = url;
}
function MIOCoreGetLanguages() {
    return _miocore_languages;
}
var MIOCoreEventKeyCode;
(function (MIOCoreEventKeyCode) {
    MIOCoreEventKeyCode[MIOCoreEventKeyCode["Enter"] = 13] = "Enter";
    MIOCoreEventKeyCode[MIOCoreEventKeyCode["Escape"] = 27] = "Escape";
    MIOCoreEventKeyCode[MIOCoreEventKeyCode["ArrowLeft"] = 37] = "ArrowLeft";
    MIOCoreEventKeyCode[MIOCoreEventKeyCode["ArrowUp"] = 38] = "ArrowUp";
    MIOCoreEventKeyCode[MIOCoreEventKeyCode["ArrowRight"] = 39] = "ArrowRight";
    MIOCoreEventKeyCode[MIOCoreEventKeyCode["ArrowDown"] = 40] = "ArrowDown";
})(MIOCoreEventKeyCode || (MIOCoreEventKeyCode = {}));
var MIOCoreEventType;
(function (MIOCoreEventType) {
    MIOCoreEventType[MIOCoreEventType["KeyUp"] = 0] = "KeyUp";
    MIOCoreEventType[MIOCoreEventType["KeyDown"] = 1] = "KeyDown";
    MIOCoreEventType[MIOCoreEventType["MouseUp"] = 2] = "MouseUp";
    MIOCoreEventType[MIOCoreEventType["MouseDown"] = 3] = "MouseDown";
    MIOCoreEventType[MIOCoreEventType["TouchStart"] = 4] = "TouchStart";
    MIOCoreEventType[MIOCoreEventType["TouchEnd"] = 5] = "TouchEnd";
    MIOCoreEventType[MIOCoreEventType["Click"] = 6] = "Click";
    MIOCoreEventType[MIOCoreEventType["Resize"] = 7] = "Resize";
})(MIOCoreEventType || (MIOCoreEventType = {}));
var MIOCoreEvent = (function () {
    function MIOCoreEvent() {
        this.eventType = null;
        this.target = null;
        this.completion = null;
    }
    MIOCoreEvent.prototype.initWithType = function (eventType, coreEvent) {
        this.coreEvent = coreEvent;
        this.eventType = eventType;
    };
    MIOCoreEvent.prototype.cancel = function () {
        this.coreEvent.preventDefault();
    };
    return MIOCoreEvent;
}());
var MIOCoreKeyEvent = (function (_super) {
    __extends(MIOCoreKeyEvent, _super);
    function MIOCoreKeyEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.keyCode = null;
        return _this;
    }
    MIOCoreKeyEvent.prototype.initWithKeyCode = function (eventType, eventKeyCode, event) {
        _super.prototype.initWithType.call(this, eventType, event);
        this.keyCode = eventKeyCode;
    };
    return MIOCoreKeyEvent;
}(MIOCoreEvent));
var MIOCoreEventInput = (function (_super) {
    __extends(MIOCoreEventInput, _super);
    function MIOCoreEventInput() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.target = null;
        _this.x = 0;
        _this.y = 0;
        _this.deltaX = 0;
        _this.deltaY = 0;
        return _this;
    }
    return MIOCoreEventInput;
}(MIOCoreEvent));
var MIOCoreEventMouseButtonType;
(function (MIOCoreEventMouseButtonType) {
    MIOCoreEventMouseButtonType[MIOCoreEventMouseButtonType["None"] = 0] = "None";
    MIOCoreEventMouseButtonType[MIOCoreEventMouseButtonType["Left"] = 1] = "Left";
    MIOCoreEventMouseButtonType[MIOCoreEventMouseButtonType["Right"] = 2] = "Right";
    MIOCoreEventMouseButtonType[MIOCoreEventMouseButtonType["Middle"] = 3] = "Middle";
})(MIOCoreEventMouseButtonType || (MIOCoreEventMouseButtonType = {}));
var MIOCoreEventMouse = (function (_super) {
    __extends(MIOCoreEventMouse, _super);
    function MIOCoreEventMouse() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.button = MIOCoreEventMouseButtonType.None;
        return _this;
    }
    MIOCoreEventMouse.prototype.initWithType = function (eventType, coreEvent) {
        _super.prototype.initWithType.call(this, eventType, event);
        this.button = MIOCoreEventMouseButtonType.Left;
        this.target = coreEvent.target;
        this.x = coreEvent.clientX;
        this.y = coreEvent.clientY;
    };
    return MIOCoreEventMouse;
}(MIOCoreEventInput));
var MIOCoreEventTouch = (function (_super) {
    __extends(MIOCoreEventTouch, _super);
    function MIOCoreEventTouch() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOCoreEventTouch.prototype.initWithType = function (eventType, coreEvent) {
        var touch = coreEvent.changedTouches[0];
        this.target = coreEvent.target;
        this.x = touch.clientX;
        this.y = touch.clientY;
    };
    return MIOCoreEventTouch;
}(MIOCoreEventInput));
var MIOCoreLexerTokenType;
(function (MIOCoreLexerTokenType) {
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["Identifier"] = 0] = "Identifier";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["UUIDValue"] = 1] = "UUIDValue";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["StringValue"] = 2] = "StringValue";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["NumberValue"] = 3] = "NumberValue";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["BooleanValue"] = 4] = "BooleanValue";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["NullValue"] = 5] = "NullValue";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["PropertyValue"] = 6] = "PropertyValue";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["MinorOrEqualComparator"] = 7] = "MinorOrEqualComparator";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["MinorComparator"] = 8] = "MinorComparator";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["MajorOrEqualComparator"] = 9] = "MajorOrEqualComparator";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["MajorComparator"] = 10] = "MajorComparator";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["EqualComparator"] = 11] = "EqualComparator";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["DistinctComparator"] = 12] = "DistinctComparator";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["ContainsComparator"] = 13] = "ContainsComparator";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["NotContainsComparator"] = 14] = "NotContainsComparator";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["InComparator"] = 15] = "InComparator";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["NotIntComparator"] = 16] = "NotIntComparator";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["OpenParenthesisSymbol"] = 17] = "OpenParenthesisSymbol";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["CloseParenthesisSymbol"] = 18] = "CloseParenthesisSymbol";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["Whitespace"] = 19] = "Whitespace";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["AND"] = 20] = "AND";
    MIOCoreLexerTokenType[MIOCoreLexerTokenType["OR"] = 21] = "OR";
})(MIOCoreLexerTokenType || (MIOCoreLexerTokenType = {}));
var MIOCoreLexer = (function () {
    function MIOCoreLexer(string) {
        this.input = null;
        this.tokenTypes = [];
        this.tokens = null;
        this.tokenIndex = -1;
        this.ignoreTokenTypes = [];
        this.input = string;
    }
    MIOCoreLexer.prototype.addTokenType = function (type, regex) {
        this.tokenTypes.push({ "regex": regex, "type": type });
    };
    MIOCoreLexer.prototype.ignoreTokenType = function (type) {
        this.ignoreTokenTypes.push(type);
    };
    MIOCoreLexer.prototype.tokenize = function () {
        this.tokens = this._tokenize();
        this.tokenIndex = 0;
    };
    MIOCoreLexer.prototype._tokenize = function () {
        var tokens = [];
        var foundToken = false;
        var match;
        var i;
        var numTokenTypes = this.tokenTypes.length;
        do {
            foundToken = false;
            for (i = 0; i < numTokenTypes; i++) {
                var regex = this.tokenTypes[i].regex;
                var type = this.tokenTypes[i].type;
                match = regex.exec(this.input);
                if (match) {
                    if (this.ignoreTokenTypes.indexOf(type) == -1) {
                        tokens.push({ type: type, value: match[0] });
                    }
                    this.input = this.input.substring(match[0].length);
                    foundToken = true;
                    break;
                }
            }
            if (foundToken == false) {
                throw ("MIOCoreLexer: Token doesn't match any pattern. (" + this.input + ")");
            }
        } while (this.input.length > 0);
        return tokens;
    };
    MIOCoreLexer.prototype.nextToken = function () {
        if (this.tokenIndex >= this.tokens.length) {
            return null;
        }
        var token = this.tokens[this.tokenIndex];
        this.tokenIndex++;
        var index = this.ignoreTokenTypes.indexOf(token.type);
        return index == -1 ? token : this.nextToken();
    };
    MIOCoreLexer.prototype.prevToken = function () {
        this.tokenIndex--;
        if (this.tokenIndex < 0) {
            return null;
        }
        var token = this.tokens[this.tokenIndex];
        var index = this.ignoreTokenTypes.indexOf(token.type);
        return index == -1 ? token : this.prevToken();
    };
    return MIOCoreLexer;
}());
//# sourceMappingURL=index.js.map