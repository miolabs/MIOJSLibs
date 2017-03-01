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
/**
 * Created by godshadow on 26/3/16.
 */
var MIOObject = (function () {
    function MIOObject() {
        this.keyPaths = {};
    }
    MIOObject.prototype.init = function () { };
    MIOObject.prototype.willChangeValue = function (key) {
        var obs = this.keyPaths[key];
        if (obs != null) {
            for (var count = 0; count < obs.length; count++) {
                var o = obs[count];
                if (typeof o.observeValueForKeyPath === "function")
                    o.observeValueForKeyPath(key, "will", this);
            }
        }
    };
    MIOObject.prototype.didChangeValue = function (key) {
        var obs = this.keyPaths[key];
        if (obs != null) {
            for (var count = 0; count < obs.length; count++) {
                var o = obs[count];
                if (typeof o.observeValueForKeyPath === "function")
                    o.observeValueForKeyPath(key, "did", this);
            }
        }
    };
    MIOObject.prototype.addObserver = function (obs, keypath) {
        var observers = this.keyPaths[keypath];
        if (observers == null) {
            observers = [];
            this.keyPaths[keypath] = observers;
        }
        observers.push(obs);
    };
    MIOObject.prototype.removeObserver = function (obs, keypath) {
        var observers = this.keyPaths[keypath];
        if (observers == null)
            return;
        var index = observers.indexOf(obs);
        observers.splice(index, 1);
    };
    return MIOObject;
}());
/**
 * Created by godshadow on 29/09/2016.
 */
/// <reference path="MIOObject.ts" />
var MIOUserDefaults = (function () {
    function MIOUserDefaults() {
        if (MIOUserDefaults._sharedInstance) {
            throw new Error("Error: Instantiation failed: Use standardUserDefaults() instead of new.");
        }
        MIOUserDefaults._sharedInstance = this;
    }
    MIOUserDefaults.standardUserDefaults = function () {
        return MIOUserDefaults._sharedInstance;
    };
    MIOUserDefaults.prototype.setBooleanForKey = function (key, value) {
        var v = value ? "1" : "0";
        this.setValueForKey(key, v);
    };
    MIOUserDefaults.prototype.booleanForKey = function (key) {
        var v = this.valueForKey(key);
        return v == "1" ? true : false;
    };
    MIOUserDefaults.prototype.setValueForKey = function (key, value) {
        localStorage.setItem(key, value);
    };
    MIOUserDefaults.prototype.valueForKey = function (key) {
        return localStorage.getItem(key);
    };
    MIOUserDefaults.prototype.removeValueForKey = function (key) {
        localStorage.removeItem(key);
    };
    return MIOUserDefaults;
}());
MIOUserDefaults._sharedInstance = new MIOUserDefaults();
/**
 * Created by godshadow on 11/3/16.
 */
function MIOCCoreLoadTextFile(href) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", href, false);
    xmlhttp.send();
    var response = xmlhttp.responseText;
    return response;
}
function MIOCoreLoadScript(url) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    //    script.onreadystatechange = callback;
    //    script.onload = callback;
    // Fire the loading
    head.appendChild(script);
}
// ignore app.css beause it's already downloaded
// TODO: Check the last item only not the full path, could be different
var _stylesCache = { "layout/../app.css": true };
function MIOCoreLoadStyle(url) {
    // Prevent loading the same css files
    if (_stylesCache[url] != null)
        return;
    _stylesCache[url] = true;
    var ss = document.createElement("link");
    ss.type = "text/css";
    ss.rel = "stylesheet";
    ss.href = url;
    document.getElementsByTagName("head")[0].appendChild(ss);
}
function MIOGetDefaultLanguage() {
    var string = window.location.search;
    console.log(string);
}
;
function MIOClassFromString(className) {
    //instance creation here
    var object = Object.create(window[className].prototype);
    object.constructor.apply(object);
    return object;
}
// MD5 implementacion from
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
/**
 * Created by godshadow on 21/3/16.
 */
/// <reference path="MIOCore.ts" />
var _MIOLocalizedStrings = null;
function MIOLocalizeString(key, defaultValue) {
    var strings = _MIOLocalizedStrings;
    if (strings == null)
        return defaultValue;
    var value = strings[key];
    if (value == null)
        return defaultValue;
    return value;
}
// interface String {
//     endsWith(searchString: string, endPosition?: number): boolean;
// }
/*
if ( typeof String.prototype.startsWith != 'function' ) {
    String.prototype.startsWith = function( str ) {
        return str.length > 0 && this.substring( 0, str.length ) === str;
    }
};

if ( typeof String.prototype.endsWith != 'function' ) {
    String.prototype.endsWith = function( str ) {
        return str.length > 0 && this.substring( this.length - str.length, this.length ) === str;
    }
};
*/
// String.prototype.startsWith = function( str ) {
//    return this.substring( 0, str.length ) === str;
//}
// String.prototype.endsWith = function(suffix) {
//     return this.indexOf(suffix, this.length - suffix.length) !== -1;
// };
function MIOStringHasPreffix(str, preffix) {
    return str.substring(0, preffix.length) === preffix;
}
function MIOStringHasSuffix(str, suffix) {
    return str.match(suffix + "$") == suffix;
}
/**
 * Created by godshadow on 11/3/16.
 */
function MIODateGetStringForMonth(month) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Dicember"];
    return months[month];
}
function MIODateGetStringForDay(day) {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[day];
}
function MIODateGetString(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = date.getDate().toString();
    return yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]); // padding
}
function MIODateGetStringForHour(date) {
    var hh = date.getHours().toString();
    var mm = date.getMinutes().toString();
    return (hh[1] ? hh : "0" + hh[0]) + ":" + (mm[1] ? mm : "0" + mm[0]);
}
function MIODateGetUTCString(date) {
    var d = MIODateGetUTCStringForDate(date);
    var t = MIODateGetUTCStringForHour(date);
    return d + " " + t;
}
function MIODateGetUTCStringForDate(date) {
    var yyyy = date.getUTCFullYear().toString();
    var mm = (date.getUTCMonth() + 1).toString(); // getMonth() is zero-based
    var dd = date.getUTCDate().toString();
    return yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]); // padding
}
function MIODateGetUTCStringForHour(date) {
    var hh = date.getUTCHours().toString();
    var mm = date.getUTCMinutes().toString();
    return (hh[1] ? hh : "0" + hh[0]) + ":" + (mm[1] ? mm : "0" + mm[0]);
}
function MIODateFromString(string) {
    var d = new Date(Date.parse(string));
    return d;
}
function MIODateAddDaysToDateString(dateString, days) {
    var d = MIODateFromString(dateString);
    d.setDate(d.getDate() + parseInt(days));
    var ds = MIODateGetString(d);
    return ds;
}
/**
 * Created by godshadow on 15/3/16.
 */
var MIOUUID = (function () {
    function MIOUUID() {
    }
    MIOUUID.uuid = function () {
        var d = new Date().getTime();
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
        var uuid = s.join("");
        return uuid;
    };
    return MIOUUID;
}());
/**
 * Created by godshadow on 11/3/16.
 */
var MIONotification = (function () {
    function MIONotification(name, object, userInfo) {
        this.name = null;
        this.object = null;
        this.userInfo = null;
        this.name = name;
        this.object = object;
        this.userInfo = userInfo;
    }
    return MIONotification;
}());
var MIONotificationCenter = (function () {
    function MIONotificationCenter() {
        this.notificationNames = {};
        if (MIONotificationCenter._sharedInstance) {
            throw new Error("Error: Instantiation failed: Use defaultCenter() instead of new.");
        }
        MIONotificationCenter._sharedInstance = this;
    }
    MIONotificationCenter.defaultCenter = function () {
        return MIONotificationCenter._sharedInstance;
    };
    MIONotificationCenter.prototype.addObserver = function (obs, name, fn) {
        var notes = this.notificationNames[name];
        if (notes == null) {
            notes = [];
        }
        var item = { "observer": obs, "function": fn };
        notes.push(item);
        this.notificationNames[name] = notes;
    };
    ;
    MIONotificationCenter.prototype.removeObserver = function (obs, name) {
        var notes = this.notificationNames[name];
        if (notes == null)
            return;
        var index = -1;
        for (var count = 0; count < notes.length; count++) {
            var item = notes[count];
            var obsAux = item["observer"];
            if (obsAux === obs) {
                index = count;
                break;
            }
        }
        if (index > -1) {
            notes.splice(index, 1);
        }
    };
    MIONotificationCenter.prototype.postNotification = function (name, object, userInfo) {
        var notes = this.notificationNames[name];
        if (notes == null)
            return;
        var n = new MIONotification(name, object, userInfo);
        for (var count = 0; count < notes.length; count++) {
            var item = notes[count];
            var obs = item["observer"];
            var fn = item["function"];
            fn.call(obs, n);
        }
    };
    return MIONotificationCenter;
}());
MIONotificationCenter._sharedInstance = new MIONotificationCenter();
/**
 * Created by godshadow on 14/3/16.
 */
var MIOURLRequest = (function () {
    function MIOURLRequest(url) {
        this.url = null;
        this.httpMethod = "GET";
        this.body = null;
        this.headers = [];
        this.url = url;
    }
    MIOURLRequest.prototype.setHeaderField = function (field, value) {
        this.headers.push({ "Field": field, "Value": value });
    };
    return MIOURLRequest;
}());
var MIOURLConnection = (function () {
    function MIOURLConnection() {
        this.request = null;
        this.delegate = null;
        this.blockFN = null;
        this.blockTarget = null;
        this.xmlHttpRequest = null;
    }
    MIOURLConnection.prototype.initWithRequest = function (request, delegate) {
        this.request = request;
        this.delegate = delegate;
        this.start();
    };
    MIOURLConnection.prototype.initWithRequestBlock = function (request, blockTarget, blockFN) {
        this.request = request;
        this.blockFN = blockFN;
        this.blockTarget = blockTarget;
        this.start();
    };
    MIOURLConnection.prototype.start = function () {
        this.xmlHttpRequest = new XMLHttpRequest();
        var instance = this;
        this.xmlHttpRequest.onload = function () {
            if (this.status >= 200 && this.status <= 300) {
                // success!
                if (instance.delegate != null)
                    instance.delegate.connectionDidReceiveData(instance, this.responseText);
                else if (instance.blockFN != null)
                    instance.blockFN.call(instance.blockTarget, this.status, this.responseText);
            }
            else {
                // something went wrong
                if (instance.delegate != null)
                    instance.delegate.connectionDidFail(instance);
                else if (instance.blockFN != null)
                    instance.blockFN.call(instance.blockTarget, this.status, null);
            }
        };
        this.xmlHttpRequest.open(this.request.httpMethod, this.request.url);
        // Add headers
        for (var count = 0; count < this.request.headers.length; count++) {
            var item = this.request.headers[count];
            this.xmlHttpRequest.setRequestHeader(item["Field"], item["Value"]);
        }
        if (this.request.httpMethod == "GET" || this.request.body == null)
            this.xmlHttpRequest.send();
        else
            this.xmlHttpRequest.send(this.request.body);
    };
    return MIOURLConnection;
}());
/**
 * Created by godshadow on 12/08/16.
 */
var MIOPoint = (function () {
    function MIOPoint(x, y) {
        this.x = 0;
        this.y = 0;
        this.x = x;
        this.y = y;
    }
    MIOPoint.Zero = function () {
        var p = new MIOPoint(0, 0);
        return p;
    };
    return MIOPoint;
}());
var MIOSize = (function () {
    function MIOSize(w, h) {
        this.width = 0;
        this.height = 0;
        this.width = w;
        this.height = h;
    }
    MIOSize.Zero = function () {
        var s = new MIOSize(0, 0);
        return s;
    };
    MIOSize.Inherit = function () {
        var s = new MIOSize(-1, -1);
        return s;
    };
    MIOSize.prototype.isEqualTo = function (size) {
        if (this.width == size.width
            && this.height == size.height)
            return true;
        return false;
    };
    return MIOSize;
}());
var MIOFrame = (function () {
    function MIOFrame(p, s) {
        this.origin = null;
        this.size = null;
        this.origin = p;
        this.size = s;
    }
    MIOFrame.Zero = function () {
        var f = new MIOFrame(MIOPoint.Zero(), MIOSize.Zero());
        return f;
    };
    MIOFrame.frameWithRect = function (x, y, w, h) {
        var p = new MIOPoint(x, y);
        var s = new MIOSize(w, h);
        var f = new MIOFrame(p, s);
        return f;
    };
    return MIOFrame;
}());
/**
 * Created by godshadow on 11/3/16.
 */
/// <reference path="MIOCore.ts" />
/// <reference path="MIOString.ts" />
/// <reference path="MIOCoreTypes.ts" />
/// <reference path="MIOObject.ts" />
var _MIOViewNextLayerID = 0;
function MIOViewGetNextLayerID(prefix) {
    var layerID = null;
    if (prefix == null) {
        _MIOViewNextLayerID++;
        layerID = _MIOViewNextLayerID;
    }
    else {
        layerID = prefix + "_" + _MIOViewNextLayerID;
    }
    return layerID;
}
function MIOLayerSearchElementByID(layer, elementID) {
    if (layer.tagName != "DIV" && layer.tagName != "INPUT")
        return null;
    if (layer.getAttribute("id") == elementID)
        return layer;
    var elementFound = null;
    for (var count = 0; count < layer.childNodes.length; count++) {
        var l = layer.childNodes[count];
        elementFound = MIOLayerSearchElementByID(l, elementID);
        if (elementFound != null)
            return elementFound;
    }
    return null;
}
function MIOLayerGetFirstElementWithTag(layer, tag) {
    var foundLayer = null;
    if (layer.childNodes.length > 0) {
        var index = 0;
        var foundLayer = layer.childNodes[index];
        while (foundLayer.tagName != tag) {
            index++;
            if (index >= layer.childNodes.length) {
                foundLayer = null;
                break;
            }
            foundLayer = layer.childNodes[index];
        }
    }
    return foundLayer;
}
function MIOLayerFromResource(url, css, elementID) {
    var htmlString = MIOCCoreLoadTextFile(url);
    var parser = new DOMParser();
    var html = parser.parseFromString(htmlString, "text/html");
    //var styles = html.styleSheets;
    //if (css != null)
    //MIOCoreLoadStyle(css);
    return (html.getElementById(elementID));
}
var MIOView = (function (_super) {
    __extends(MIOView, _super);
    function MIOView(layerID) {
        var _this = _super.call(this) || this;
        _this.layerID = null;
        _this.layer = null;
        _this.layerOptions = null;
        _this.subviews = [];
        _this.hidden = false;
        _this.alpha = 1;
        _this.parent = null;
        _this.tag = null;
        _this._needDisplay = false;
        _this._isLayerInDOM = false;
        if (layerID != null)
            _this.layerID = layerID;
        else
            _this.layerID = MIOViewGetNextLayerID();
        return _this;
    }
    MIOView.prototype.init = function () {
        this.layer = document.createElement("div");
        this.layer.setAttribute("id", this.layerID);
        this.layer.style.position = "absolute";
        this.layer.style.top = "0px";
        this.layer.style.left = "0px";
        this.layer.style.width = "100%";
        this.layer.style.height = "100%";
        this.layer.style.background = "rgb(255, 255, 255)";
    };
    MIOView.prototype.initWithFrame = function (frame) {
        this.layer = document.createElement("div");
        this.layer.setAttribute("id", this.layerID);
        this.layer.style.position = "absolute";
        this.layer.style.left = frame.origin.x + "px";
        this.layer.style.top = frame.origin.y + "px";
        this.layer.style.width = frame.size.width + "px";
        this.layer.style.height = frame.size.height + "px";
    };
    MIOView.prototype.initWithLayer = function (layer, options) {
        this.layer = layer;
        this.layerOptions = options;
        this._checkDOMLayer();
    };
    MIOView.prototype.awakeFromHTML = function () {
    };
    MIOView.prototype.setParent = function (view) {
        this.willChangeValue("parent");
        this.parent = view;
        this.didChangeValue("parent");
    };
    MIOView.prototype.addSubLayer = function (layer) {
        this.layer.innerHTML = layer.innerHTML;
    };
    MIOView.prototype.addSubview = function (view) {
        view.setParent(this);
        this.subviews.push(view);
        view._checkDOMLayer();
    };
    MIOView.prototype._checkDOMLayer = function () {
        if (this._isLayerInDOM == true)
            return;
        if (this.layer == null || this.parent == null)
            return;
        this.parent.layer.appendChild(this.layer);
        this._isLayerInDOM = true;
    };
    MIOView.prototype.removeFromSuperview = function () {
        this.parent._removeView(this);
        this._isLayerInDOM = false;
    };
    MIOView.prototype._removeLayerFromDOM = function () {
        if (this._isLayerInDOM == false)
            return;
        this.layer.removeChild(this.layer);
        this._isLayerInDOM = false;
    };
    MIOView.prototype._linkViewToSubview = function (view) {
        this.subviews.push(view);
    };
    MIOView.prototype._removeView = function (view) {
        var index = this.subviews.indexOf(view);
        this.subviews.splice(index, 1);
        this.layer.removeChild(view.layer);
    };
    MIOView.prototype._removeAllSubviews = function () {
        var node = this.layer;
        while (this.layer.hasChildNodes()) {
            if (node.hasChildNodes()) {
                node = node.lastChild; // set current node to child
            }
            else {
                node = node.parentNode; // set node to parent
                node.removeChild(node.lastChild); // remove last node
            }
        }
    };
    MIOView.prototype.layout = function () {
        if (this.hidden == true)
            return;
        for (var index = 0; index < this.subviews.length; index++) {
            var v = this.subviews[index];
            if (!(v instanceof MIOView)) {
                console.log("ERROR Laying out not a view");
            }
            else
                v.layout();
        }
    };
    MIOView.prototype.layerWithItemID = function (itemID) {
        return MIOLayerSearchElementByID(this.layer, itemID);
    };
    MIOView.prototype.setHidden = function (hidden) {
        this.hidden = hidden;
        if (this.layer == null)
            return;
        if (hidden)
            this.layer.style.display = "none";
        else
            this.layer.style.display = "inline";
    };
    MIOView.prototype.setBackgroundColor = function (color) {
        this.layer.style.backgroundColor = "#" + color;
    };
    MIOView.prototype.setBackgroundRGBColor = function (r, g, b, a) {
        if (a == null) {
            var value = "rgb(" + r + ", " + g + ", " + b + ")";
            this.layer.style.backgroundColor = value;
        }
        else {
            var value = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
            this.layer.style.backgroundColor = value;
        }
    };
    MIOView.prototype.getBackgroundColor = function () {
        var cs = document.defaultView.getComputedStyle(this.layer, null);
        var bg = cs.getPropertyValue('background-color');
        return bg;
    };
    MIOView.prototype.setAlpha = function (alpha, animate, duration) {
        if (animate == true || duration > 0) {
            this.layer.style.transition = "opacity " + duration + "s";
        }
        this.alpha = alpha;
        this.layer.style.opacity = alpha;
    };
    MIOView.prototype.setX = function (x, animate, duration) {
        if (animate == true || duration > 0) {
            this.layer.style.transition = "left " + duration + "s";
        }
        this.layer.style.left = x + "px";
    };
    MIOView.prototype.getX = function () {
        //var x = this.layer.clientX;
        var x = this._getIntValueFromCSSProperty("left");
        return x;
    };
    MIOView.prototype.setY = function (y) {
        this.layer.style.top = y + "px";
    };
    MIOView.prototype.getY = function () {
        //var y = this.layer.clientY;
        var y = this._getIntValueFromCSSProperty("top");
        return y;
    };
    MIOView.prototype.setWidth = function (w) {
        this.layer.style.width = w + "px";
    };
    MIOView.prototype.getWidth = function () {
        //var w = this.layer.clientWidth;
        var w = this._getIntValueFromCSSProperty("width");
        return w;
    };
    MIOView.prototype.setHeight = function (h) {
        this.willChangeValue("height");
        this.layer.style.height = h + "px";
        this.didChangeValue("height");
    };
    MIOView.prototype.getHeight = function () {
        //var h = this.layer.clientHeight;
        var h = this._getIntValueFromCSSProperty("height");
        return h;
    };
    MIOView.prototype.setFrameComponents = function (x, y, w, h) {
        this.setX(x);
        this.setY(y);
        this.setWidth(w);
        this.setHeight(h);
    };
    MIOView.prototype.setFrame = function (frame) {
        this.setFrameComponents(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
    };
    Object.defineProperty(MIOView.prototype, "frame", {
        get: function () {
            return MIOFrame.frameWithRect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
        },
        enumerable: true,
        configurable: true
    });
    //
    // CSS Subsystem
    //
    MIOView.prototype._getValueFromCSSProperty = function (property) {
        var v = window.getComputedStyle(this.layer, null).getPropertyValue(property);
        return v;
    };
    MIOView.prototype._getIntValueFromCSSProperty = function (property) {
        var v = this._getValueFromCSSProperty(property);
        var r = MIOStringHasSuffix(v, "px");
        if (r == true)
            v = v.substring(0, v.length - 2);
        else {
            var r2 = MIOStringHasSuffix(v, "%");
            if (r2 == true)
                v = v.substring(0, v.length - 1);
        }
        return parseInt(v);
    };
    return MIOView;
}(MIOObject));
/**
 * Created by godshadow on 9/4/16.
 */
/// <reference path="MIOObject.ts" />
/// <reference path="MIOURLConnection.ts" />
/// <reference path="MIOWebApplication.ts" />
/// <reference path="MIOString.ts" />
var MIOBundle = (function () {
    function MIOBundle() {
        this._layoutWorker = null;
        this._layoutQueue = null;
        this._layoutCache = null;
        this._isDownloadResource = false;
        if (MIOBundle._mainBundle) {
            throw new Error("Error: Instantiation failed: Use defaultCenter() instead of new.");
        }
        MIOBundle._mainBundle = this;
    }
    MIOBundle.mainBundle = function () {
        return MIOBundle._mainBundle;
    };
    MIOBundle.prototype.loadFromResource = function (url, target, completion) {
        var conn = new MIOURLConnection();
        conn.initWithRequestBlock(new MIOURLRequest(url), this, function (error, data) {
            completion.call(target, data);
        });
    };
    MIOBundle.prototype.loadLayoutFromURL = function (url, layerID, target, completion) {
        if (this._layoutWorker == null) {
            this._layoutWorker = new Worker("src/miolib/webworkers/MIOBundleDownloadLayout.js");
            this._layoutWorker.postMessage({ "CMD": "SetLanguage", "LanguageStrings": _MIOLocalizedStrings });
            var instance = this;
            this._layoutWorker.onmessage = function (event) {
                instance.layerDidDownload(event.data);
            };
        }
        if (this._layoutQueue == null)
            this._layoutQueue = [];
        if (this._layoutCache == null)
            this._layoutCache = {};
        if (this._layoutCache[url] != null) {
            var i = this._layoutCache[url];
            var layout = i["Layer"];
            completion.call(target, layout);
        }
        else {
            // add to a queue
            var url2 = document.URL;
            if (url2.lastIndexOf(".") > -1) {
                url2 = url2.substr(0, url2.lastIndexOf('/'));
            }
            url2 = url2 + "/" + url;
            var item = { "Key": url, "URL": url2, "LayerID": layerID, "Target": target, "Completion": completion };
            this._layoutQueue.push(item);
            this.checkQueue();
        }
    };
    MIOBundle.prototype.checkQueue = function () {
        if (this._isDownloadResource == true)
            return;
        if (this._layoutQueue.length == 0)
            return;
        this._isDownloadResource = true;
        var item = this._layoutQueue[0];
        // Send only the information need
        console.log("Download resource: " + item["URL"]);
        var msg = { "CMD": "DownloadResource", "URL": item["URL"], "LayerID": item["LayerID"] };
        this._layoutWorker.postMessage(msg);
    };
    MIOBundle.prototype.layerDidDownload = function (layer) {
        var item = this._layoutQueue[0];
        this._layoutQueue.splice(0, 1);
        this._isDownloadResource = false;
        item["Layer"] = layer;
        var key = item["Key"];
        this._layoutCache[key] = item;
        var target = item["Target"];
        var completion = item["Completion"];
        completion.call(target, layer);
        delete item["Target"];
        delete item["Completion"];
        this.checkQueue();
    };
    return MIOBundle;
}());
MIOBundle._mainBundle = new MIOBundle();
/**
 * Created by godshadow on 17/08/16.
 */
/// <reference path="MIOCore.ts" />
/// <reference path="MIOCoreTypes.ts" />
/*
function AnimationTypeForViewController(vc, reverse)
{
    var type = MIOAnimationType.None;

    switch (vc.presentationType)
    {
        case MIOPresentationType.Sheet:
            type = (reverse == false ? MIOAnimationType.BeginSheet : MIOAnimationType.EndSheet);
            break;

        case MIOPresentationType.Modal:
            if (vc.presentationStyle == MIOPresentationStyle.ModalPresentationPopover)
                type = (reverse == false ? MIOAnimationType.FadeIn : MIOAnimationType.FadeOut);
            else if (MIOLibIsMobile())
                type = (reverse == false ? MIOAnimationType.SlideInUp : MIOAnimationType.SlideOutDown);
            else
                type = (reverse == false ? MIOAnimationType.BeginSheet : MIOAnimationType.EndSheet);
            break;

        case MIOPresentationType.Navigation:
            type = (reverse == false ? MIOAnimationType.Push : MIOAnimationType.Pop);
            break;
    }

    return type;
}

function AnimationClassesForPresentationType(type, reverse)
{
    var clasess = null;

    switch (type)
    {
        case MIOPresentationType.Sheet:
            clasess = ClassListForAnimationType(reverse == false ? MIOAnimationType.BeginSheet : MIOAnimationType.EndSheet);
            break;

        case MIOPresentationType.Modal:
            if (MIOLibIsMobile())
                clasess = ClassListForAnimationType(reverse == false ? MIOAnimationType.SlideInUp : MIOAnimationType.SlideOutDown);
            else
                clasess = ClassListForAnimationType(reverse == false ? MIOAnimationType.BeginSheet : MIOAnimationType.EndSheet);
            break;

        case MIOPresentationType.Navigation:
            clasess = ClassListForAnimationType(reverse == false ? MIOAnimationType.Push : MIOAnimationType.Pop);
            break;
    }

    return clasess;
}

function AddAnimationClassesForType(vc, reverse)
{
    var classes = AnimationClassesForPresentationType(vc.presentationType, reverse);
    AddAnimationClasses(vc, classes);
}

function RemoveAnimationClassesForType(vc, reverse)
{
    var classes = AnimationClassesForPresentationType(vc.presentationType, reverse);
    RemoveAnimationClasses(vc, classes);
}


function FrameWithStyleForViewControllerInView(view, vc)
{
    var w = 0;
    var h = 0;
    var x = 0;
    var y = 0;

    if (vc.presentationStyle == MIOPresentationStyle.PageSheet)
    {
        w = vc.preferredContentSize.width;
        h = vc.preferredContentSize.height;
        x = (view.getWidth() - w) / 2;
        y = 0;
    }
    else if (vc.presentationStyle == MIOPresentationStyle.FormSheet)
    {
        w = view.getWidth() * 0.75; // 75% of the view
        h = view.getHeight() * 0.90; // 90% of the view
        x = (view.getWidth() - w) / 2;
        y = (view.getHeight() - h) / 2;
    }
    else if (vc.presentationStyle == MIOPresentationStyle.ModalPresentationPopover)
    {
        w = vc.preferredContentSize.width;
        h = vc.preferredContentSize.height;
        var v = vc.popoverPresentationController().sourceView;
        var f = vc.popoverPresentationController().sourceRect;
        x = v.layer.getBoundingClientRect().left + f.size.width + 10;
        if ((x + w) > window.innerWidth)
            x = v.layer.getBoundingClientRect().left - w - 10;
        //y = (window.innerHeight - h) / 2;
        y = v.layer.getBoundingClientRect().top + f.size.height + 10;
    }
    else
    {
        w = view.getWidth();
        h = view.getHeight();
    }

    vc.contentSize = new MIOSize(w, h);
    return MIOFrame.frameWithRect(x, y, w, h);
}

*/ 
/**
 * Created by godshadow on 06/12/2016.
 */
/// <reference path="MIOViewController.ts" />
var MIOModalPresentationStyle;
(function (MIOModalPresentationStyle) {
    MIOModalPresentationStyle[MIOModalPresentationStyle["CurrentContext"] = 0] = "CurrentContext";
    MIOModalPresentationStyle[MIOModalPresentationStyle["FullScreen"] = 1] = "FullScreen";
    MIOModalPresentationStyle[MIOModalPresentationStyle["PageSheet"] = 2] = "PageSheet";
    MIOModalPresentationStyle[MIOModalPresentationStyle["FormSheet"] = 3] = "FormSheet";
    MIOModalPresentationStyle[MIOModalPresentationStyle["Popover"] = 4] = "Popover";
    MIOModalPresentationStyle[MIOModalPresentationStyle["None"] = 5] = "None";
})(MIOModalPresentationStyle || (MIOModalPresentationStyle = {}));
var MIOModalTransitionStyle;
(function (MIOModalTransitionStyle) {
    MIOModalTransitionStyle[MIOModalTransitionStyle["CoverVertical"] = 0] = "CoverVertical";
    MIOModalTransitionStyle[MIOModalTransitionStyle["FlipHorizontal"] = 1] = "FlipHorizontal";
    MIOModalTransitionStyle[MIOModalTransitionStyle["CrossDisolve"] = 2] = "CrossDisolve";
})(MIOModalTransitionStyle || (MIOModalTransitionStyle = {}));
var MIOPresentationController = (function (_super) {
    __extends(MIOPresentationController, _super);
    function MIOPresentationController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.presentationStyle = MIOModalPresentationStyle.CurrentContext;
        _this.shouldPresentInFullscreen = true;
        _this._presentedViewController = null; //ToVC
        _this.presentingViewController = null; //FromVC
        _this.presentedView = null;
        return _this;
    }
    MIOPresentationController.prototype.initWithPresentedViewControllerAndPresentingViewController = function (presentedViewController, presentingViewController) {
        _super.prototype.init.call(this);
        this.presentedViewController = presentedViewController;
        this.presentingViewController = presentingViewController;
    };
    MIOPresentationController.prototype.setPresentedViewController = function (vc) {
        this._presentedViewController = vc;
        this.presentedView = vc.view;
    };
    Object.defineProperty(MIOPresentationController.prototype, "presentedViewController", {
        get: function () {
            return this._presentedViewController;
        },
        set: function (vc) {
            this.setPresentedViewController(vc);
        },
        enumerable: true,
        configurable: true
    });
    MIOPresentationController.prototype.presentationTransitionWillBegin = function () {
        if (MIOLibIsMobile() == false) {
            this.presentedView.layer.style.borderLeft = "1px solid rgb(170, 170, 170)";
            this.presentedView.layer.style.borderBottom = "1px solid rgb(170, 170, 170)";
            this.presentedView.layer.style.borderRight = "1px solid rgb(170, 170, 170)";
            //this.presentedView.layer.style.zIndex = 10; // To make clip the children views
        }
    };
    MIOPresentationController.prototype.presentationTransitionDidEnd = function (completed) {
    };
    MIOPresentationController.prototype.dismissalTransitionWillBegin = function () {
    };
    MIOPresentationController.prototype.dismissalTransitionDidEnd = function (completed) {
    };
    return MIOPresentationController;
}(MIOObject));
var MIOModalTransitioningDelegate = (function (_super) {
    __extends(MIOModalTransitioningDelegate, _super);
    function MIOModalTransitioningDelegate() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.modalTransitionStyle = null;
        return _this;
    }
    MIOModalTransitioningDelegate.prototype.animationControllerForPresentedController = function (presentedViewController, presentingViewController, sourceController) {
    };
    MIOModalTransitioningDelegate.prototype.animationControllerForDismissedController = function (dismissedController) {
    };
    return MIOModalTransitioningDelegate;
}(MIOObject));
var MIOPresentAnimationController = (function (_super) {
    __extends(MIOPresentAnimationController, _super);
    function MIOPresentAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOPresentAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0;
    };
    MIOPresentAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations before transitions
    };
    MIOPresentAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations after transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOPresentAnimationController.prototype.animations = function (transitionContext) {
        return null;
    };
    return MIOPresentAnimationController;
}(MIOObject));
var MIOModalPresentAnimationController = (function (_super) {
    __extends(MIOModalPresentAnimationController, _super);
    function MIOModalPresentAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOModalPresentAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.15;
    };
    MIOModalPresentAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations before transitions
        var fromVC = transitionContext.presentingViewController;
        var toVC = transitionContext.presentedViewController;
        if (toVC.modalPresentationStyle == MIOModalPresentationStyle.CurrentContext) {
            if (MIOLibIsMobile() == false) {
                // Present like desktop sheet window
                var ws = MUIWindowSize();
                var w = toVC.preferredContentSize.width;
                var h = toVC.preferredContentSize.height;
                var x = (ws.width - w) / 2;
                toVC.view.setFrame(MIOFrame.frameWithRect(x, 0, w, h));
            }
            else {
                var w = fromVC.view.getWidth();
                var h = fromVC.view.getHeight();
                toVC.view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
            }
        }
    };
    MIOModalPresentAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations after transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOModalPresentAnimationController.prototype.animations = function (transitionContext) {
        var animations = null;
        if (MIOLibIsMobile() == true)
            animations = MUIClassListForAnimationType(MUIAnimationType.SlideInUp);
        else
            animations = MUIClassListForAnimationType(MUIAnimationType.BeginSheet);
        return animations;
    };
    return MIOModalPresentAnimationController;
}(MIOObject));
var MIOModalDismissAnimationController = (function (_super) {
    __extends(MIOModalDismissAnimationController, _super);
    function MIOModalDismissAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOModalDismissAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.15;
    };
    MIOModalDismissAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations after transitions
    };
    MIOModalDismissAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations before transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOModalDismissAnimationController.prototype.animations = function (transitionContext) {
        var animations = null;
        if (MIOLibIsMobile() == true)
            animations = MUIClassListForAnimationType(MUIAnimationType.SlideOutDown);
        else
            animations = MUIClassListForAnimationType(MUIAnimationType.EndSheet);
        return animations;
    };
    return MIOModalDismissAnimationController;
}(MIOObject));
/**
 * Created by godshadow on 11/11/2016.
 */
/// <reference path="MIOViewController_PresentationController.ts" />
var MIOPopoverArrowDirection;
(function (MIOPopoverArrowDirection) {
    MIOPopoverArrowDirection[MIOPopoverArrowDirection["Any"] = 0] = "Any";
    MIOPopoverArrowDirection[MIOPopoverArrowDirection["Up"] = 1] = "Up";
    MIOPopoverArrowDirection[MIOPopoverArrowDirection["Down"] = 2] = "Down";
    MIOPopoverArrowDirection[MIOPopoverArrowDirection["Left"] = 3] = "Left";
    MIOPopoverArrowDirection[MIOPopoverArrowDirection["Right"] = 4] = "Right";
})(MIOPopoverArrowDirection || (MIOPopoverArrowDirection = {}));
var MIOPopoverPresentationController = (function (_super) {
    __extends(MIOPopoverPresentationController, _super);
    function MIOPopoverPresentationController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.permittedArrowDirections = MIOPopoverArrowDirection.Any;
        _this.sourceView = null;
        _this.sourceRect = MIOFrame.Zero();
        _this.delegate = null;
        _this._contentSize = null;
        _this._canvasLayer = null;
        _this._contentView = null;
        return _this;
    }
    MIOPopoverPresentationController.prototype.init = function () {
        _super.prototype.init.call(this);
    };
    MIOPopoverPresentationController.prototype.setPresentedViewController = function (vc) {
        _super.prototype.setPresentedViewController.call(this, vc);
        var size = vc.preferredContentSize;
        this._contentSize = size;
        var w = size.width + 2;
        var h = size.height + 2;
        this.presentedView = new MIOView();
        this.presentedView.initWithFrame(MIOFrame.frameWithRect(0, 0, w, h));
        this.presentedView.addSubview(vc.view);
    };
    MIOPopoverPresentationController.prototype.presentationTransitionWillBegin = function () {
        this.presentedView.layer.style.borderRadius = "5px 5px 5px 5px";
        this.presentedView.layer.style.border = "1px solid rgb(170, 170, 170)";
        this.presentedView.layer.style.overflow = "hidden";
        this.presentedView.layer.style.zIndex = 10; // To make clip the children views
    };
    MIOPopoverPresentationController.prototype._drawRoundRect = function (x, y, width, height, radius) {
        var ctx = this._canvasLayer.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        var color = 'rgba(170, 170, 170, 1)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
    };
    return MIOPopoverPresentationController;
}(MIOPresentationController));
var MIOPopOverPresentAnimationController = (function (_super) {
    __extends(MIOPopOverPresentAnimationController, _super);
    function MIOPopOverPresentAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOPopOverPresentAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.15;
    };
    MIOPopOverPresentAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations before transitions
        var vc = transitionContext.presentedViewController;
        var view = transitionContext["presentedView"];
        var w = vc.preferredContentSize.width;
        var h = vc.preferredContentSize.height;
        var v = vc.popoverPresentationController.sourceView;
        var f = vc.popoverPresentationController.sourceRect;
        var xShift = false;
        // Below
        var y = v.layer.getBoundingClientRect().top + f.size.height + 10;
        if ((y + h) > window.innerHeight)
            y = v.layer.getBoundingClientRect().top - h - 10;
        if (y < 0) {
            xShift = true;
            y = (window.innerHeight - h) / 2;
        }
        var x = 0;
        if (xShift == false) {
            x = v.layer.getBoundingClientRect().left + 10;
            if ((x + w) > window.innerWidth)
                x = v.layer.getBoundingClientRect().left + f.size.width - w + 10;
        }
        else {
            x = v.layer.getBoundingClientRect().left + f.size.width + 10;
            if ((x + w) > window.innerWidth)
                x = v.layer.getBoundingClientRect().left - w - 10;
        }
        view.setX(x);
        view.setY(y);
    };
    MIOPopOverPresentAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations after transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOPopOverPresentAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.FadeIn);
        return animations;
    };
    return MIOPopOverPresentAnimationController;
}(MIOObject));
var MIOPopOverDismissAnimationController = (function (_super) {
    __extends(MIOPopOverDismissAnimationController, _super);
    function MIOPopOverDismissAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOPopOverDismissAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.15;
    };
    MIOPopOverDismissAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations after transitions
    };
    MIOPopOverDismissAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations before transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOPopOverDismissAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.FadeOut);
        return animations;
    };
    return MIOPopOverDismissAnimationController;
}(MIOObject));
/**
 * Created by godshadow on 05/12/2016.
 */
/// <reference path="MIOView.ts" />
/// <reference path="MIOViewController.ts" />
function MUIOutlet(owner, elementID, className, options) {
    //var layer = document.getElementById(elementID);
    var layer = null;
    if (owner instanceof MIOView)
        layer = MIOLayerSearchElementByID(owner.layer, elementID);
    else if (owner instanceof MIOViewController)
        layer = MIOLayerSearchElementByID(owner.view.layer, elementID);
    if (className == null)
        className = layer.getAttribute("data-class");
    if (className == null)
        className = "MIOView";
    var c = MIOClassFromString(className);
    c.initWithLayer(layer, options);
    if (owner instanceof MIOView)
        owner._linkViewToSubview(c);
    else if (owner instanceof MIOViewController)
        owner.view._linkViewToSubview(c);
    if (c instanceof MIOView)
        c.awakeFromHTML();
    if (c instanceof MIOViewController)
        owner.addChildViewController(c);
    return c;
}
function MUIWindowSize() {
    var w = document.body.clientWidth;
    var h = document.body.clientHeight;
    return new MIOSize(w, h);
}
/*
    ANIMATIONS
 */
var MUIAnimationType;
(function (MUIAnimationType) {
    MUIAnimationType[MUIAnimationType["None"] = 0] = "None";
    MUIAnimationType[MUIAnimationType["BeginSheet"] = 1] = "BeginSheet";
    MUIAnimationType[MUIAnimationType["EndSheet"] = 2] = "EndSheet";
    MUIAnimationType[MUIAnimationType["Push"] = 3] = "Push";
    MUIAnimationType[MUIAnimationType["Pop"] = 4] = "Pop";
    MUIAnimationType[MUIAnimationType["FlipLeft"] = 5] = "FlipLeft";
    MUIAnimationType[MUIAnimationType["FlipRight"] = 6] = "FlipRight";
    MUIAnimationType[MUIAnimationType["FadeIn"] = 7] = "FadeIn";
    MUIAnimationType[MUIAnimationType["FadeOut"] = 8] = "FadeOut";
    MUIAnimationType[MUIAnimationType["LightSpeedIn"] = 9] = "LightSpeedIn";
    MUIAnimationType[MUIAnimationType["LightSpeedOut"] = 10] = "LightSpeedOut";
    MUIAnimationType[MUIAnimationType["Hinge"] = 11] = "Hinge";
    MUIAnimationType[MUIAnimationType["SlideInUp"] = 12] = "SlideInUp";
    MUIAnimationType[MUIAnimationType["SlideOutDown"] = 13] = "SlideOutDown";
})(MUIAnimationType || (MUIAnimationType = {}));
// ANIMATION TYPES
function MUIClassListForAnimationType(type) {
    var array = [];
    array.push("animated");
    switch (type) {
        case MUIAnimationType.BeginSheet:
            array.push("slideInDown");
            break;
        case MUIAnimationType.EndSheet:
            array.push("slideOutUp");
            break;
        case MUIAnimationType.Push:
            array.push("slideInRight");
            break;
        case MUIAnimationType.Pop:
            array.push("slideOutRight");
            break;
        case MUIAnimationType.FadeIn:
            array.push("fadeIn");
            break;
        case MUIAnimationType.FadeOut:
            array.push("fadeOut");
            break;
        case MUIAnimationType.LightSpeedOut:
            array.push("lightSpeedOut");
            break;
        case MUIAnimationType.Hinge:
            array.push("hinge");
            break;
        case MUIAnimationType.SlideInUp:
            array.push("slideInUp");
            break;
        case MUIAnimationType.SlideOutDown:
            array.push("slideOutDown");
            break;
    }
    return array;
}
function _MUIAddAnimations(layer, animations) {
    for (var index = 0; index < animations.length; index++)
        layer.classList.add(animations[index]);
}
function _MUIRemoveAnimations(layer, animations) {
    for (var index = 0; index < animations.length; index++)
        layer.classList.remove(animations[index]);
}
function _MIUShowViewController(fromVC, toVC, sourceVC, modal, target, completion) {
    toVC.viewWillAppear();
    toVC._childControllersWillAppear();
    if (toVC.modalPresentationStyle == MIOModalPresentationStyle.FullScreen
        || toVC.modalPresentationStyle == MIOModalPresentationStyle.CurrentContext) {
        fromVC.viewWillDisappear();
        fromVC._childControllersWillDisappear();
    }
    var view = null;
    if (modal == true) {
        var pc = toVC.presentationController;
        view = pc.presentedView;
    }
    else
        view = toVC.view;
    view.layout();
    var ac = null;
    if (toVC.transitioningDelegate != null) {
        ac = toVC.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }
    else if (sourceVC != null && sourceVC.transitioningDelegate != null) {
        ac = sourceVC.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }
    else {
        if (toVC.modalPresentationStyle == MIOModalPresentationStyle.Popover)
            ac = new MIOPopOverPresentAnimationController();
        else if (modal == true)
            ac = new MIOModalPresentAnimationController();
        else
            ac = new MIOPresentAnimationController();
        ac.init();
    }
    var animationContext = {};
    animationContext["presentingViewController"] = fromVC;
    animationContext["presentedViewController"] = toVC;
    animationContext["presentedView"] = view;
    var layer = view.layer;
    if (pc != null)
        pc.presentationTransitionWillBegin();
    _MUIAnimationStart(layer, ac, animationContext, this, function () {
        toVC.viewDidAppear();
        toVC._childControllersDidAppear();
        if (toVC.modalPresentationStyle == MIOModalPresentationStyle.FullScreen
            || toVC.modalPresentationStyle == MIOModalPresentationStyle.CurrentContext) {
            fromVC.viewDidDisappear();
            fromVC._childControllersDidDisappear();
        }
        if (pc != null)
            pc.presentationTransitionDidEnd(true);
        if (target != null && completion != null)
            completion.call(target);
    });
}
function _MUIHideViewController(fromVC, toVC, sourceVC, modal, target, completion) {
    if (fromVC.modalPresentationStyle == MIOModalPresentationStyle.FullScreen
        || fromVC.modalPresentationStyle == MIOModalPresentationStyle.CurrentContext) {
        toVC.viewWillAppear();
        toVC._childControllersWillAppear();
        toVC.view.layout();
    }
    fromVC.viewWillDisappear();
    fromVC._childControllersWillDisappear();
    var view = null;
    if (modal == true) {
        var pc = fromVC.presentationController;
        view = pc.presentedView;
    }
    else
        view = fromVC.view;
    var ac = null;
    if (fromVC.transitioningDelegate != null) {
        ac = fromVC.transitioningDelegate.animationControllerForDismissedController(fromVC);
    }
    else if (sourceVC != null && sourceVC.transitioningDelegate != null) {
        ac = sourceVC.transitioningDelegate.animationControllerForDismissedController(toVC);
    }
    else {
        if (fromVC.modalPresentationStyle == MIOModalPresentationStyle.Popover)
            ac = new MIOPopOverDismissAnimationController();
        else
            ac = new MIOModalDismissAnimationController();
        ac.init();
    }
    var animationContext = {};
    animationContext["presentingViewController"] = fromVC;
    animationContext["presentedViewController"] = toVC;
    animationContext["presentedView"] = view;
    var layer = view.layer;
    var pc = fromVC.presentationController;
    if (pc != null)
        pc.dismissalTransitionWillBegin();
    _MUIAnimationStart(layer, ac, animationContext, this, function () {
        if (fromVC.modalPresentationStyle == MIOModalPresentationStyle.FullScreen
            || fromVC.modalPresentationStyle == MIOModalPresentationStyle.CurrentContext) {
            toVC.viewDidAppear();
            toVC._childControllersDidAppear();
        }
        fromVC.viewDidDisappear();
        fromVC._childControllersDidDisappear();
        if (pc != null)
            pc.dismissalTransitionDidEnd(true);
        if (target != null && completion != null)
            completion.call(target);
    });
}
function _MUIAnimationStart(layer, animationController, animationContext, target, completion) {
    var duration = animationController.transitionDuration(animationContext);
    var animations = animationController.animations(animationContext);
    animationController.animateTransition(animationContext);
    if (duration == 0 || animations == null) {
        // NO animation
        animationController.animationEnded(true);
        if (target != null && completion != null)
            completion.call(target);
        return;
    }
    layer.style.animationDuration = duration + "s";
    _MUIAddAnimations(layer, animations);
    layer.animationParams = {};
    layer.animationParams["animationController"] = animationController;
    layer.animationParams["animations"] = animations;
    if (target != null)
        layer.animationParams["target"] = target;
    if (completion != null)
        layer.animationParams["completion"] = completion;
    layer.addEventListener("animationend", _MUIAnimationDidFinish);
}
function _MUIAnimationDidFinish(event) {
    var animationController = event.target.animationParams["animationController"];
    var animations = event.target.animationParams["animations"];
    var target = event.target.animationParams["target"];
    var completion = event.target.animationParams["completion"];
    var layer = event.target;
    _MUIRemoveAnimations(layer, animations);
    layer.removeEventListener("animationend", _MUIAnimationDidFinish);
    animationController.animationEnded(true);
    if (target != null && completion != null)
        completion.call(target);
}
/**
 * Created by godshadow on 11/3/16.
 */
/// <reference path="MIOObject.ts" />
/// <reference path="MIOString.ts" />
/// <reference path="MIOView.ts" />
/// <reference path="MIOBundle.ts" />
/// <reference path="MIOCoreTypes.ts" />
/// <reference path="MIOViewController_Animation.ts" />
/// <reference path="MIOViewController_PresentationController.ts" />
/// <reference path="MIOViewController_PopoverPresentationController.ts" />
/// <reference path="MIOUIKit.ts" />
var MIOViewController = (function (_super) {
    __extends(MIOViewController, _super);
    function MIOViewController(layerID, prefixID) {
        var _this = _super.call(this) || this;
        _this.layerID = null;
        _this.prefixID = null;
        _this.view = null;
        _this._onViewLoadedTarget = null;
        _this._onViewLoadedAction = null;
        _this._onLoadLayerTarget = null;
        _this._onLoadLayerAction = null;
        _this._viewIsLoaded = false;
        _this._layerIsReady = false;
        _this._childViewControllers = [];
        _this.parentViewController = null;
        _this.presentingViewController = null;
        _this.presentedViewController = null;
        _this.navigationController = null;
        _this.splitViewController = null;
        _this.tabBarController = null;
        _this._presentationController = null;
        _this._popoverPresentationController = null;
        _this.modalPresentationStyle = MIOModalPresentationStyle.CurrentContext;
        _this.modalTransitionStyle = MIOModalTransitionStyle.CoverVertical;
        _this.transitioningDelegate = null;
        _this._contentSize = new MIOSize(320, 200);
        _this._preferredContentSize = new MIOSize(320, 200);
        _this.layerID = layerID;
        _this.prefixID = prefixID;
        return _this;
    }
    MIOViewController.prototype.init = function () {
        _super.prototype.init.call(this);
        this.view = new MIOView(this.layerID);
        this.view.init();
        this._layerIsReady = true;
    };
    MIOViewController.prototype.initWithLayer = function (layer, options) {
        _super.prototype.init.call(this);
        this.view = new MIOView(this.layerID);
        this.view.initWithLayer(layer, options);
        this._layerIsReady = true;
    };
    MIOViewController.prototype.initWithView = function (view) {
        _super.prototype.init.call(this);
        this.view = view;
        this._layerIsReady = true;
    };
    MIOViewController.prototype.initWithResource = function (url) {
        _super.prototype.init.call(this);
        this.view = new MIOView(this.layerID);
        //this.view.init();
        var mainBundle = MIOBundle.mainBundle();
        mainBundle.loadLayoutFromURL(url, this.layerID, this, function (data) {
            //var result = MIOHTMLParser(data, this.layerID);
            var result = data;
            var cssFiles = result.styles;
            var baseURL = url.substring(0, url.lastIndexOf('/')) + "/";
            for (var index = 0; index < cssFiles.length; index++) {
                var cssurl = baseURL + cssFiles[index];
                console.log("Adding CSS: " + cssurl);
                MIOCoreLoadStyle(cssurl);
            }
            var domParser = new DOMParser();
            var items = domParser.parseFromString(result.layout, "text/html");
            var layer = items.getElementById(this.layerID);
            this.localizeSubLayers(layer.childNodes);
            //this.view.addSubLayer(layer);
            this.view.initWithLayer(layer);
            this.view.awakeFromHTML();
            this._didLayerDownloaded();
        });
    };
    MIOViewController.prototype.localizeSubLayers = function (layers) {
        if (layers.length == 0)
            return;
        for (var index = 0; index < layers.length; index++) {
            var layer = layers[index];
            if (layer.tagName != "DIV")
                continue;
            var key = layer.getAttribute("data-localize-key");
            if (key != null)
                layer.innerHTML = MIOLocalizeString(key, key);
            this.localizeSubLayers(layer.childNodes);
        }
    };
    MIOViewController.prototype.localizeLayerIDWithKey = function (layerID, key) {
        var layer = MIOLayerSearchElementByID(this.view.layer, layerID);
        layer.innerHTML = MIOLocalizeString(key, key);
    };
    MIOViewController.prototype.loadView = function () {
        //this.view.layer.style.overflow = "hidden";
    };
    MIOViewController.prototype._didLayerDownloaded = function () {
        this._layerIsReady = true;
        if (this._onLoadLayerTarget != null && this._onViewLoadedAction != null) {
            this._onLoadLayerAction.call(this._onLoadLayerTarget);
            this._onLoadLayerTarget = null;
            this._onLoadLayerAction = null;
        }
        if (this._onViewLoadedAction != null && this._onViewLoadedTarget != null) {
            this.loadView();
            this.viewDidLoad();
            this._loadChildControllers();
        }
    };
    MIOViewController.prototype._loadChildControllers = function () {
        var count = this._childViewControllers.length;
        if (count > 0)
            this._loadChildViewController(0, count);
        else
            this._setViewLoaded(true);
    };
    MIOViewController.prototype._loadChildViewController = function (index, max) {
        if (index < max) {
            var vc = this._childViewControllers[index];
            vc.onLoadView(this, function () {
                var newIndex = index + 1;
                this._loadChildViewController(newIndex, max);
            });
        }
        else {
            this._setViewLoaded(true);
        }
    };
    MIOViewController.prototype._setViewLoaded = function (value) {
        this.willChangeValue("viewLoaded");
        this._viewIsLoaded = value;
        this.didChangeValue("viewLoaded");
        if (value == true && this._onViewLoadedAction != null) {
            this._onViewLoadedAction.call(this._onViewLoadedTarget);
        }
        this._onViewLoadedTarget = null;
        this._onViewLoadedAction = null;
    };
    MIOViewController.prototype.onLoadView = function (target, action) {
        this._onViewLoadedTarget = target;
        this._onViewLoadedAction = action;
        if (this._viewIsLoaded == true) {
            action.call(target);
        }
        else if (this._layerIsReady == true) {
            this.loadView();
            this.viewDidLoad();
            this._loadChildControllers();
        }
    };
    MIOViewController.prototype.onLoadLayer = function (target, action) {
        if (this._layerIsReady == true) {
            action.call(target);
        }
        else {
            this._onLoadLayerTarget = action;
            this._onLoadLayerAction = target;
        }
    };
    Object.defineProperty(MIOViewController.prototype, "viewIsLoaded", {
        get: function () {
            return this._viewIsLoaded;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOViewController.prototype, "childViewControllers", {
        get: function () {
            return this._childViewControllers;
        },
        enumerable: true,
        configurable: true
    });
    MIOViewController.prototype.addChildViewController = function (vc) {
        vc.parentViewController = this;
        this._childViewControllers.push(vc);
        //vc.willMoveToParentViewController(this);
    };
    MIOViewController.prototype.removeChildViewController = function (vc) {
        var index = this._childViewControllers.indexOf(vc);
        if (index != -1) {
            this._childViewControllers.splice(index, 1);
            vc.parentViewController = null;
        }
    };
    // removeFromParentViewController()
    // {
    //     this.parent.removeChildViewController(this);
    //     this.parent = null;
    //     this.view.removeFromSuperview();
    //     //this.didMoveToParentViewController(null);
    // }
    MIOViewController.prototype.setPresentationController = function (pc) {
        this._presentationController = pc;
    };
    Object.defineProperty(MIOViewController.prototype, "presentationController", {
        get: function () {
            if (this._presentationController == null && this.parentViewController != null)
                return this.parentViewController.presentationController;
            return this._presentationController;
        },
        set: function (pc) {
            this.setPresentationController(pc);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOViewController.prototype, "popoverPresentationController", {
        get: function () {
            if (this._popoverPresentationController == null) {
                this._popoverPresentationController = new MIOPopoverPresentationController();
                //this._popoverPresentationController.initWithRootViewController(this);
                this._popoverPresentationController.init();
                this._popoverPresentationController.presentedViewController = this;
            }
            this.presentationController = this._popoverPresentationController;
            return this._popoverPresentationController;
        },
        enumerable: true,
        configurable: true
    });
    MIOViewController.prototype.showViewController = function (vc, animate) {
        vc.onLoadView(this, function () {
            this.view.addSubview(vc.view);
            this.addChildViewController(vc);
            _MIUShowViewController(this, vc, this, false);
        });
    };
    MIOViewController.prototype.presentViewController = function (vc, animate) {
        var pc = vc.presentationController;
        if (pc == null) {
            pc = new MIOPresentationController();
            pc.init();
            pc.presentedViewController = vc;
        }
        pc.presentingViewController = this;
        vc.presentationController = pc;
        vc.onLoadView(this, function () {
            this.view.addSubview(vc.presentationController.presentedView);
            this.addChildViewController(vc);
            _MIUShowViewController(this, vc, null, true, this, function () {
                if (vc.modalPresentationStyle == MIOModalPresentationStyle.Popover)
                    MIOWebApplication.sharedInstance().setPopOverViewController(vc);
            });
        });
    };
    MIOViewController.prototype.dismissViewController = function (animate) {
        var toVC = this.presentationController.presentingViewController;
        var fromVC = this.presentationController.presentedViewController;
        var fromView = this.presentationController.presentedView;
        _MUIHideViewController(fromVC, toVC, null, true, this, function () {
            toVC.removeChildViewController(fromVC);
            fromView.removeFromSuperview();
        });
    };
    MIOViewController.prototype.transitionFromViewControllerToViewController = function (fromVC, toVC, duration, animationType, target, completion) {
        /*toVC.onLoadView(this, function () {

            if (fromVC.presentationStyle == MIOPresentationStyle.CurrentContext
                || fromVC.presentationStyle == MIOPresentationStyle.FullScreen)
            {
                fromVC.viewWillDisappear();
                fromVC._childControllersWillDisappear();

                toVC.viewWillAppear();
                toVC._childControllersWillAppear();

                toVC.view.layout();
            }
            else
            {
                if (reverse == false)
                {
                    toVC.viewWillAppear();
                    toVC._childControllersWillAppear();

                    toVC.view.layout();
                }
                else
                {
                    fromVC.viewWillDisappear();
                    fromVC._childControllersWillDisappear();
                }
            }

            if (duration > 0)
            {
                var vc = reverse == true ? fromVC : toVC;
                vc.view.layer.style.animationDuration = duration + "s";
                AddAnimationClasses(vc, ClassListForAnimationType(animationType));
                vc.view.layer.animationParams = {};
                vc.view.layer.animationParams["type"] = animationType;
                vc.view.layer.animationParams["toVC"] = toVC;
                vc.view.layer.animationParams["fromVC"] = fromVC;
                if (target != null)
                    vc.view.layer.animationParams["target"] = target;
                if (completion != null)
                    vc.view.layer.animationParams["completion"] = completion;
                vc.view.layer.animationParams["instance"] = this;
                vc.view.layer.animationParams["reverse"] = reverse;
                vc.view.layer.addEventListener("animationend", this._animationDidFinish);
            }
            else
            {
                if (fromVC.presentationStyle == MIOPresentationStyle.CurrentContext
                    || fromVC.presentationStyle == MIOPresentationStyle.FullScreen)
                {
                    toVC.viewDidAppear();
                    toVC._childControllersDidAppear();

                    fromVC.viewDidDisappear();
                    fromVC._childControllersDidDisappear();
                }
                else
                {
                    if (reverse == false)
                    {
                        toVC.viewDidAppear();
                        toVC._childControllersDidAppear();
                    }
                    else
                    {
                        fromVC.viewDidDisappear();
                        fromVC._childControllersDidDisappear();
                    }
                }

                if (target != null && completion != null)
                    completion.call(target);
            }
        });*/
    };
    MIOViewController.prototype.viewDidLoad = function () { };
    MIOViewController.prototype.viewWillAppear = function () { };
    MIOViewController.prototype._childControllersWillAppear = function () {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewWillAppear();
        }
    };
    MIOViewController.prototype.viewDidAppear = function () { };
    MIOViewController.prototype._childControllersDidAppear = function () {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewDidAppear();
        }
    };
    MIOViewController.prototype.viewWillDisappear = function () { };
    MIOViewController.prototype._childControllersWillDisappear = function () {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewWillDisappear();
        }
    };
    MIOViewController.prototype.viewDidDisappear = function () { };
    MIOViewController.prototype._childControllersDidDisappear = function () {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewDidDisappear();
        }
    };
    MIOViewController.prototype.contentHeight = function () {
        return this.view.getHeight();
    };
    MIOViewController.prototype.setContentSize = function (size) {
        this.willChangeValue("contentSize");
        this._contentSize = size;
        this.didChangeValue("contentSize");
    };
    Object.defineProperty(MIOViewController.prototype, "contentSize", {
        get: function () {
            return this._contentSize;
        },
        set: function (size) {
            this.setContentSize(size);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOViewController.prototype, "preferredContentSize", {
        get: function () {
            return this._preferredContentSize;
        },
        enumerable: true,
        configurable: true
    });
    return MIOViewController;
}(MIOObject));
/**
 * Created by godshadow on 11/3/16.
 */
/// <reference path="MIOView.ts" />
/// <reference path="MIOViewController.ts" />
var MIOWindow = (function (_super) {
    __extends(MIOWindow, _super);
    function MIOWindow(layerID) {
        var _this = _super.call(this, layerID) || this;
        _this.rootViewController = null;
        if (layerID == null)
            _this.layerID = "main_window";
        return _this;
    }
    MIOWindow.prototype.init = function () {
        _super.prototype.init.call(this);
        // Only windows
        document.body.appendChild(this.layer);
    };
    MIOWindow.prototype.initWithRootViewController = function (vc) {
        this.init();
        this.rootViewController = vc;
        this.addSubview(vc.view);
    };
    MIOWindow.prototype.removeFromSuperview = function () {
        document.body.removeChild(this.layer);
    };
    MIOWindow.prototype.layout = function () {
        this.rootViewController.view.layout();
    };
    return MIOWindow;
}(MIOView));
/**
 * Created by godshadow on 11/3/16.
 */
/// <reference path="MIOLib.ts" />
/// <reference path="MIOCore.ts" />
/// <reference path="MIONotificationCenter.ts" />
/// <reference path="MIOURLConnection.ts" />
/// <reference path="MIOViewController.ts" />
/// <reference path="MIOWindow.ts" />
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
        this._sheetSize = null;
        //private _popUpMenuView = null;
        this._popUpMenu = null;
        this._popUpMenuControl = null;
        this._popOverWindow = null;
        this._popOverWindowFirstClick = false;
        this._popOverViewController = null;
        this._windows = [];
        if (MIOWebApplication._sharedInstance) {
            throw new Error("Error: Instantiation failed: Use sharedInstance() instead of new.");
        }
        MIOWebApplication._sharedInstance = this;
        this._decodeParams();
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
    MIOWebApplication.prototype._decodeParams = function () {
        MIOLibDecodeParams(window.location.search, this, function (param, value) {
            if (param == "lang" || param == "language") {
                this.currentLanguage = value;
            }
        });
    };
    MIOWebApplication.prototype.run = function () {
        // Check languages
        if (this.currentLanguage == null)
            this.currentLanguage = this.defaultLanguage;
        if (_MIOLocalizedStrings == null && this.currentLanguage != null) {
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
                _MIOLocalizedStrings = json;
            }
            fn.call(this);
        });
    };
    MIOWebApplication.prototype.beginSheetViewController = function (vc) {
        /*        var window = this.delegate.window;
        
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
                this._sheetViewController.addObserver(this, "contentSize");*/
    };
    MIOWebApplication.prototype.endSheetViewController = function () {
        if (this._sheetViewController == null)
            return;
        var window = this.delegate.window;
        this._sheetViewController.removeObserver(this, "contentSize");
        this._sheetViewController.dismissViewController(true);
        window.rootViewController.removeChildViewController(this._sheetViewController);
        this._sheetViewController = null;
    };
    MIOWebApplication.prototype.observeValueForKeyPath = function (key, type, object) {
        /*        if (type == "will")
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
                }*/
    };
    MIOWebApplication.prototype.showModalViewContoller = function (vc) {
        var w = new MIOWindow(MIOViewGetNextLayerID("window"));
        w.initWithRootViewController(vc);
        // Add new window
        document.body.appendChild(vc.view.layer);
        this._windows.push(w);
    };
    MIOWebApplication.prototype.showMenuFromControl = function (control, menu) {
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
    };
    MIOWebApplication.prototype.hideMenu = function () {
        if (this._popUpMenu != null) {
            this._popUpMenu.removeFromSuperview();
            this._popUpMenu = null;
        }
    };
    MIOWebApplication.prototype.forwardResizeEvent = function (e) {
        if (this.ready == true)
            this.delegate.window.layout();
    };
    MIOWebApplication.prototype.forwardClickEvent = function (target, x, y) {
        if (this.ready == false)
            return;
        if (this._popUpMenu != null) {
            var controlRect = this._popUpMenuControl.layer.getBoundingClientRect();
            if ((x > controlRect.left && x < controlRect.right)
                && (y > controlRect.top && y < controlRect.bottom)) {
                // Nothing
            }
            else {
                this._popUpMenu.hide();
            }
        }
        if (this._popOverViewController != null) {
            // if (this._popOverWindowFirstClick == true) {
            //     this._popOverWindowFirstClick = false;
            //     return;
            // }
            var controlRect = this._popOverViewController.view.layer.getBoundingClientRect();
            console.log("x: " + controlRect.left + " mx: " + x);
            if ((x > controlRect.left && x < controlRect.right)
                && (y > controlRect.top && y < controlRect.bottom)) {
                //Nothing
            }
            else
                this._popOverViewController.dismissViewController(true);
        }
    };
    MIOWebApplication.prototype.setPopOverViewController = function (vc) {
        if (this._popOverViewController != null)
            this._popOverViewController.dismissViewController(true);
        this._popOverViewController = vc;
    };
    MIOWebApplication.prototype.showPopOverControllerFromRect = function (vc, frame) {
        if (this._popOverWindow != null) {
            this.hidePopOverController();
        }
        if (this._popOverWindow == null) {
            this._popOverWindow = new MIOWindow("popover_window");
            this._popOverWindow.initWithRootViewController(vc.popoverPresentationController());
            //this._popOverWindow.layer.style.border = "2px solid rgb(170, 170, 170)";
            this._popOverWindow.setFrame(vc.popoverPresentationController().frame);
        }
        this._popOverWindow.rootViewController.onLoadView(this, function () {
            this._popOverWindow.rootViewController.viewWillAppear();
            this._popOverWindow.rootViewController.viewDidAppear();
        });
        this._popOverWindowFirstClick = true;
    };
    MIOWebApplication.prototype.hidePopOverController = function () {
        this._popOverWindow.rootViewController.viewWillDisappear();
        this._popOverWindow.removeFromSuperview();
        this._popOverWindow.rootViewController.viewDidDisappear();
        this._popOverWindow = null;
    };
    return MIOWebApplication;
}());
MIOWebApplication._sharedInstance = new MIOWebApplication();
/**
 * Created by godshadow on 1/5/16.
 */
/// <reference path="MIOObject.ts" />
var MIOPredicateComparatorType;
(function (MIOPredicateComparatorType) {
    MIOPredicateComparatorType[MIOPredicateComparatorType["Equal"] = 0] = "Equal";
    MIOPredicateComparatorType[MIOPredicateComparatorType["Less"] = 1] = "Less";
    MIOPredicateComparatorType[MIOPredicateComparatorType["Greater"] = 2] = "Greater";
    MIOPredicateComparatorType[MIOPredicateComparatorType["Not"] = 3] = "Not";
    MIOPredicateComparatorType[MIOPredicateComparatorType["Contains"] = 4] = "Contains";
})(MIOPredicateComparatorType || (MIOPredicateComparatorType = {}));
var MIOPredicateOperatorType;
(function (MIOPredicateOperatorType) {
    MIOPredicateOperatorType[MIOPredicateOperatorType["OR"] = 0] = "OR";
    MIOPredicateOperatorType[MIOPredicateOperatorType["AND"] = 1] = "AND";
})(MIOPredicateOperatorType || (MIOPredicateOperatorType = {}));
var MIOPredicateType;
(function (MIOPredicateType) {
    MIOPredicateType[MIOPredicateType["Predicate"] = 0] = "Predicate";
    MIOPredicateType[MIOPredicateType["Item"] = 1] = "Item";
    MIOPredicateType[MIOPredicateType["Operation"] = 2] = "Operation";
})(MIOPredicateType || (MIOPredicateType = {}));
var MIOPredicateOperator = (function () {
    function MIOPredicateOperator(type) {
        this.type = null;
        this.type = type;
    }
    MIOPredicateOperator.andPredicateOperatorType = function () {
        var op = new MIOPredicateOperator(MIOPredicateOperatorType.AND);
        return op;
    };
    MIOPredicateOperator.orPredicateOperatorType = function () {
        var op = new MIOPredicateOperator(MIOPredicateOperatorType.OR);
        return op;
    };
    return MIOPredicateOperator;
}());
var MIOPredicateItem = (function () {
    function MIOPredicateItem() {
        this.key = null;
        this.comparator = null;
        this.value = null;
    }
    MIOPredicateItem.prototype.setComparator = function (comparator) {
        if (comparator == "==")
            this.comparator = MIOPredicateComparatorType.Equal;
        else if (comparator == ">")
            this.comparator = MIOPredicateComparatorType.Greater;
        else if (comparator == "<")
            this.comparator = MIOPredicateComparatorType.Less;
        else if (comparator == "!=")
            this.comparator = MIOPredicateComparatorType.Not;
        else if (comparator.toLowerCase() == "contains")
            this.comparator = MIOPredicateComparatorType.Contains;
        else
            throw ("MIOPredicate: Invalid comparator!");
    };
    MIOPredicateItem.prototype.evaluateObject = function (object) {
        if (this.comparator == MIOPredicateComparatorType.Equal)
            return (object[this.key] == this.value);
        else if (this.comparator == MIOPredicateComparatorType.Not)
            return (object[this.key] != this.value);
        else if (this.comparator == MIOPredicateComparatorType.Less)
            return (object[this.key] < this.value);
        else if (this.comparator == MIOPredicateComparatorType.Greater)
            return (object[this.key] > this.value);
        if (this.comparator == MIOPredicateComparatorType.Contains) {
            var value = object[this.key];
            if (value == null)
                return false;
            value = value.toLowerCase();
            if (value.indexOf(this.value.toLowerCase()) > -1)
                return true;
            return false;
        }
    };
    return MIOPredicateItem;
}());
var MIOPredicate = (function (_super) {
    __extends(MIOPredicate, _super);
    function MIOPredicate() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.predicates = [];
        return _this;
    }
    MIOPredicate.predicateWithFormat = function (format) {
        var p = new MIOPredicate();
        p.initWithFormat(format);
        return p;
    };
    MIOPredicate.prototype.initWithFormat = function (format) {
        this._parse(format);
    };
    MIOPredicate.prototype._parse = function (format) {
        var token = "";
        var key = "";
        var cmp = "";
        var stepIndex = 0; // 0 -> Token, 1 -> operator, 2 -> value
        var lastCharIsSpace = false;
        for (var index = 0; index < format.length; index++) {
            var ch = format.charAt(index);
            if (ch == " ") {
                if (lastCharIsSpace == true)
                    continue;
                lastCharIsSpace = true;
                if (token.toLocaleLowerCase() == "and" || token == "&&") {
                    this.predicates.push(MIOPredicateOperator.andPredicateOperatorType());
                }
                else if (token.toLocaleLowerCase() == "or" || token == "||") {
                    this.predicates.push(MIOPredicateOperator.orPredicateOperatorType());
                }
                else if (token != "") {
                    stepIndex++;
                    if (stepIndex == 1)
                        key = token;
                    else if (stepIndex == 2)
                        cmp = token;
                    else if (stepIndex == 3) {
                        var i = new MIOPredicateItem();
                        i.key = key;
                        i.setComparator(cmp);
                        i.value = token;
                        this.predicates.push(i);
                        key = "";
                        cmp = "";
                        stepIndex = 0;
                    }
                }
                token = "";
            }
            else if (ch == "(") {
                // Create new predicate
                var string = "";
                index++;
                for (var count = index; count < format.length; count++, index++) {
                    var ch2 = format.charAt(index);
                    if (ch2 == ")") {
                        var p = MIOPredicate.predicateWithFormat(string);
                        this.predicates.push(p);
                        break;
                    }
                    else {
                        string += ch2;
                    }
                }
            }
            else if (ch == "\"") {
                index++;
                for (var count = index; count < format.length; count++, index++) {
                    var ch2 = format.charAt(index);
                    if (ch2 == "\"")
                        break;
                    else
                        token += ch2;
                }
                lastCharIsSpace = false;
            }
            else {
                token += ch;
                lastCharIsSpace = false;
            }
        }
        // Last check
        if (token.length > 0) {
            var i = new MIOPredicateItem();
            i.key = key;
            i.setComparator(cmp);
            i.value = token;
            this.predicates.push(i);
        }
    };
    MIOPredicate.prototype.evaluateObject = function (object) {
        var result = false;
        var op = null;
        var lastResult = null;
        for (var count = 0; count < this.predicates.length; count++) {
            var o = this.predicates[count];
            if (o instanceof MIOPredicate) {
                result = o.evaluateObject(object);
            }
            else if (o instanceof MIOPredicateItem) {
                result = o.evaluateObject(object);
            }
            else if (o instanceof MIOPredicateOperator) {
                op = o.type;
                lastResult = result;
                result = null;
            }
            if (op != null && result != null) {
                if (op == MIOPredicateOperatorType.AND) {
                    result = result && lastResult;
                    op = null;
                    if (result == false)
                        break;
                }
                else if (op == MIOPredicateOperatorType.OR) {
                    result = result || lastResult;
                    op = null;
                }
            }
        }
        return result;
    };
    return MIOPredicate;
}(MIOObject));
/**
 * Created by godshadow on 28/09/2016.
 */
/// <reference path="MIOObject.ts" />
var MIOSortDescriptor = (function (_super) {
    __extends(MIOSortDescriptor, _super);
    function MIOSortDescriptor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.key = null;
        _this.ascending = false;
        return _this;
    }
    MIOSortDescriptor.sortDescriptorWithKey = function (key, ascending) {
        var sd = new MIOSortDescriptor();
        sd.initWithKey(key, ascending);
        return sd;
    };
    MIOSortDescriptor.prototype.initWithKey = function (key, ascending) {
        this.key = key;
        this.ascending = ascending;
    };
    return MIOSortDescriptor;
}(MIOObject));
/**
 * Created by godshadow on 12/4/16.
 */
/// <reference path="MIOCore.ts" />
/// <reference path="MIOObject.ts" />
/// <reference path="MIOURLConnection.ts" />
/// <reference path="MIONotificationCenter.ts" />
/// <reference path="MIOPredicate.ts" />
/// <reference path="MIOSortDescriptor.ts" />
var MIOFetchRequest = (function (_super) {
    __extends(MIOFetchRequest, _super);
    function MIOFetchRequest() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.entityName = null;
        _this.predicate = null;
        _this.sortDescriptors = null;
        return _this;
    }
    MIOFetchRequest.fetchRequestWithEntityName = function (name) {
        var fetch = new MIOFetchRequest();
        fetch.initWithEntityName(name);
        return fetch;
    };
    MIOFetchRequest.prototype.initWithEntityName = function (name) {
        this.entityName = name;
    };
    return MIOFetchRequest;
}(MIOObject));
var MIOEntityDescription = (function (_super) {
    __extends(MIOEntityDescription, _super);
    function MIOEntityDescription() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.entityName = null;
        return _this;
    }
    MIOEntityDescription.insertNewObjectForEntityForName = function (entityName, context) {
        var object = context.insertNewObjectForEntityName(entityName);
        return object;
    };
    return MIOEntityDescription;
}(MIOObject));
var MIOManagedObject = (function (_super) {
    __extends(MIOManagedObject, _super);
    function MIOManagedObject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.entityName = null;
        _this.managedObjectContext = null;
        _this._trackChanges = {};
        return _this;
    }
    MIOManagedObject.prototype.setValue = function (propertyName, value) {
        var oldValue = this.getValue(propertyName); //this[propertyName];
        if (oldValue != value) {
            this._trackChanges[propertyName] = value;
            if (this.managedObjectContext != null)
                this.managedObjectContext.updateObject(this);
        }
    };
    MIOManagedObject.prototype.getValue = function (propertyName) {
        var value = this._trackChanges[propertyName];
        if (value == null)
            value = this[propertyName];
        return value;
    };
    Object.defineProperty(MIOManagedObject.prototype, "hasChanges", {
        get: function () {
            return (Object.keys(this._trackChanges).length > 0);
        },
        enumerable: true,
        configurable: true
    });
    MIOManagedObject.prototype.getChanges = function () {
        return this._trackChanges;
    };
    MIOManagedObject.prototype.saveChanges = function () {
        for (var propertyName in this._trackChanges) {
            this[propertyName] = this._trackChanges[propertyName];
        }
        this._trackChanges = {};
    };
    MIOManagedObject.prototype.discardChanges = function () {
        this._trackChanges = {};
    };
    return MIOManagedObject;
}(MIOObject));
var MIOManagedObjectContext = (function (_super) {
    __extends(MIOManagedObjectContext, _super);
    function MIOManagedObjectContext() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._objects = {};
        _this._insertedObjects = {};
        _this._deletedObjects = {};
        _this._updateObjects = {};
        _this._persistentStoreCoordinator = null;
        return _this;
    }
    MIOManagedObjectContext.prototype.insertNewObjectForEntityName = function (entityName) {
        var obj = MIOClassFromString(entityName);
        obj.entityName = entityName;
        obj.managedObjectContext = this;
        this.insertNewObject(obj);
        return obj;
    };
    MIOManagedObjectContext.prototype.insertNewObject = function (obj) {
        obj.saveChanges();
        var entityName = obj.entityName;
        var array = this._insertedObjects[entityName];
        if (array == null) {
            array = [];
            array.push(obj);
            this._insertedObjects[entityName] = array;
        }
        else {
            array.push(obj);
        }
    };
    MIOManagedObjectContext.prototype.updateObject = function (obj) {
        //obj.saveChanges();
        var entityName = obj.entityName;
        var array = this._updateObjects[entityName];
        if (array == null) {
            array = [];
            array.push(obj);
            this._updateObjects[entityName] = array;
        }
        else {
            var index = array.indexOf(obj);
            if (index == -1)
                array.push(obj);
        }
    };
    MIOManagedObjectContext.prototype.removeAllObjectsForEntityName = function (entityName) {
        var objs = this._objects[entityName];
        if (objs != null)
            objs.length = 0;
    };
    MIOManagedObjectContext.prototype.executeFetch = function (request) {
        var objs = this._objects[request.entityName];
        objs = this._filterObjects(objs, request.predicate);
        objs = this._sortObjects(objs, request.sortDescriptors);
        return objs;
    };
    MIOManagedObjectContext.prototype._filterObjects = function (objs, predicate) {
        if (objs == null)
            return [];
        var resultObjects = null;
        if (predicate == null)
            resultObjects = objs;
        else {
            resultObjects = objs.filter(function (obj) {
                var result = predicate.evaluateObject(obj);
                if (result)
                    return obj;
            });
        }
        return resultObjects;
    };
    MIOManagedObjectContext.prototype._sortObjects = function (objs, sortDescriptors) {
        if (sortDescriptors == null)
            return objs;
        var instance = this;
        var resultObjects = objs.sort(function (a, b) {
            return instance._sortObjects2(a, b, sortDescriptors, 0);
        });
        return resultObjects;
    };
    MIOManagedObjectContext.prototype._sortObjects2 = function (a, b, sortDescriptors, index) {
        if (index >= sortDescriptors.length)
            return 0;
        var sd = sortDescriptors[index];
        var key = sd.key;
        if (a[key] == b[key]) {
            if (a[key] == b[key]) {
                return this._sortObjects2(a, b, sortDescriptors, ++index);
            }
            else if (a[key] < b[key])
                return sd.ascending ? -1 : 1;
            else
                return sd.ascending ? 1 : -1;
        }
        else if (a[key] < b[key])
            return sd.ascending ? -1 : 1;
        else
            return sd.ascending ? 1 : -1;
    };
    MIOManagedObjectContext.prototype.saveContext = function () {
        // Inserted objects
        for (var key in this._insertedObjects) {
            var objs = this._insertedObjects[key];
            var array = this._objects[key];
            if (array == null) {
                array = [];
                this._objects[key] = array;
            }
            array.push.apply(array, objs);
            MIONotificationCenter.defaultCenter().postNotification("MIO" + key, objs, "INSERTED");
        }
        // Clear array
        this._insertedObjects = [];
        // Update objects
        for (var key in this._updateObjects) {
            var objs = this._updateObjects[key];
            // save changes
            for (var i = 0; i < objs.length; i++) {
                var o = objs[i];
                o.saveChanges();
            }
            MIONotificationCenter.defaultCenter().postNotification("MIO" + key, objs, "UPDATED");
        }
        // Clear array
        this._updateObjects = [];
    };
    MIOManagedObjectContext.prototype.queryObject = function (entityName, predicateFormat) {
        var request = MIOFetchRequest.fetchRequestWithEntityName(entityName);
        if (predicateFormat != null)
            request.predicate = MIOPredicate.predicateWithFormat(predicateFormat);
        return this.executeFetch(request);
    };
    MIOManagedObjectContext.prototype.setPersistentStoreCoordinator = function (coordinator) {
    };
    return MIOManagedObjectContext;
}(MIOObject));
var MIOManagedObjectModel = (function (_super) {
    __extends(MIOManagedObjectModel, _super);
    function MIOManagedObjectModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MIOManagedObjectModel;
}(MIOObject));
var MIOPersistentStoreCoordinator = (function (_super) {
    __extends(MIOPersistentStoreCoordinator, _super);
    function MIOPersistentStoreCoordinator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._managedObjectModel = null;
        return _this;
    }
    Object.defineProperty(MIOPersistentStoreCoordinator.prototype, "managedObjectModel", {
        get: function () {
            if (this._managedObjectModel != null)
                return this._managedObjectModel;
            return this._managedObjectModel;
        },
        enumerable: true,
        configurable: true
    });
    return MIOPersistentStoreCoordinator;
}(MIOObject));
var MIOPersistentStore = (function (_super) {
    __extends(MIOPersistentStore, _super);
    function MIOPersistentStore() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MIOPersistentStore;
}(MIOObject));
/**
 * Created by godshadow on 12/4/16.
 */
/// <reference path="MIOObject.ts" />
/// <reference path="MIOPredicate.ts" />
/// <reference path="MIONotificationCenter.ts" />
/// <reference path="MIOManagedObjectContext.ts" />
var MIOFetchSection = (function (_super) {
    __extends(MIOFetchSection, _super);
    function MIOFetchSection() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.objects = [];
        return _this;
    }
    MIOFetchSection.prototype.numberOfObjects = function () {
        return this.objects.length;
    };
    return MIOFetchSection;
}(MIOObject));
var MIOFetchedResultsController = (function (_super) {
    __extends(MIOFetchedResultsController, _super);
    function MIOFetchedResultsController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._delegate = null;
        _this.sections = [];
        _this.resultObjects = [];
        _this.objects = [];
        _this._request = null;
        _this._moc = null;
        _this._sectionNameKeyPath = null;
        return _this;
    }
    MIOFetchedResultsController.prototype.initWithFetchRequest = function (request, managedObjectContext, sectionNameKeyPath) {
        this._request = request;
        this._moc = managedObjectContext;
        this._sectionNameKeyPath = sectionNameKeyPath;
    };
    Object.defineProperty(MIOFetchedResultsController.prototype, "delegate", {
        get: function () {
            return this._delegate;
        },
        set: function (delegate) {
            this._delegate = delegate;
            // TODO: Add and remove notification observer
            if (delegate != null) {
                MIONotificationCenter.defaultCenter().addObserver(this, "MIO" + this._request.entityName, function (notification) {
                    var array = notification.object;
                    this.updateContent(array);
                });
            }
            else {
                MIONotificationCenter.defaultCenter().removeObserver(this, "MIO" + this._request.entityName);
            }
        },
        enumerable: true,
        configurable: true
    });
    MIOFetchedResultsController.prototype.performFetch = function () {
        this.objects = this._moc.executeFetch(this._request);
        this.resultObjects = null;
        if (this.objects.length == 0)
            this.resultObjects = this.objects;
        else {
            this.resultObjects = this.objects;
            this._splitInSections();
        }
    };
    MIOFetchedResultsController.prototype.updateContent = function (objects) {
        //this.objects = objects;
        this.objects = this._moc.executeFetch(this._request);
        this.resultObjects = this.objects;
        this._splitInSections();
        this._notify();
    };
    MIOFetchedResultsController.prototype._notify = function () {
        if (this._delegate != null) {
            if (typeof this._delegate.controllerWillChangeContent === "function")
                this._delegate.controllerWillChangeContent(this);
            for (var sectionIndex = 0; sectionIndex < this.sections.length; sectionIndex++) {
                if (typeof this._delegate.didChangeSection === "function")
                    this._delegate.didChangeSection(this, sectionIndex, "insert");
                if (typeof this._delegate.didChangeObject === "function") {
                    var section = this.sections[sectionIndex];
                    var items = section.objects;
                    for (var index = 0; index < items.length; index++) {
                        var obj = items[index];
                        this._delegate.didChangeObject(this, index, "insert", obj);
                    }
                }
            }
            if (typeof this._delegate.controllerDidChangeContent === "function")
                this._delegate.controllerDidChangeContent(this);
        }
    };
    MIOFetchedResultsController.prototype._splitInSections = function () {
        this.sections = [];
        if (this._sectionNameKeyPath == null) {
            var section = new MIOFetchSection();
            section.objects = this.resultObjects;
            this.sections.push(section);
        }
        else {
            var currentSection = null;
            var currentSectionKeyPathValue = "";
            for (var index = 0; index < this.resultObjects.length; index++) {
                var obj = this.resultObjects[index];
                var value = obj[this._sectionNameKeyPath];
                if (currentSectionKeyPathValue != value) {
                    currentSection = new MIOFetchSection();
                    this.sections.push(currentSection);
                    currentSectionKeyPathValue = value;
                }
                currentSection.objects.push(obj);
            }
        }
    };
    MIOFetchedResultsController.prototype.objectAtIndexPath = function (row, section) {
        var section = this.sections[section];
        var object = section.objects[row];
        return object;
    };
    return MIOFetchedResultsController;
}(MIOObject));
/**
 * Created by godshadow on 11/3/16.
 */
/// <reference path="MIOView.ts" />
var MIOLabel = (function (_super) {
    __extends(MIOLabel, _super);
    function MIOLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._textLayer = null;
        _this.autoAdjustFontSize = "none";
        _this.autoAdjustFontSizeValue = 4;
        return _this;
    }
    MIOLabel.prototype.init = function () {
        _super.prototype.init.call(this);
        this.layer.style.background = "";
        this._setupLayer();
    };
    MIOLabel.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this._textLayer = MIOLayerGetFirstElementWithTag(this.layer, "SPAN");
        this._setupLayer();
    };
    MIOLabel.prototype._setupLayer = function () {
        if (this._textLayer == null) {
            this.layer.innerHTML = "";
            this._textLayer = document.createElement("span");
            this._textLayer.style.top = "3px";
            this._textLayer.style.left = "3px";
            this._textLayer.style.right = "3px";
            this._textLayer.style.bottom = "3px";
            //this._textLayer.style.font = "inherit";
            //this._textLayer.style.fontSize = "inherit";
            this.layer.appendChild(this._textLayer);
        }
    };
    MIOLabel.prototype.layout = function () {
        _super.prototype.layout.call(this);
        //var h = this.getHeight();
        //this.textLayer.style.lineHeight = h + "px";
        if (this.autoAdjustFontSize == "width") {
            var w = this.getWidth();
            var size = w / this.autoAdjustFontSizeValue;
            this.layer.style.fontSize = size + 'px';
            var maxSize = this.getHeight();
            if (size > maxSize)
                this.layer.style.fontSize = maxSize + 'px';
            else
                this.layer.style.fontSize = size + 'px';
        }
        else if (this.autoAdjustFontSize == "height") {
            var h = this.getHeight();
            var size = h / this.autoAdjustFontSizeValue;
            this.layer.style.fontSize = size + 'px';
            var maxSize = this.getHeight();
            if (size > maxSize)
                this.layer.style.fontSize = maxSize + 'px';
            else
                this.layer.style.fontSize = size + 'px';
        }
    };
    MIOLabel.prototype.setText = function (text) {
        this.text = text;
    };
    Object.defineProperty(MIOLabel.prototype, "text", {
        set: function (text) {
            this._textLayer.innerHTML = text != null ? text : "";
        },
        enumerable: true,
        configurable: true
    });
    MIOLabel.prototype.setTextAlignment = function (alignment) {
        this.layer.style.textAlign = alignment;
    };
    MIOLabel.prototype.setHightlighted = function (value) {
        if (value == true) {
            this._textLayer.classList.add("label_highlighted_color");
        }
        else {
            this._textLayer.classList.remove("label_highlighted_color");
        }
    };
    MIOLabel.prototype.setTextRGBColor = function (r, g, b) {
        var value = "rgb(" + r + ", " + g + ", " + b + ")";
        this._textLayer.style.color = value;
    };
    MIOLabel.prototype.setFontSize = function (size) {
        this._textLayer.style.fontSize = size + "px";
    };
    MIOLabel.prototype.setFontStyle = function (style) {
        this._textLayer.style.fontWeight = style;
    };
    MIOLabel.prototype.setFontFamily = function (fontFamily) {
        this._textLayer.style.fontFamily = fontFamily;
    };
    return MIOLabel;
}(MIOView));
/**
 * Created by godshadow on 22/3/16.
 */
/// <reference path="MIOView.ts" />
/// <reference path="MIOLabel.ts" />
/// <reference path="MIOBundle.ts" />
var MIOTableViewCellStyle;
(function (MIOTableViewCellStyle) {
    MIOTableViewCellStyle[MIOTableViewCellStyle["Default"] = 0] = "Default";
})(MIOTableViewCellStyle || (MIOTableViewCellStyle = {}));
var MIOTableViewCellAccessoryType;
(function (MIOTableViewCellAccessoryType) {
    MIOTableViewCellAccessoryType[MIOTableViewCellAccessoryType["None"] = 0] = "None";
    MIOTableViewCellAccessoryType[MIOTableViewCellAccessoryType["Detail"] = 1] = "Detail";
    MIOTableViewCellAccessoryType[MIOTableViewCellAccessoryType["DetailDisclosoure"] = 2] = "DetailDisclosoure";
    MIOTableViewCellAccessoryType[MIOTableViewCellAccessoryType["Checkmark"] = 3] = "Checkmark";
})(MIOTableViewCellAccessoryType || (MIOTableViewCellAccessoryType = {}));
var MIOTableViewCellSeparatorStyle;
(function (MIOTableViewCellSeparatorStyle) {
    MIOTableViewCellSeparatorStyle[MIOTableViewCellSeparatorStyle["None"] = 0] = "None";
    MIOTableViewCellSeparatorStyle[MIOTableViewCellSeparatorStyle["SingleLine"] = 1] = "SingleLine";
    MIOTableViewCellSeparatorStyle[MIOTableViewCellSeparatorStyle["SingleLineEtched"] = 2] = "SingleLineEtched"; // TODO
})(MIOTableViewCellSeparatorStyle || (MIOTableViewCellSeparatorStyle = {}));
var MIOTableViewCell = (function (_super) {
    __extends(MIOTableViewCell, _super);
    function MIOTableViewCell() {
        var _this = _super.call(this, MIOViewGetNextLayerID("tableview_cell")) || this;
        _this.selected = false;
        _this.textLabel = null;
        _this.accessoryType = MIOTableViewCellAccessoryType.None;
        _this.accesoryView = null;
        _this.separatorStyle = MIOTableViewCellSeparatorStyle.SingleLine;
        _this._target = null;
        _this._onClickFn = null;
        _this._onDblClickFn = null;
        _this._row = 0;
        _this._section = 0;
        return _this;
    }
    MIOTableViewCell.prototype.initWithStyle = function (style) {
        _super.prototype.init.call(this);
        if (style == MIOTableViewCellStyle.Default) {
            this.textLabel = new MIOLabel(MIOViewGetNextLayerID("tableview_cell_label"));
            this.textLabel.init();
            this.textLabel.layer.style.left = "10px";
            this.textLabel.layer.style.top = "10px";
            this.textLabel.layer.style.right = "10px";
            this.textLabel.layer.style.bottom = "10px";
            this.addSubview(this.textLabel);
            this.layer.style.height = "44px";
        }
        this._setupLayer();
    };
    MIOTableViewCell.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this._setupLayer();
    };
    MIOTableViewCell.prototype._setupLayer = function () {
        this.layer.style.background = "";
        var instance = this;
        this.layer.classList.add("tableviewcell_deselected_color");
        this.layer.onclick = function () {
            if (instance._onClickFn != null)
                instance._onClickFn.call(instance._target, instance);
        };
        this.layer.ondblclick = function () {
            if (instance._onDblClickFn != null)
                instance._onDblClickFn.call(instance._target, instance);
        };
    };
    MIOTableViewCell.prototype.setAccessoryType = function (type) {
        if (type == this.accessoryType)
            return;
        if (this.accesoryView == null) {
            this.textLabel.layer.style.right = "25px";
            var layer = document.createElement("div");
            layer.style.position = "absolute";
            layer.style.top = "15px";
            layer.style.right = "5px";
            layer.style.width = "15px";
            layer.style.height = "15px";
            this.accesoryView = new MIOView("accessory_view");
            this.accesoryView.initWithLayer(layer);
            this.addSubview(this.accesoryView);
        }
        if (type == MIOTableViewCellAccessoryType.Checkmark) {
            this.accesoryView.layer.classList.add("tableviewcell_accessory_checkmark");
        }
        else if (type == MIOTableViewCellAccessoryType.None) {
            if (this.accessoryType == MIOTableViewCellAccessoryType.Checkmark)
                this.accesoryView.layer.classList.remove("tableviewcell_accessory_checkmark");
        }
        this.accessoryType = type;
    };
    MIOTableViewCell.prototype.setPaddingIndex = function (value) {
        var offset = (value + 1) * 10;
        this.textLabel.setX(offset);
    };
    MIOTableViewCell.prototype.setHeight = function (h) {
        _super.prototype.setHeight.call(this, h);
        var offsetY = (h - 15) / 2;
        if (this.accesoryView != null) {
            this.accesoryView.layer.style.top = offsetY + "px";
        }
    };
    MIOTableViewCell.prototype.setSelected = function (value) {
        this.willChangeValue("selected");
        this.selected = value;
        if (value == true) {
            this.layer.classList.remove("tableviewcell_deselected_color");
            this.layer.classList.add("tableviewcell_selected_color");
        }
        else {
            this.layer.classList.remove("tableviewcell_selected_color");
            this.layer.classList.add("tableviewcell_deselected_color");
        }
        this._setHightlightedSubviews(value);
        this.didChangeValue("selected");
    };
    MIOTableViewCell.prototype._setHightlightedSubviews = function (value) {
        for (var count = 0; count < this.subviews.length; count++) {
            var v = this.subviews[count];
            if (v instanceof MIOLabel)
                v.setHightlighted(value);
        }
    };
    return MIOTableViewCell;
}(MIOView));
var MIOTableViewSection = (function (_super) {
    __extends(MIOTableViewSection, _super);
    function MIOTableViewSection() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.header = null;
        _this.cells = [];
        return _this;
    }
    return MIOTableViewSection;
}(MIOObject));
var MIOTableView = (function (_super) {
    __extends(MIOTableView, _super);
    function MIOTableView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataSource = null;
        _this.delegate = null;
        _this.sections = [];
        _this.headerView = null;
        _this.footerView = null;
        _this.headerHeight = 0;
        _this.footerHeight = 0;
        _this.sectionHeaderHeight = 23;
        _this.sectionFooterHeight = 23;
        _this.allowsMultipleSelection = false;
        _this.selectedCellRow = -1;
        _this.selectedCellSection = -1;
        _this._indexPathsForSelectedRows = [];
        _this._cellPrototypesCount = 0;
        _this._cellPrototypesDownloadedCount = 0;
        _this._isDownloadingCells = false;
        _this._needReloadData = false;
        _this._cellPrototypes = {};
        return _this;
    }
    MIOTableView.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        // Check if we have prototypes
        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var subLayer = this.layer.childNodes[index];
                if (subLayer.tagName != "DIV")
                    continue;
                if (subLayer.getAttribute("data-cell-identifier") != null) {
                    this._addCellPrototypeWithLayer(subLayer);
                    subLayer.style.display = "none";
                }
                else if (subLayer.getAttribute("data-tableview-header") != null) {
                    this._addHeaderWithLayer(subLayer);
                }
                else if (subLayer.getAttribute("data-tableview-footer") != null) {
                    this._addFooterWithLayer(subLayer);
                }
            }
        }
    };
    MIOTableView.prototype._addHeaderWithLayer = function (subLayer) {
        this.headerView = new MIOView();
        this.headerView.initWithLayer(subLayer);
        //var h = this.headerView.getHeight();
        //var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        //this.headerView.setFrame(MIOFrame.frameWithRect(0, 0, size.width, size.height));
    };
    MIOTableView.prototype._addFooterWithLayer = function (subLayer) {
        this.footerView = new MIOView();
        this.footerView.initWithLayer(subLayer);
        // var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        // this.footerView.setFrame(MIOFrame.frameWithRect(0, 0, size.width, size.height));
    };
    MIOTableView.prototype._addCellPrototypeWithLayer = function (subLayer) {
        var cellIdentifier = subLayer.getAttribute("data-cell-identifier");
        var cellClassname = subLayer.getAttribute("data-class");
        if (cellClassname == null)
            cellClassname = "MIOCollectionViewCell";
        var item = {};
        item["class"] = cellClassname;
        item["layer"] = subLayer;
        var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        if (size != null)
            item["size"] = size;
        // var bg = window.getComputedStyle( subLayer ,null).getPropertyValue('background-color');
        // if (bg != null) item["bg"] = bg;
        this._cellPrototypes[cellIdentifier] = item;
    };
    MIOTableView.prototype.addCellPrototypeWithIdentifier = function (identifier, elementID, url, classname) {
        var item = {};
        this._isDownloadingCells = true;
        this._cellPrototypesCount++;
        item["url"] = url;
        item["id"] = elementID;
        if (classname != null)
            item["class"] = classname;
        this._cellPrototypes[identifier] = item;
        var mainBundle = MIOBundle.mainBundle();
        mainBundle.loadLayoutFromURL(url, elementID, this, function (data) {
            var result = data;
            var cssFiles = result.styles;
            var baseURL = url.substring(0, url.lastIndexOf('/')) + "/";
            for (var index = 0; index < cssFiles.length; index++)
                MIOCoreLoadStyle(baseURL + cssFiles[index]);
            var domParser = new DOMParser();
            var items = domParser.parseFromString(result.layout, "text/html");
            var layer = items.getElementById(elementID);
            //cell.localizeSubLayers(layer.childNodes);
            item["layer"] = layer;
            this._cellPrototypes[identifier] = item;
            this._cellPrototypesDownloadedCount++;
            if (this._cellPrototypesDownloadedCount == this._cellPrototypesCount) {
                this._isDownloadingCells = false;
                if (this._needReloadData)
                    this.reloadData();
            }
            /*            var cells = item["cells"];
                        if (cells != null)
                        {
                            for (var index = 0; index < cells.length; index++)
                            {
                                var cell = cells[index];
                                cell.addSubLayersFromLayer(layer.cloneNode(true));
                                cell.awakeFromHTML();
                            }
                        }
                        delete item["cells"];*/
        });
    };
    MIOTableView.prototype.dequeueReusableCellWithIdentifier = function (identifier) {
        var item = this._cellPrototypes[identifier];
        //instance creation here
        var className = item["class"];
        var cell = Object.create(window[className].prototype);
        cell.constructor.apply(cell);
        //cell.init();
        var layer = item["layer"];
        if (layer != null) {
            var newLayer = layer.cloneNode(true);
            newLayer.style.display = "";
            var size = item["size"];
            // if (size != null) {
            //     cell.setWidth(size.width);
            //     cell.setHeight(size.height);
            // }
            // var bg = item["bg"];
            // if (bg != null) {
            //     cell.layer.style.background = bg;
            // }
            cell.initWithLayer(newLayer);
            //cell._addLayerToDOM();
            cell.awakeFromHTML();
        }
        else {
            var cells = item["cells"];
            if (cells == null) {
                cells = [];
                item["cells"] = cells;
            }
            cells.push(cell);
        }
        return cell;
    };
    MIOTableView.prototype.setHeaderView = function (view) {
        this.headerView = view;
        this.addSubview(this.headerView);
    };
    MIOTableView.prototype.reloadData = function () {
        // Remove all subviews
        for (var index = 0; index < this.sections.length; index++) {
            var sectionView = this.sections[index];
            if (sectionView.header != null)
                sectionView.header.removeFromSuperview();
            for (var count = 0; count < sectionView.cells.length; count++) {
                var cell = sectionView.cells[count];
                cell.removeFromSuperview();
            }
        }
        // Is ready to reaload or the are still donwloading
        if (this._isDownloadingCells == true) {
            this._needReloadData = true;
            return;
        }
        this.sections = [];
        this._indexPathsForSelectedRows = [];
        var sections = this.dataSource.numberOfSections(this);
        for (var sectionIndex = 0; sectionIndex < sections; sectionIndex++) {
            var section = new MIOTableViewSection();
            section.init();
            this.sections.push(section);
            this._indexPathsForSelectedRows[sectionIndex] = [];
            var rows = this.dataSource.numberOfRowsInSection(this, sectionIndex);
            if (typeof this.dataSource.titleForHeaderInSection === "function") {
                var title = this.dataSource.titleForHeaderInSection(this, sectionIndex);
                var header = new MIOView();
                header.init();
                header.setHeight(this.sectionHeaderHeight);
                header.layer.style.background = "";
                header.layer.classList.add("tableview_header");
                section.header = header;
                var titleLabel = new MIOLabel();
                titleLabel.init();
                titleLabel.layer.style.background = "";
                titleLabel.layer.classList.add("tableview_header_title");
                titleLabel.text = title;
                header.addSubview(titleLabel);
                this.addSubview(header);
            }
            else if (typeof this.dataSource.viewForHeaderInSection === "function") {
                var view = this.dataSource.viewForHeaderInSection(this, sectionIndex);
                section.header = view;
                this.addSubview(view);
            }
            for (var index = 0; index < rows; index++) {
                var cell = this.dataSource.cellAtIndexPath(this, index, sectionIndex);
                cell.addObserver(this, "selected");
                section.cells.push(cell);
                this.addSubview(cell);
                cell._target = this;
                cell._onClickFn = this.cellOnClickFn;
                cell._onDblClickFn = this.cellOnDblClickFn;
                cell._row = index;
                cell._section = sectionIndex;
            }
        }
        this.layout();
    };
    MIOTableView.prototype.layout = function () {
        _super.prototype.layout.call(this);
        if (this.sections == null)
            return;
        var y = 0;
        var w = this.getWidth();
        if (this.headerView != null) {
            this.headerView.setY(y);
            if (this.headerHeight > 0) {
                this.headerView.setHeight(this.headerHeight);
                y += this.headerHeight;
            }
            else
                y += this.headerView.getHeight() + 1;
        }
        for (var count = 0; count < this.sections.length; count++) {
            var section = this.sections[count];
            if (section.header != null) {
                section.header.setY(y);
                if (this.sectionHeaderHeight > 0) {
                    section.header.setHeight(this.sectionHeaderHeight);
                    y += this.sectionHeaderHeight;
                }
                else
                    y += section.header.getHeight();
            }
            for (var index = 0; index < section.cells.length; index++) {
                var h = 0;
                if (this.delegate != null) {
                    if (typeof this.delegate.heightForRowAtIndexPath === "function")
                        h = this.delegate.heightForRowAtIndexPath(this, index, section);
                }
                var cell = section.cells[index];
                cell.setY(y);
                if (h > 0)
                    cell.setHeight(h);
                if (h == 0)
                    h = cell.getHeight();
                if (h == 0) {
                    h = 44;
                    cell.setHeight(h);
                }
                y += h;
                if (cell.separatorStyle == MIOTableViewCellSeparatorStyle.SingleLine)
                    y += 1;
                else if (cell.separatorStyle == MIOTableViewCellSeparatorStyle.SingleLineEtched)
                    y += 2;
            }
        }
        if (this.footerView != null) {
            this.footerView.setY(y);
            if (this.footerHeight > 0) {
                this.footerView.setHeight(this.footerHeight);
                y += this.footerHeight;
            }
            else
                y += this.footerView.getHeight() + 1;
        }
        this.layer.scrollHeight = y;
    };
    MIOTableView.prototype.cellOnClickFn = function (cell) {
        var index = cell._row;
        var section = cell._section;
        var canSelectCell = true;
        if (!(this.selectedCellRow == index && this.selectedCellSection == section)) {
            if (this.delegate != null) {
                if (typeof this.delegate.canSelectCellAtIndexPath === "function")
                    canSelectCell = this.delegate.canSelectCellAtIndexPath(this, index, section);
            }
            if (canSelectCell == false)
                return;
            if (!this.allowsMultipleSelection) {
                if (this.selectedCellRow > -1 && this.selectedCellSection > -1)
                    this.deselectCellAtIndexPath(this.selectedCellRow, this.selectedCellSection);
            }
            this.selectedCellRow = index;
            this.selectedCellSection = section;
            this._selectCell(cell);
        }
        if (this.delegate != null) {
            if (typeof this.delegate.didSelectCellAtIndexPath === "function")
                this.delegate.didSelectCellAtIndexPath(this, index, section);
        }
    };
    MIOTableView.prototype.cellOnDblClickFn = function (cell) {
        var index = cell._row;
        var section = cell._section;
        var canSelectCell = true;
        if (this.delegate != null) {
            if (typeof this.delegate.canSelectCellAtIndexPath === "function")
                canSelectCell = this.delegate.canSelectCellAtIndexPath(this, index, section);
        }
        if (canSelectCell == false)
            return;
        if (this.selectedCellRow == index && this.selectedCellSection == section) {
            if (this.delegate != null)
                if (typeof this.delegate.didMakeDoubleClick === "function")
                    this.delegate.didMakeDoubleClick(this, index, section);
            return;
        }
        if (this.selectedCellRow > -1 && this.selectedCellSection > -1)
            this.deselectCellAtIndexPath(this.selectedCellRow, this.selectedCellSection);
        this.selectedCellRow = index;
        this.selectedCellSection = section;
        this._selectCell(cell);
        if (this.delegate != null) {
            if (typeof this.delegate.didSelectCellAtIndexPath === "function")
                this.delegate.didSelectCellAtIndexPath(this, index, section);
        }
        if (this.delegate != null)
            if (typeof this.delegate.didMakeDoubleClick === "function")
                this.delegate.didMakeDoubleClick(this, index, section);
    };
    // get indexPathsForSelectedRows()
    // {
    //     var selected = [];
    //
    //     this._indexPathsForSelectedRows.forEach(function (rows, section) {
    //         rows.forEach(function (row, index) {
    //             selected.push({'section': section, 'row': row});
    //         }, selected, section);
    //     }, selected);
    //
    //     return selected;
    // }
    MIOTableView.prototype.cellAtIndexPath = function (row, section) {
        var s = this.sections[section];
        var c = s.cells[row];
        return c;
    };
    MIOTableView.prototype.indexPathForCell = function (cell) {
        //TODO
        return null;
    };
    MIOTableView.prototype._selectCell = function (cell) {
        cell.setSelected(true);
    };
    MIOTableView.prototype.selectCellAtIndexPath = function (row, section) {
        this.selectedCellRow = row;
        this.selectedCellSection = section;
        var cell = this.sections[section].cells[row];
        this._selectCell(cell);
    };
    MIOTableView.prototype._deselectCell = function (cell) {
        cell.setSelected(false);
    };
    MIOTableView.prototype.deselectCellAtIndexPath = function (row, section) {
        this.selectedCellRow = -1;
        this.selectedCellSection = -1;
        var cell = this.sections[section].cells[row];
        this._deselectCell(cell);
    };
    return MIOTableView;
}(MIOView));
/**
 * Created by godshadow on 09/11/2016.
 */
/// <reference path="MIOView.ts" />
/// <reference path="MIOCoreTypes.ts" />
var MIOCollectionViewLayout = (function () {
    function MIOCollectionViewLayout() {
        this.paddingTop = 0;
        this.paddingLeft = 0;
        this.paddingRight = 0;
        this.spaceX = 0;
        this.spaceY = 0;
    }
    return MIOCollectionViewLayout;
}());
var MIOCollectionViewFlowLayout = (function (_super) {
    __extends(MIOCollectionViewFlowLayout, _super);
    function MIOCollectionViewFlowLayout() {
        var _this = _super.call(this) || this;
        _this.paddingTop = 10;
        _this.paddingLeft = 0;
        _this.paddingRight = 0;
        _this.spaceX = 10;
        _this.spaceY = 10;
        return _this;
    }
    return MIOCollectionViewFlowLayout;
}(MIOCollectionViewLayout));
var MIOCollectionViewCell = (function (_super) {
    __extends(MIOCollectionViewCell, _super);
    function MIOCollectionViewCell() {
        var _this = _super.call(this, MIOViewGetNextLayerID("collectionview_cell")) || this;
        _this._target = null;
        _this._onClickFn = null;
        _this._index = null;
        _this._section = null;
        _this.selected = false;
        return _this;
    }
    MIOCollectionViewCell.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this._setupLayer();
    };
    MIOCollectionViewCell.prototype._setupLayer = function () {
        var instance = this;
        this.layer.addEventListener("click", function (e) {
            e.stopPropagation();
            if (instance._onClickFn != null)
                instance._onClickFn.call(instance._target, instance);
        });
    };
    MIOCollectionViewCell.prototype.setSelected = function (value) {
        this.willChangeValue("selected");
        this.selected = value;
        this.didChangeValue("selected");
    };
    return MIOCollectionViewCell;
}(MIOView));
var MIOCollectionViewSection = (function (_super) {
    __extends(MIOCollectionViewSection, _super);
    function MIOCollectionViewSection() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.header = null;
        _this.footer = null;
        _this.cells = [];
        return _this;
    }
    return MIOCollectionViewSection;
}(MIOObject));
var MIOCollectionView = (function (_super) {
    __extends(MIOCollectionView, _super);
    function MIOCollectionView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataSource = null;
        _this.delegate = null;
        _this._collectionViewLayout = null;
        _this._cellPrototypes = {};
        _this._supplementaryViews = {};
        _this._sections = [];
        _this.selectedCellIndex = -1;
        _this.selectedCellSection = -1;
        return _this;
    }
    Object.defineProperty(MIOCollectionView.prototype, "collectionViewLayout", {
        get: function () {
            if (this._collectionViewLayout == null)
                this._collectionViewLayout = new MIOCollectionViewFlowLayout();
            return this._collectionViewLayout;
        },
        set: function (layout) {
            //TODO: Set animations for changing layout
            this._collectionViewLayout = layout;
        },
        enumerable: true,
        configurable: true
    });
    MIOCollectionView.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        // Check if we have prototypes
        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var subLayer = this.layer.childNodes[index];
                if (subLayer.tagName != "DIV")
                    continue;
                if (subLayer.getAttribute("data-cell-identifier") != null) {
                    this._addCellPrototypeWithLayer(subLayer);
                    subLayer.style.display = "none";
                }
                else if (subLayer.getAttribute("data-supplementary-view-identifier") != null) {
                    this._addSupplementaryViewPrototypeWithLayer(subLayer);
                    subLayer.style.display = "none";
                }
            }
        }
    };
    MIOCollectionView.prototype._addCellPrototypeWithLayer = function (subLayer) {
        var cellIdentifier = subLayer.getAttribute("data-cell-identifier");
        var cellClassname = subLayer.getAttribute("data-class");
        if (cellClassname == null)
            cellClassname = "MIOCollectionViewCell";
        var item = {};
        item["class"] = cellClassname;
        item["layer"] = subLayer;
        var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        if (size != null)
            item["size"] = size;
        var bg = window.getComputedStyle(subLayer, null).getPropertyValue('background-color');
        if (bg != null)
            item["bg"] = bg;
        this._cellPrototypes[cellIdentifier] = item;
    };
    MIOCollectionView.prototype._addSupplementaryViewPrototypeWithLayer = function (subLayer) {
        var viewIdentifier = subLayer.getAttribute("data-supplementary-view-identifier");
        var viewClassname = subLayer.getAttribute("data-class");
        if (viewClassname == null)
            viewClassname = "MIOView";
        var item = {};
        item["class"] = viewClassname;
        item["layer"] = subLayer;
        var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        if (size != null)
            item["size"] = size;
        var bg = window.getComputedStyle(subLayer, null).getPropertyValue('background-color');
        if (bg != null)
            item["bg"] = bg;
        this._supplementaryViews[viewIdentifier] = item;
    };
    MIOCollectionView.prototype.registerClassForCellWithReuseIdentifier = function (cellClass, resource, identifier) {
        //TODO:
    };
    MIOCollectionView.prototype.registerClassForSupplementaryViewWithReuseIdentifier = function (viewClass, resource, identifier) {
        //TODO:
    };
    MIOCollectionView.prototype.dequeueReusableCellWithIdentifier = function (identifier) {
        var item = this._cellPrototypes[identifier];
        //instance creation here
        var className = item["class"];
        var cell = Object.create(window[className].prototype);
        cell.constructor.apply(cell);
        //cell.init();
        var layer = item["layer"];
        if (layer != null) {
            var newLayer = layer.cloneNode(true);
            newLayer.style.display = "";
            // var size = item["size"];
            // if (size != null) {
            //     cell.setWidth(size.width);
            //     cell.setHeight(size.height);
            // }
            // var bg = item["bg"];
            // if (bg != null) {
            //     cell.layer.style.background = bg;
            // }
            cell.initWithLayer(newLayer);
            cell.awakeFromHTML();
        }
        else {
            var cells = item["cells"];
            if (cells == null) {
                cells = [];
                item["cells"] = cells;
            }
            cells.push(cell);
        }
        return cell;
    };
    MIOCollectionView.prototype.dequeueReusableSupplementaryViewWithReuseIdentifier = function (identifier) {
        var item = this._supplementaryViews[identifier];
        //instance creation here
        var className = item["class"];
        var view = Object.create(window[className].prototype);
        view.constructor.apply(view);
        //view.init();
        var layer = item["layer"];
        if (layer != null) {
            var newLayer = layer.cloneNode(true);
            newLayer.style.display = "";
            // var size = item["size"];
            // if (size != null) {
            //     view.setWidth(size.width);
            //     view.layer.style.width = "100%";
            //     view.setHeight(size.height);
            // }
            // var bg = item["bg"];
            // if (bg != null) {
            //     view.layer.style.background = bg;
            // }
            view.initWithLayer(newLayer);
            //view._addLayerToDOM();
            view.awakeFromHTML();
        }
        else {
            var views = item["views"];
            if (views == null) {
                views = [];
                item["views"] = views;
            }
            views.push(view);
        }
        return view;
    };
    MIOCollectionView.prototype.cellAtIndexPath = function (index, section) {
        var s = this._sections[section];
        var c = s.cells[index];
        return c;
    };
    MIOCollectionView.prototype.reloadData = function () {
        if (this.dataSource == null)
            return;
        // Remove all subviews
        for (var index = 0; index < this._sections.length; index++) {
            var sectionView = this._sections[index];
            if (sectionView.header != null)
                sectionView.header.removeFromSuperview();
            if (sectionView.footer != null)
                sectionView.footer.removeFromSuperview();
            for (var count = 0; count < sectionView.cells.length; count++) {
                var cell = sectionView.cells[count];
                cell.removeFromSuperview();
            }
        }
        this._sections = [];
        var sections = this.dataSource.numberOfSections(this);
        for (var sectionIndex = 0; sectionIndex < sections; sectionIndex++) {
            var section = new MIOCollectionViewSection();
            section.init();
            this._sections.push(section);
            if (typeof this.dataSource.viewForSupplementaryViewAtIndex === "function") {
                var hv = this.dataSource.viewForSupplementaryViewAtIndex(this, "header", index, sectionIndex);
                section.header = hv;
                if (hv != null)
                    this.addSubview(hv);
            }
            var items = this.dataSource.numberOfItemsInSection(this, sectionIndex);
            for (var index = 0; index < items; index++) {
                var cell = this.dataSource.cellForItemAtIndex(this, index, sectionIndex);
                section.cells.push(cell);
                this.addSubview(cell);
                // events
                cell._target = this;
                cell._onClickFn = this.cellOnClickFn;
                cell._index = index;
                cell._section = sectionIndex;
            }
            if (typeof this.dataSource.viewForSupplementaryViewAtIndex === "function") {
                var fv = this.dataSource.viewForSupplementaryViewAtIndex(this, "footer", index, sectionIndex);
                section.footer = fv;
                if (fv != null)
                    this.addSubview(fv);
            }
        }
        this.layout();
    };
    MIOCollectionView.prototype.cellOnClickFn = function (cell) {
        var index = cell._index;
        var section = cell._section;
        var canSelectCell = true;
        // if (this.selectedCellIndex == index && this.selectedCellSection == section)
        //     return;
        if (this.delegate != null) {
            if (typeof this.delegate.canSelectCellAtIndexPath === "function")
                canSelectCell = this.delegate.canSelectCellAtIndexPath(this, index, section);
        }
        if (canSelectCell == false)
            return;
        if (this.selectedCellIndex > -1 && this.selectedCellSection > -1)
            this.deselectCellAtIndexPath(this.selectedCellIndex, this.selectedCellSection);
        this.selectedCellIndex = index;
        this.selectedCellSection = section;
        this._selectCell(cell);
        if (this.delegate != null) {
            if (typeof this.delegate.didSelectCellAtIndexPath === "function")
                this.delegate.didSelectCellAtIndexPath(this, index, section);
        }
    };
    MIOCollectionView.prototype._selectCell = function (cell) {
        cell.setSelected(true);
    };
    MIOCollectionView.prototype.selectCellAtIndexPath = function (index, section) {
        this.selectedCellIndex = index;
        this.selectedCellSection = section;
        var cell = this._sections[section].cells[index];
        this._selectCell(cell);
    };
    MIOCollectionView.prototype._deselectCell = function (cell) {
        cell.setSelected(false);
    };
    MIOCollectionView.prototype.deselectCellAtIndexPath = function (row, section) {
        this.selectedCellIndex = -1;
        this.selectedCellSection = -1;
        var cell = this._sections[section].cells[row];
        this._deselectCell(cell);
    };
    MIOCollectionView.prototype.layout = function () {
        _super.prototype.layout.call(this);
        if (this._collectionViewLayout == null)
            this._collectionViewLayout = new MIOCollectionViewFlowLayout();
        if (this._sections == null)
            return;
        var x = this.collectionViewLayout.paddingLeft;
        var y = this.collectionViewLayout.paddingTop;
        for (var count = 0; count < this._sections.length; count++) {
            var section = this._sections[count];
            x = this.collectionViewLayout.paddingLeft;
            // Add header view
            if (section.header != null) {
                section.header.setY(y);
                var offsetY = section.header.getHeight();
                if (offsetY <= 0)
                    offsetY = 23;
                y += offsetY + this.collectionViewLayout.spaceY;
            }
            // Add cells
            var offsetY;
            for (var index = 0; index < section.cells.length; index++) {
                var cell = section.cells[index];
                var offsetX = cell.getWidth() + this.collectionViewLayout.spaceX;
                if (offsetX <= 0)
                    offsetX = 44;
                var oy = cell.getHeight();
                if (oy <= 0)
                    oy = 44;
                if (oy > offsetY)
                    offsetY = oy;
                if ((x + offsetX + this.collectionViewLayout.paddingRight) > this.getWidth()) {
                    x = this.collectionViewLayout.paddingLeft;
                    y += offsetY + this.collectionViewLayout.spaceY;
                }
                cell.setX(x);
                cell.setY(y);
                x += offsetX + this.collectionViewLayout.paddingLeft;
            }
            if (x > 0)
                y += offsetY + this.collectionViewLayout.paddingTop;
            // Add footer view
            if (section.footer != null) {
                section.footer.setY(y);
                var offsetY = section.footer.getHeight();
                if (offsetY <= 0)
                    offsetY = 23;
                y += offsetY + this.collectionViewLayout.paddingTop;
            }
        }
    };
    return MIOCollectionView;
}(MIOView));
/**
 * Created by godshadow on 11/3/16.
 */
/// <reference path="MIOCoreTypes.ts" />
/// <reference path="MIOView.ts" />
/// <reference path="MIOLabel.ts" />
var MIOCalendarCell = (function (_super) {
    __extends(MIOCalendarCell, _super);
    function MIOCalendarCell() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.date = null;
        _this.dayIndex = 0;
        _this.index = 0;
        _this.parent = null;
        return _this;
    }
    MIOCalendarCell.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        var instance = this;
        this.layer.onclick = function () {
            if (instance.parent.delegate != null)
                instance.parent.delegate.cellDidSelectedForCalendar(instance.parent, instance.date, instance.index);
        };
    };
    return MIOCalendarCell;
}(MIOView));
var MIOCalendarView = (function (_super) {
    __extends(MIOCalendarView, _super);
    function MIOCalendarView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.startDate = null;
        _this.endDate = null;
        _this.dataSource = null;
        _this.delegate = null;
        _this.headers = [];
        _this.cells = [];
        _this.cellDates = [];
        _this.cellPrototypes = {};
        return _this;
    }
    MIOCalendarView.prototype.addCellPrototypeWithIdentifier = function (identifier, classname, html, css, elementID) {
        var item = { "html": html, "css": css, "id": elementID, "class": classname };
        this.cellPrototypes[identifier] = item;
    };
    MIOCalendarView.prototype.cellWithIdentifier = function (identifier) {
        var item = this.cellPrototypes[identifier];
        //instance creation here
        var className = item["class"];
        var cell = Object.create(window[className].prototype);
        cell.constructor.apply(cell, new Array("World"));
        var html = item["html"];
        var css = item["css"];
        var elID = item["id"];
        var layer = MIOLayerFromResource(html, css, elID);
        cell.initWithLayer(layer);
        return cell;
    };
    MIOCalendarView.prototype.reloadData = function () {
        // Remove all subviews
        while (this.subviews.length > 0) {
            var view = this.subviews[0];
            view.removeFromSuperview();
        }
        this.startDate = this.dataSource.startDateForCalendar(this);
        this.endDate = this.dataSource.endDateForCalendar(this);
        if (this.startDate == null || this.endDate == null)
            return;
        var currentDate = new Date(this.startDate.getTime());
        var currentMonth = -1;
        var dayIndex = 0;
        var count = 0;
        while (this.endDate >= currentDate) {
            dayIndex = MIOCalendarGetDayRowFromDate(currentDate);
            var month = currentDate.getMonth();
            if (month == 0 && currentMonth > 0)
                currentMonth = -1;
            if (month > currentMonth) {
                currentMonth = currentDate.getMonth();
                var title = "";
                var header = null;
                if (typeof this.dataSource.viewTitleForHeaderAtMonthForCalendar === "function") {
                    header = this.dataSource.viewTitleForHeaderAtMonthForCalendar(this, currentMonth);
                }
                else if (typeof this.dataSource.titleForHeaderAtMonthForCalendar === "function") {
                    title = this.dataSource.titleForHeaderAtMonthForCalendar(this, currentMonth);
                    header = new MIOLabel();
                    header.init();
                    header.setHeight(20);
                    header.setText(title);
                }
                else {
                    header = new MIOView();
                    header.init();
                }
                this.addSubview(header);
            }
            var cell = this.dataSource.cellAtDateForCalendar(this, currentDate, count);
            cell.dayIndex = dayIndex;
            cell.index = count;
            cell.parent = this;
            cell.date = new Date(currentDate.getTime());
            this.addSubview(cell);
            currentDate.setDate(currentDate.getDate() + 1);
            count++;
        }
        this.layout();
    };
    MIOCalendarView.prototype.layout = function () {
        //super.layout();
        if (this.startDate == null || this.endDate == null)
            return;
        var numberOfDays = 7;
        var offsetX = 2;
        var y = 0;
        var x = offsetX;
        var w = this.layer.clientWidth - (9 * numberOfDays);
        w = w / numberOfDays;
        var posXArray = [];
        for (var count = 0; count < numberOfDays; count++) {
            posXArray.push(x);
            x += w + 9;
        }
        x = offsetX;
        var dayCount = 0;
        var currentDate = new Date(this.startDate.getTime());
        var currentMonth = this.startDate.getMonth();
        var dayIndex = 0;
        var dayCount = 0;
        var headerCount = 0;
        var v = null;
        var lastDayIndex = 0;
        for (var count = 0; count < this.subviews.length; count++) {
            v = this.subviews[count];
            if (!(v instanceof MIOCalendarCell)) {
                // Header
                if (lastDayIndex != 0) {
                    y += w + 9;
                }
                v.setX(0);
                v.setWidth(this.getWidth());
                v.setY(y);
                y += 30 + 9;
            }
            else {
                // Cell
                x = posXArray[v.dayIndex];
                if (v.dayIndex == 0) {
                    y += w + 9;
                }
                v.setFrame(MIOFrame.frameWithRect(x, y, w, w));
                lastDayIndex = v.dayIndex;
            }
        }
    };
    return MIOCalendarView;
}(MIOView));
function MIOCalendarGetStringFromDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = date.getDate().toString();
    var d = yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]); // padding
    return d;
}
function MIOCalendarGetDayRowFromDate(date) {
    // Transform to start on Monday instead of Sunday
    // 0 - Mon, 1 - Tue, 2 - Wed, 3 - Thu, 4 - Fri, 5 - Sat, 6 - Sun
    var row = date.getDay();
    if (row == 0)
        row = 6;
    else
        row--;
    return row;
}
/**
 * Created by godshadow on 12/3/16.
 */
/// <reference path="MIOView.ts" />
function MIOImageViewFromElementID(view, elementID) {
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var iv = new MIOImageView();
    iv.initWithLayer(layer);
    view._linkViewToSubview(iv);
    return iv;
}
var MIOImageView = (function (_super) {
    __extends(MIOImageView, _super);
    function MIOImageView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._imageLayer = null;
        return _this;
    }
    MIOImageView.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this._imageLayer = MIOLayerGetFirstElementWithTag(this.layer, "IMG");
        if (this._imageLayer == null) {
            this._imageLayer = document.createElement("img");
            this._imageLayer.style.width = "100%";
            this._imageLayer.style.height = "100%";
            this.layer.appendChild(this._imageLayer);
        }
    };
    MIOImageView.prototype.setImage = function (imageURL) {
        this._imageLayer.setAttribute("src", imageURL);
    };
    return MIOImageView;
}(MIOView));
/**
 * Created by godshadow on 21/5/16.
 */
/// <reference path="MIOView.ts" />
var MIOActivityIndicator = (function (_super) {
    __extends(MIOActivityIndicator, _super);
    function MIOActivityIndicator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.gray = false;
        return _this;
    }
    MIOActivityIndicator.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        if (options != null) {
            this.gray = options["Gray"] == true ? true : false;
        }
        var color = this.gray == false ? "#ffffff" : "#aaaaaa";
        var svg = "";
        svg += '<svg width="30px" height="30px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="uil-default">';
        svg += '  <rect x="0" y="0" width="100" height="100" fill="none" class="bk"></rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" fill="' + color + '" transform="rotate(0 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" pfdtv_fill="' + color + '" transform="rotate(30 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.08333333333333333s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" pfdtv_fill="' + color + '" transform="rotate(60 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.16666666666666666s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" pfdtv_fill="' + color + '" transform="rotate(90 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.25s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" pfdtv_fill="' + color + '" transform="rotate(120 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.3333333333333333s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" pfdtv_fill="' + color + '" transform="rotate(150 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.4166666666666667s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" pfdtv_fill="' + color + '" transform="rotate(180 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.5s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" pfdtv_fill="' + color + '" transform="rotate(210 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.5833333333333334s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" pfdtv_fill="' + color + '" transform="rotate(240 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.6666666666666666s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" pfdtv_fill="' + color + '" transform="rotate(270 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.75s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" pfdtv_fill="' + color + '" transform="rotate(300 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.8333333333333334s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" pfdtv_fill="' + color + '" transform="rotate(330 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.9166666666666666s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '</svg>';
        this.layer.innerHTML = svg;
    };
    return MIOActivityIndicator;
}(MIOView));
/**
 * Created by godshadow on 04/08/16.
 */
/// <reference path="MIOView.ts" />
var MIOWebView = (function (_super) {
    __extends(MIOWebView, _super);
    function MIOWebView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._iframeLayer = null;
        return _this;
    }
    MIOWebView.prototype.init = function () {
        _super.prototype.init.call(this);
        this._iframeLayer = document.createElement("iframe");
        this._iframeLayer.setAttribute("scrolling", "auto");
        this._iframeLayer.setAttribute("frameborder", "0");
        this.layer.appendChild(this._iframeLayer);
    };
    MIOWebView.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this._iframeLayer = MIOLayerGetFirstElementWithTag(this.layer, "IFRAME");
        if (this._iframeLayer == null) {
            this._iframeLayer.setAttribute("scrolling", "auto");
            this._iframeLayer.setAttribute("frameborder", "0");
            this.layer.appendChild(this._iframeLayer);
        }
    };
    MIOWebView.prototype.setURL = function (url) {
        this._iframeLayer.setAttribute("src", url);
        this._iframeLayer.setAttribute("width", "100%");
        this._iframeLayer.setAttribute("height", "100%");
    };
    return MIOWebView;
}(MIOView));
/**
 * Created by godshadow on 12/3/16.
 */
/// <reference path="MIOView.ts" />
var MIOControl = (function (_super) {
    __extends(MIOControl, _super);
    function MIOControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.enabled = true;
        // TODO: Make delegation of the methods above
        _this.mouseOverTarget = null;
        _this.mouseOverAction = null;
        _this.mouseOutTarget = null;
        _this.mouseOutAction = null;
        return _this;
    }
    MIOControl.prototype.setEnabled = function (enabled) {
        this.enabled = enabled;
        if (enabled == true)
            this.layer.style.opacity = "1.0";
        else
            this.layer.style.opacity = "0.10";
    };
    MIOControl.prototype.setOnMouseOverAction = function (target, action) {
        this.mouseOverTarget = target;
        this.mouseOverAction = action;
        var instance = this;
        this.layer.onmouseover = function () {
            if (instance.enabled)
                instance.mouseOverAction.call(target);
        };
    };
    MIOControl.prototype.setOnMouseOutAction = function (target, action) {
        this.mouseOutTarget = target;
        this.mouseOutAction = action;
        var instance = this;
        this.layer.onmouseout = function () {
            if (instance.enabled)
                instance.mouseOutAction.call(target);
        };
    };
    return MIOControl;
}(MIOView));
/**
 * Created by godshadow on 12/3/16.
 */
/// <reference path="MIOControl.ts" />
/// <reference path="MIOString.ts" />
var MIOButtonType;
(function (MIOButtonType) {
    MIOButtonType[MIOButtonType["MomentaryPushIn"] = 0] = "MomentaryPushIn";
    MIOButtonType[MIOButtonType["PushOnPushOff"] = 1] = "PushOnPushOff";
    MIOButtonType[MIOButtonType["PushIn"] = 2] = "PushIn";
})(MIOButtonType || (MIOButtonType = {}));
var MIOButton = (function (_super) {
    __extends(MIOButton, _super);
    function MIOButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._statusStyle = null;
        _this._titleStatusStyle = null;
        _this._titleLayer = null;
        _this._imageStatusStyle = null;
        _this._imageLayer = null;
        _this.target = null;
        _this.action = null;
        _this._selected = false;
        _this.type = MIOButtonType.MomentaryPushIn;
        return _this;
    }
    MIOButton.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        var type = this.layer.getAttribute("data-type");
        if (type == "MomentaryPushIn")
            this.type = MIOButtonType.MomentaryPushIn;
        else if (type == "PushOnPushOff")
            this.type = MIOButtonType.PushOnPushOff;
        this._statusStyle = this.layer.getAttribute("data-status-style-prefix");
        if (this._statusStyle == null && options != null)
            this._statusStyle = options["status-style-prefix"] + "_status";
        // Check for title layer
        this._titleLayer = MIOLayerGetFirstElementWithTag(this.layer, "SPAN");
        if (this._titleLayer == null) {
            this._titleLayer = document.createElement("span");
            this.layer.appendChild(this._titleLayer);
        }
        if (this._titleLayer != null) {
            this._titleStatusStyle = this._titleLayer.getAttribute("data-status-style");
            if (this._titleStatusStyle == null && options != null)
                this._titleStatusStyle = options["status-style-prefix"] + "_title_status";
        }
        var key = this.layer.getAttribute("data-title");
        if (key != null)
            this.setTitle(MIOLocalizeString(key, key));
        // Check for img layer
        this._imageLayer = MIOLayerGetFirstElementWithTag(this.layer, "DIV");
        if (this._imageLayer != null) {
            this._imageStatusStyle = this._imageLayer.getAttribute("data-status-style");
            if (this._imageStatusStyle == null && options != null)
                this._imageStatusStyle = options["status-style-prefix"] + "_image_status";
        }
        // Check for status
        var status = this.layer.getAttribute("data-status");
        if (status == "selected")
            this.setSelected(true);
        // Prevent click
        this.layer.addEventListener("click", function (e) {
            e.stopPropagation();
        });
        var instance = this;
        this.layer.addEventListener("mousedown", function (e) {
            e.stopPropagation();
            if (instance.enabled) {
                if (instance.type == MIOButtonType.PushOnPushOff)
                    instance.setSelected(!instance._selected);
                else
                    instance.setSelected(true);
            }
        });
        this.layer.addEventListener("mouseup", function (e) {
            e.stopPropagation();
            if (instance.enabled) {
                if (instance.type == MIOButtonType.MomentaryPushIn)
                    instance.setSelected(false);
                if (instance.action != null && instance.target != null)
                    instance.action.call(instance.target, instance);
            }
        });
    };
    MIOButton.prototype.initWithAction = function (target, action) {
        _super.prototype.init.call(this);
        this.setAction(target, action);
    };
    MIOButton.prototype.setAction = function (target, action) {
        this.target = target;
        this.action = action;
    };
    MIOButton.prototype.setTitle = function (title) {
        this._titleLayer.innerHTML = title;
    };
    Object.defineProperty(MIOButton.prototype, "title", {
        get: function () {
            return this._titleLayer.innerHTML;
        },
        set: function (title) {
            this.setTitle(title);
        },
        enumerable: true,
        configurable: true
    });
    MIOButton.prototype.setSelected = function (value) {
        if (this._selected == value)
            return;
        if (value == true) {
            if (this._statusStyle != null) {
                this.layer.classList.remove(this._statusStyle + "_off");
                this.layer.classList.add(this._statusStyle + "_on");
            }
            if (this._imageLayer != null && this._imageStatusStyle != null) {
                this._imageLayer.classList.remove(this._imageStatusStyle + "_off");
                this._imageLayer.classList.add(this._imageStatusStyle + "_on");
            }
            if (this._titleLayer != null && this._titleStatusStyle != null) {
                this._titleLayer.classList.remove(this._titleStatusStyle + "_off");
                this._titleLayer.classList.add(this._titleStatusStyle + "_on");
            }
            if (this._statusStyle == null && this._titleStatusStyle == null && this._imageStatusStyle == null)
                this.setAlpha(0.35);
        }
        else {
            if (this._statusStyle != null) {
                this.layer.classList.remove(this._statusStyle + "_on");
                this.layer.classList.add(this._statusStyle + "_off");
            }
            if (this._imageLayer != null && this._imageStatusStyle != null) {
                this._imageLayer.classList.remove(this._imageStatusStyle + "_on");
                this._imageLayer.classList.add(this._imageStatusStyle + "_off");
            }
            if (this._titleLayer != null && this._titleStatusStyle != null) {
                this._titleLayer.classList.remove(this._titleStatusStyle + "_on");
                this._titleLayer.classList.add(this._titleStatusStyle + "_off");
            }
            if (this._statusStyle == null && this._titleStatusStyle == null && this._imageStatusStyle == null)
                this.setAlpha(1);
        }
        this._selected = value;
    };
    return MIOButton;
}(MIOControl));
/**
 * Created by godshadow on 5/5/16.
 */
/// <reference path="MIOView.ts" />
/// <reference path="MIOWebApplication.ts" />
var MIOMenuItem = (function (_super) {
    __extends(MIOMenuItem, _super);
    function MIOMenuItem(layerID) {
        var _this = _super.call(this, layerID == null ? MIOViewGetNextLayerID("mio_menu_item") : layerID) || this;
        _this.checked = false;
        _this.title = null;
        _this._titleLayer = null;
        _this.target = null;
        _this.action = null;
        return _this;
    }
    /*    public static itemWithLayer(layer)
        {
            var layerID = layer.getAttribute("id");
            var mi = new MIOMenuItem(layerID);
            mi.initWithLayer(layer);
            mi.title = layer.innerHTML;
    
            return mi;
        }
    
        initWithLayer(layer, options?)
        {
            super.initWithLayer(layer, options);
    
            this.layer.classList.add("menu_item");
    
            var instance = this;
            this.layer.onclick = function()
            {
                if (instance.parent != null) {
                    var index = instance.parent.items.indexOf(instance);
                    instance.parent.action.call(instance.parent.target, instance, index);
                }
            }
        }*/
    MIOMenuItem.itemWithTitle = function (title) {
        var mi = new MIOMenuItem();
        mi.initWithTitle(title);
        return mi;
    };
    MIOMenuItem.prototype.initWithTitle = function (title) {
        this.init();
        this._setupLayer();
        this.layer.style.width = "100%";
        this.layer.style.height = "";
        this._titleLayer = document.createElement("span");
        this._titleLayer.classList.add("menu_item");
        this._titleLayer.style.color = "inherit";
        this._titleLayer.innerHTML = title;
        this.layer.appendChild(this._titleLayer);
        this.title = title;
    };
    MIOMenuItem.prototype._setupLayer = function () {
        var instance = this;
        this.layer.onmouseenter = function (e) {
            e.stopPropagation();
            instance.layer.classList.add("menu_item_on_hover");
        };
        this.layer.onmouseleave = function (e) {
            e.stopPropagation();
            instance.layer.classList.remove("menu_item_on_hover");
        };
        this.layer.onclick = function (e) {
            e.stopPropagation();
            if (instance.action != null && instance.target != null) {
                instance.layer.classList.remove("menu_item_on_hover");
                instance.action.call(instance.target, instance);
            }
        };
    };
    MIOMenuItem.prototype.getWidth = function () {
        //return this.layer.style.innerWidth;
        return this._titleLayer.getBoundingClientRect().width;
    };
    MIOMenuItem.prototype.getHeight = function () {
        return this.layer.getBoundingClientRect().height;
    };
    return MIOMenuItem;
}(MIOView));
var MIOMenu = (function (_super) {
    __extends(MIOMenu, _super);
    function MIOMenu(layerID) {
        var _this = _super.call(this, layerID == null ? MIOViewGetNextLayerID("mio_menu") : layerID) || this;
        _this.items = [];
        _this._isVisible = false;
        _this._updateWidth = true;
        _this.target = null;
        _this.action = null;
        _this._menuLayer = null;
        return _this;
    }
    MIOMenu.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setupLayer();
    };
    /*  initWithLayer(layer, options?)
      {
          super.initWithLayer(layer, options);
  
          // Check if we have a menu
          if (this.layer.childNodes.length > 0)
          {
              for (var index = 0; index < this.layer.childNodes.length; index++)
              {
                  var layer = this.layer.childNodes[index];
                  if (layer.tagName == "DIV")
                  {
                      var item = MIOMenuItem.itemWithLayer(layer);
                      item.parent = this;
  
                      this._linkViewToSubview(item);
                      this._addMenuItem(item);
                  }
              }
          }
  
          this._setupLayer();
          this.setAlpha(0);
      }*/
    MIOMenu.prototype._setupLayer = function () {
        this.layer.classList.add("menu");
        this.layer.style.zIndex = 100;
    };
    MIOMenu.prototype._addMenuItem = function (menuItem) {
        this.items.push(menuItem);
    };
    MIOMenu.prototype.addMenuItem = function (menuItem) {
        menuItem.action = this._menuItemDidClick;
        menuItem.target = this;
        this.items.push(menuItem);
        this.addSubview(menuItem);
        this._updateWidth = true;
    };
    MIOMenu.prototype.removeMenuItem = function (menuItem) {
        //TODO: Implement this!!!
    };
    MIOMenu.prototype._menuItemDidClick = function (menuItem) {
        if (this.action != null && this.target != null) {
            var index = this.items.indexOf(menuItem);
            this.action.call(this.target, this, index);
        }
        this.hide();
    };
    MIOMenu.prototype.showFromControl = function (control) {
        this._isVisible = true;
        MIOWebApplication.sharedInstance().showMenuFromControl(control, this);
    };
    MIOMenu.prototype.hide = function () {
        this._isVisible = false;
        MIOWebApplication.sharedInstance().hideMenu();
    };
    Object.defineProperty(MIOMenu.prototype, "isVisible", {
        get: function () {
            return this._isVisible;
        },
        enumerable: true,
        configurable: true
    });
    MIOMenu.prototype.layout = function () {
        if (this._updateWidth == true) {
            var width = 0;
            var y = 5;
            for (var index = 0; index < this.items.length; index++) {
                var item = this.items[index];
                item.setX(0);
                item.setY(y);
                var w = item.getWidth();
                if (w > width)
                    width = w;
                y += item.getHeight();
            }
        }
        if (width < 40)
            width = 40;
        this.setWidth(width + 10);
        this.setHeight(y + 5);
    };
    return MIOMenu;
}(MIOView));
/**
 * Created by godshadow on 12/3/16.
 */
/// <reference path="MIOWebApplication.ts" />
/// <reference path="MIOButton.ts" />
/// <reference path="MIOMenu.ts" />
var MIOPopUpButton = (function (_super) {
    __extends(MIOPopUpButton, _super);
    function MIOPopUpButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._menu = null;
        _this._isVisible = false;
        return _this;
    }
    MIOPopUpButton.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        // Check if we have a menu
        /*if (this.layer.childNodes.length > 0)
         {
         // Get the first div element. We don't support more than one element
         var index = 0;
         var menuLayer = this.layer.childNodes[index];
         while(menuLayer.tagName != "DIV")
         {
         index++;
         if (index >= this.layer.childNodes.length) {
         menuLayer = null;
         break;
         }

         menuLayer = this.layer.childNodes[index];
         }

         if (menuLayer != null) {
         var layerID = menuLayer.getAttribute("id");
         this._menu = new MIOMenu(layerID);
         this._menu.initWithLayer(menuLayer);

         var x = 10;
         var y = this.getHeight();
         this._menu.setX(x);
         this._menu.setY(y);

         this._linkViewToSubview(this._menu);
         }*/
        // Set action
        this.setAction(this, function () {
            if (this._menu == null)
                return;
            if (this._menu.isVisible == false) {
                this._menu.showFromControl(this);
            }
            else {
                this._menu.hide();
            }
        });
    };
    MIOPopUpButton.prototype.setMenuAction = function (target, action) {
        if (this._menu != null) {
            this._menu.target = target;
            this._menu.action = action;
        }
    };
    MIOPopUpButton.prototype.addMenuItemWithTitle = function (title) {
        if (this._menu == null) {
            this._menu = new MIOMenu();
            this._menu.init();
        }
        this._menu.addMenuItem(MIOMenuItem.itemWithTitle(title));
    };
    return MIOPopUpButton;
}(MIOButton));
/**
 * Created by godshadow on 12/3/16.
 */
/// <reference path="MIOControl.ts" />
function MIOCheckButtonFromElementID(view, elementID) {
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var button = new MIOCheckButton();
    button.initWithLayer(layer);
    view._linkViewToSubview(button);
    return button;
}
var MIOCheckButton = (function (_super) {
    __extends(MIOCheckButton, _super);
    function MIOCheckButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.target = null;
        _this.action = null;
        _this.on = false; //Off
        return _this;
    }
    MIOCheckButton.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this.layer.classList.add("check_button");
        this.layer.classList.add("check_button_state_off");
        var instance = this;
        this.layer.onclick = function () {
            if (instance.enabled) {
                instance.toggleValue.call(instance);
            }
        };
    };
    MIOCheckButton.prototype.setOnChangeValue = function (target, action) {
        this.target = target;
        this.action = action;
    };
    MIOCheckButton.prototype.setOn = function (on) {
        this.on = on;
        if (on == true) {
            this.layer.classList.remove("check_button_state_off");
            this.layer.classList.add("check_button_state_on");
        }
        else {
            this.layer.classList.remove("check_button_state_on");
            this.layer.classList.add("check_button_state_off");
        }
    };
    MIOCheckButton.prototype.toggleValue = function () {
        this.setOn(!this.on);
        if (this.target != null && this.action != null)
            this.action.call(this.target, this, this.on);
    };
    return MIOCheckButton;
}(MIOControl));
/**
 * Created by godshadow on 12/3/16.
 */
/// <reference path="MIOView.ts" />
/// <reference path="MIOControl.ts" />
/// <reference path="MIOString.ts" />
var MIOTextFieldType;
(function (MIOTextFieldType) {
    MIOTextFieldType[MIOTextFieldType["NormalType"] = 0] = "NormalType";
    MIOTextFieldType[MIOTextFieldType["PasswordType"] = 1] = "PasswordType";
    MIOTextFieldType[MIOTextFieldType["SearchType"] = 2] = "SearchType";
})(MIOTextFieldType || (MIOTextFieldType = {}));
var MIOTextField = (function (_super) {
    __extends(MIOTextField, _super);
    function MIOTextField() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.placeHolder = null;
        _this._inputLayer = null;
        _this.type = MIOTextFieldType.NormalType;
        _this.textChangeTarget = null;
        _this.textChangeAction = null;
        _this.enterPressTarget = null;
        _this.enterPressAction = null;
        return _this;
    }
    MIOTextField.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setupLayer();
    };
    MIOTextField.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this._inputLayer = MIOLayerGetFirstElementWithTag(this.layer, "INPUT");
        this._setupLayer();
    };
    MIOTextField.prototype._setupLayer = function () {
        if (this._inputLayer == null) {
            this._inputLayer = document.createElement("input");
            if (this.type == MIOTextFieldType.SearchType) {
                this._inputLayer.style.marginLeft = "10px";
                this._inputLayer.style.marginRight = "10px";
            }
            else {
                this._inputLayer.style.marginLeft = "5px";
                this._inputLayer.style.marginRight = "5px";
            }
            this._inputLayer.style.border = "0px";
            this._inputLayer.style.backgroundColor = "transparent";
            this._inputLayer.style.width = "100%";
            this._inputLayer.style.height = "100%";
            this._inputLayer.style.color = "inherit";
            this._inputLayer.style.fontSize = "inherit";
            this._inputLayer.style.fontFamily = "inherit";
            this._inputLayer.style.outline = "none";
            this.layer.appendChild(this._inputLayer);
        }
        var placeholderKey = this.layer.getAttribute("data-placeholder");
        if (placeholderKey != null)
            this._inputLayer.setAttribute("placeholder", MIOLocalizeString(placeholderKey, placeholderKey));
    };
    MIOTextField.prototype.layout = function () {
        _super.prototype.layout.call(this);
        var w = this.getWidth();
        var h = this.getHeight();
        this._inputLayer.style.marginLeft = "4px";
        this._inputLayer.style.width = (w - 8) + "px";
        this._inputLayer.style.marginTop = "4px";
        this._inputLayer.style.height = (h - 8) + "px";
    };
    MIOTextField.prototype.setText = function (text) {
        this.text = text;
    };
    Object.defineProperty(MIOTextField.prototype, "text", {
        get: function () {
            return this._inputLayer.value;
        },
        set: function (text) {
            this._inputLayer.value = text != null ? text : "";
        },
        enumerable: true,
        configurable: true
    });
    MIOTextField.prototype.setPlaceholderText = function (text) {
        this.placeHolder = text;
        this._inputLayer.setAttribute("placeholder", text);
    };
    MIOTextField.prototype.setOnChangeText = function (target, action) {
        this.textChangeTarget = target;
        this.textChangeAction = action;
        var instance = this;
        this.layer.oninput = function () {
            if (instance.enabled)
                instance.textChangeAction.call(target, instance, instance._inputLayer.value);
        };
    };
    MIOTextField.prototype.setOnEnterPress = function (target, action) {
        this.enterPressTarget = target;
        this.enterPressAction = action;
        var instance = this;
        this.layer.onkeyup = function (e) {
            if (instance.enabled) {
                if (e.keyCode == 13)
                    instance.enterPressAction.call(target, instance, instance._inputLayer.value);
            }
        };
    };
    MIOTextField.prototype.setTextRGBColor = function (r, g, b) {
        var value = "rgb(" + r + ", " + g + ", " + b + ")";
        this._inputLayer.style.color = value;
    };
    Object.defineProperty(MIOTextField.prototype, "textColor", {
        get: function () {
            var color = this._getValueFromCSSProperty("color");
            return color;
        },
        set: function (color) {
            this._inputLayer.style.color = color;
        },
        enumerable: true,
        configurable: true
    });
    MIOTextField.prototype.becameFirstResponder = function () {
        this._inputLayer.focus();
    };
    return MIOTextField;
}(MIOControl));
/**
 * Created by godshadow on 15/3/16.
 */
/// <reference path="MIOControl.ts" />
var MIOTextArea = (function (_super) {
    __extends(MIOTextArea, _super);
    function MIOTextArea() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.textareaLayer = null;
        _this.textChangeTarget = null;
        _this.textChangeAction = null;
        return _this;
    }
    MIOTextArea.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this.textareaLayer = document.createElement("textarea");
        this.textareaLayer.style.width = "98%";
        this.textareaLayer.style.height = "90%";
        //this.textareaLayer.backgroundColor = "transparent";
        this.textareaLayer.style.resize = "none";
        this.textareaLayer.style.borderStyle = "none";
        this.textareaLayer.style.borderColor = "transparent";
        this.textareaLayer.style.outline = "none";
        this.textareaLayer.overflow = "auto";
        this.layer.appendChild(this.textareaLayer);
    };
    Object.defineProperty(MIOTextArea.prototype, "text", {
        get: function () {
            return this.textareaLayer.value;
        },
        set: function (text) {
            this.textareaLayer.value = text;
        },
        enumerable: true,
        configurable: true
    });
    MIOTextArea.prototype.setText = function (text) {
        this.text = text;
    };
    MIOTextArea.prototype.getText = function () {
        return this.text;
    };
    MIOTextArea.prototype.setEditMode = function (value) {
        this.textareaLayer.disabled = !value;
    };
    MIOTextArea.prototype.setOnChangeText = function (target, action) {
        this.textChangeTarget = target;
        this.textChangeAction = action;
        var instance = this;
        this.layer.oninput = function () {
            if (instance.enabled) {
                var value = instance.textareaLayer.value;
                instance.textChangeAction.call(target, instance, value);
            }
        };
    };
    return MIOTextArea;
}(MIOControl));
/**
 * Created by godshadow on 9/4/16.
 */
/// <reference path="MIOViewController.ts" />
var MIONavigationController = (function (_super) {
    __extends(MIONavigationController, _super);
    function MIONavigationController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.rootViewController = null;
        _this.viewControllersStack = [];
        _this.currentViewControllerIndex = -1;
        // Transitioning delegate
        _this._pushAnimationController = null;
        _this._popAnimationController = null;
        return _this;
    }
    MIONavigationController.prototype.init = function () {
        _super.prototype.init.call(this);
        this.view.layer.style.overflow = "hidden";
    };
    MIONavigationController.prototype.initWithRootViewController = function (vc) {
        this.init();
        this.setRootViewController(vc);
    };
    MIONavigationController.prototype.setRootViewController = function (vc) {
        this.rootViewController = vc;
        this.view.addSubview(vc.view);
        this.viewControllersStack.push(vc);
        this.currentViewControllerIndex = 0;
        this.rootViewController.navigationController = this;
        this.addChildViewController(vc);
        if (this.presentationController != null) {
            var size = vc.preferredContentSize;
            this.contentSize = size;
        }
    };
    MIONavigationController.prototype._childControllersWillAppear = function () {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewWillAppear();
        vc._childControllersWillAppear();
    };
    MIONavigationController.prototype._childControllersDidAppear = function () {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewDidAppear();
        vc._childControllersDidAppear();
    };
    MIONavigationController.prototype._childControllersWillDisappear = function () {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewWillDisappear();
        vc._childControllersWillDisappear();
    };
    MIONavigationController.prototype._childControllersDidDisappear = function () {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewDidDisappear();
        vc._childControllersDidDisappear();
    };
    MIONavigationController.prototype.pushViewController = function (vc, animate) {
        var lastVC = this.viewControllersStack[this.currentViewControllerIndex];
        this.viewControllersStack.push(vc);
        this.currentViewControllerIndex++;
        vc.navigationController = this;
        if (vc.transitioningDelegate == null)
            vc.transitioningDelegate = this;
        vc.onLoadView(this, function () {
            this.view.addSubview(vc.view);
            this.addChildViewController(vc);
            if (this.presentationController != null) {
                var size = vc.preferredContentSize;
                this.contentSize = size;
            }
            //this.contentSize = vc.preferredContentSize;
            _MIUShowViewController(lastVC, vc, this, false);
        });
    };
    MIONavigationController.prototype.popViewController = function (animate) {
        if (this.currentViewControllerIndex == 0)
            return;
        var fromVC = this.viewControllersStack[this.currentViewControllerIndex];
        this.currentViewControllerIndex--;
        this.viewControllersStack.pop();
        var toVC = this.viewControllersStack[this.currentViewControllerIndex];
        if (this.presentationController != null) {
            var size = toVC.preferredContentSize;
            this.contentSize = size;
        }
        //this.contentSize = toVC.preferredContentSize;
        _MUIHideViewController(fromVC, toVC, this, false, this, function () {
            fromVC.removeChildViewController(this);
            fromVC.view.removeFromSuperview();
        });
    };
    MIONavigationController.prototype.popToRootViewController = function (animate) {
        var currentVC = this.viewControllersStack.pop();
        for (var index = this.currentViewControllerIndex - 1; index > 0; index--) {
            var vc = this.viewControllersStack.pop();
            vc.view.removeFromSuperview();
            this.removeChildViewController(vc);
        }
        this.currentViewControllerIndex = 0;
        var rootVC = this.viewControllersStack[0];
        this.contentSize = rootVC.preferredContentSize;
        _MUIHideViewController(currentVC, rootVC, this, false, this, function () {
            currentVC.view.removeFromSuperview();
            this.removeChildViewController(currentVC);
        });
    };
    Object.defineProperty(MIONavigationController.prototype, "preferredContentSize", {
        // get contentSize()
        // {
        //     if (this.currentViewControllerIndex < 0)
        //         return new MIOSize(320, 200);
        //
        //     var vc = this.viewControllersStack[this.currentViewControllerIndex];
        //
        //     return vc.contentSize;
        // }
        get: function () {
            if (this.currentViewControllerIndex < 0)
                return this._preferredContentSize;
            var vc = this.viewControllersStack[this.currentViewControllerIndex];
            return vc.preferredContentSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIONavigationController.prototype, "contentSize", {
        set: function (size) {
            _super.prototype.setContentSize.call(this, size);
            if (MIOLibIsMobile() == false) {
                // Calculate new frame
                var ws = MUIWindowSize();
                var w = size.width;
                var h = size.height;
                var x = (ws.width - w) / 2;
                var frame = MIOFrame.frameWithRect(x, 0, w, h);
                this.view.layer.style.transition = "left 0.25s, width 0.25s, height 0.25s";
                this.view.setFrame(frame);
            }
        },
        enumerable: true,
        configurable: true
    });
    MIONavigationController.prototype.animationControllerForPresentedController = function (presentedViewController, presentingViewController, sourceController) {
        if (this._pushAnimationController == null) {
            this._pushAnimationController = new MIOPushAnimationController();
            this._pushAnimationController.init();
        }
        return this._pushAnimationController;
    };
    MIONavigationController.prototype.animationControllerForDismissedController = function (dismissedController) {
        if (this._popAnimationController == null) {
            this._popAnimationController = new MIOPopAnimationController();
            this._popAnimationController.init();
        }
        return this._popAnimationController;
    };
    return MIONavigationController;
}(MIOViewController));
/*
    ANIMATIONS
 */
var MIOPushAnimationController = (function (_super) {
    __extends(MIOPushAnimationController, _super);
    function MIOPushAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOPushAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.25;
    };
    MIOPushAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations before transitions
        var fromVC = transitionContext.presentingViewController;
        var toVC = transitionContext.presentedViewController;
        w = fromVC.view.getWidth();
        h = fromVC.view.getHeight();
        if (MIOLibIsMobile() == false) {
            var w = toVC.preferredContentSize.width;
            var h = toVC.preferredContentSize.height;
            /*
                Added by Miguel: if viewController has defined an Inherit Size ( See MIOSize) -1, -1
                then use the previous viewController's size;
             */
            if (w == -1)
                w = fromVC.view.getWidth();
            if (h == -1)
                h = fromVC.view.getHeight();
            var newFrame = MIOFrame.frameWithRect(0, 0, w, h);
            toVC.view.setFrame(newFrame);
        }
        else {
            var w = fromVC.view.getWidth();
            var h = fromVC.view.getHeight();
            toVC.view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
        }
    };
    MIOPushAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations after transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOPushAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.Push);
        return animations;
    };
    return MIOPushAnimationController;
}(MIOObject));
var MIOPopAnimationController = (function (_super) {
    __extends(MIOPopAnimationController, _super);
    function MIOPopAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOPopAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.25;
    };
    MIOPopAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations after transitions
    };
    MIOPopAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations before transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOPopAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.Pop);
        return animations;
    };
    return MIOPopAnimationController;
}(MIOObject));
/**
 * Created by godshadow on 11/3/16.
 */
/// <reference path="MIOViewController.ts" />
var MIOPageController = (function (_super) {
    __extends(MIOPageController, _super);
    function MIOPageController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.selectedViewControllerIndex = 0;
        // Transitioning delegate
        _this._pageAnimationController = null;
        return _this;
    }
    MIOPageController.prototype.addPageViewController = function (vc) {
        this.addChildViewController(vc);
        if (vc.transitioningDelegate == null)
            vc.transitioningDelegate = this;
    };
    MIOPageController.prototype._loadChildControllers = function () {
        var vc = this.childViewControllers[0];
        this.view.addSubview(vc.view);
        vc.onLoadView(this, function () {
            this._setViewLoaded(true);
        });
    };
    MIOPageController.prototype.viewWillAppear = function () {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewWillAppear();
        vc._childControllersWillAppear();
    };
    MIOPageController.prototype.viewDidAppear = function () {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewDidAppear();
        vc._childControllersDidAppear();
    };
    MIOPageController.prototype.viewWillDisappear = function () {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewWillDisappear();
        vc._childControllersWillDisappear();
    };
    MIOPageController.prototype.viewDidDisappear = function () {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewDidDisappear();
        vc._childControllersDidDisappear();
    };
    MIOPageController.prototype.showPageAtIndex = function (index) {
        if (this.selectedViewControllerIndex == -1)
            return;
        if (index == this.selectedViewControllerIndex)
            return;
        if (index < 0)
            return;
        if (index >= this.childViewControllers.length)
            return;
        var oldVC = this.childViewControllers[this.selectedViewControllerIndex];
        var newVC = this.childViewControllers[index];
        this.selectedViewControllerIndex = index;
        newVC.onLoadView(this, function () {
            this.view.addSubview(newVC.view);
            this.addChildViewController(newVC);
            _MIUShowViewController(oldVC, newVC, this, false, this, function () {
                oldVC.view.removeFromSuperview();
            });
        });
    };
    MIOPageController.prototype.showNextPage = function () {
        this.showPageAtIndex(this.selectedViewControllerIndex + 1);
    };
    MIOPageController.prototype.showPrevPage = function () {
        this.showPageAtIndex(this.selectedViewControllerIndex - 1);
    };
    MIOPageController.prototype.animationControllerForPresentedController = function (presentedViewController, presentingViewController, sourceController) {
        if (this._pageAnimationController == null) {
            this._pageAnimationController = new MIOPageAnimationController();
            this._pageAnimationController.init();
        }
        return this._pageAnimationController;
    };
    MIOPageController.prototype.animationControllerForDismissedController = function (dismissedController) {
        if (this._pageAnimationController == null) {
            this._pageAnimationController = new MIOPageAnimationController();
            this._pageAnimationController.init();
        }
        return this._pageAnimationController;
    };
    return MIOPageController;
}(MIOViewController));
/*
 ANIMATIONS
 */
var MIOPageAnimationController = (function (_super) {
    __extends(MIOPageAnimationController, _super);
    function MIOPageAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOPageAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0;
    };
    MIOPageAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations before transitions
    };
    MIOPageAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations after transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOPageAnimationController.prototype.animations = function (transitionContext) {
        return null;
    };
    return MIOPageAnimationController;
}(MIOObject));
/**
 * Created by godshadow on 05/08/16.
 */
/// <reference path="MIOViewController.ts" />
var MIOSplitViewController = (function (_super) {
    __extends(MIOSplitViewController, _super);
    function MIOSplitViewController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._masterViewController = null;
        _this._detailViewController = null;
        _this._masterView = null;
        _this._detailView = null;
        return _this;
    }
    MIOSplitViewController.prototype.init = function () {
        _super.prototype.init.call(this);
        this._masterView = new MIOView(MIOViewGetNextLayerID("split_mater_view"));
        this._masterView.init();
        this._masterView.layer.style.width = "320px";
        this.view.addSubview(this._masterView);
        this._detailView = new MIOView(MIOViewGetNextLayerID("split_detail_view"));
        this._detailView.init();
        this._detailView.layer.style.left = "320px";
        this._detailView.layer.style.width = "auto";
        this._detailView.layer.style.right = "0px";
        this.view.addSubview(this._detailView);
    };
    MIOSplitViewController.prototype.setMasterViewController = function (vc) {
        if (this._masterViewController != null) {
            this._masterViewController.view.removeFromSuperview();
            this.removeChildViewController(this._masterViewController);
            this._masterViewController = null;
        }
        if (vc != null) {
            vc.parent = this;
            vc.splitViewController = this;
            this._masterView.addSubview(vc.view);
            this.addChildViewController(vc);
            this._masterViewController = vc;
        }
    };
    MIOSplitViewController.prototype.setDetailViewController = function (vc) {
        if (this._detailViewController != null) {
            this._detailViewController.view.removeFromSuperview();
            this.removeChildViewController(this._detailViewController);
            this._detailViewController = null;
        }
        if (vc != null) {
            vc.parent = this;
            vc.splitViewController = this;
            this._detailView.addSubview(vc.view);
            this.addChildViewController(vc);
            this._detailViewController = vc;
        }
    };
    MIOSplitViewController.prototype.showDetailViewController = function (vc) {
        var oldVC = this._detailViewController;
        var newVC = vc;
        if (oldVC == newVC)
            return;
        newVC.onLoadView(this, function () {
            this._detailView.addSubview(newVC.view);
            this.addChildViewController(newVC);
            this._detailViewController = vc;
            _MIUShowViewController(oldVC, newVC, this, false, this, function () {
                oldVC.view.removeFromSuperview();
                this.removeChildViewController(oldVC);
            });
        });
    };
    Object.defineProperty(MIOSplitViewController.prototype, "masterViewController", {
        get: function () {
            return this._masterViewController;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOSplitViewController.prototype, "detailViewController", {
        get: function () {
            return this._detailViewController;
        },
        enumerable: true,
        configurable: true
    });
    return MIOSplitViewController;
}(MIOViewController));
/**
 * Created by godshadow on 25/08/16.
 */
/// <reference path="MIOCoreTypes.ts" />
/// <reference path="MIOView.ts" />
/// <reference path="MIOButton.ts" />
var MIOTabBarItem = (function (_super) {
    __extends(MIOTabBarItem, _super);
    function MIOTabBarItem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._titleStatusStyle = null;
        _this._titleLayer = null;
        _this._imageStatusStyle = null;
        _this._imageLayer = null;
        _this.isSelected = false;
        return _this;
    }
    MIOTabBarItem.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        if (this.layer.childNodes.length < 2)
            throw new Error("Tab bar item broken!");
        var count = 0;
        for (var index = 0; index < this.layer.childNodes.length; index++) {
            var l = this.layer.childNodes[index];
            if (l.tagName == "DIV") {
                count++;
                if (count == 1) {
                    this._imageLayer = l;
                    this._imageStatusStyle = l.getAttribute("data-status-style");
                }
                else if (count == 2) {
                    this._titleLayer = l;
                    this._titleStatusStyle = l.getAttribute("data-status-style");
                    break;
                }
            }
        }
    };
    MIOTabBarItem.prototype.setSelected = function (value) {
        if (value == true) {
            this._imageLayer.classList.remove(this._imageStatusStyle + "_off");
            this._imageLayer.classList.add(this._imageStatusStyle + "_on");
            this._titleLayer.classList.remove(this._titleStatusStyle + "_off");
            this._titleLayer.classList.add(this._titleStatusStyle + "_on");
        }
        else {
            this._imageLayer.classList.remove(this._imageStatusStyle + "_on");
            this._imageLayer.classList.add(this._imageStatusStyle + "_off");
            this._titleLayer.classList.remove(this._titleStatusStyle + "_on");
            this._titleLayer.classList.add(this._titleStatusStyle + "_off");
        }
        this.isSelected = value;
    };
    return MIOTabBarItem;
}(MIOView));
var MIOTabBar = (function (_super) {
    __extends(MIOTabBar, _super);
    function MIOTabBar() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.items = [];
        _this.selectedTabBarItemIndex = -1;
        return _this;
    }
    MIOTabBar.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        // TODO: change to buttons
        // Check for tab items
        for (var index = 0; index < this.layer.childNodes.length; index++) {
            var tabItemLayer = this.layer.childNodes[index];
            if (tabItemLayer.tagName == "DIV") {
                var ti = new MIOTabBarItem();
                ti.initWithLayer(tabItemLayer);
                this._addTabBarItem(ti);
            }
        }
        if (this.items.length > 0)
            this.selectTabBarItemAtIndex(0);
    };
    MIOTabBar.prototype._addTabBarItem = function (item) {
        this.items.push(item);
        var instance = this;
        item.layer.onclick = function () {
            instance.selectTabBarItem.call(instance, item);
        };
    };
    MIOTabBar.prototype.addTabBarItem = function (item) {
        this._addTabBarItem(item);
        this.addSubview(item);
    };
    MIOTabBar.prototype.selectTabBarItem = function (item) {
        var index = this.items.indexOf(item);
        if (index == this.selectedTabBarItemIndex)
            return;
        if (this.selectedTabBarItemIndex > -1) {
            // Deselect
            var lastItem = this.items[this.selectedTabBarItemIndex];
            lastItem.setSelected(false);
        }
        item.setSelected(true);
        this.willChangeValue("selectedTabBarItemIndex");
        this.selectedTabBarItemIndex = index;
        this.didChangeValue("selectedTabBarItemIndex");
    };
    MIOTabBar.prototype.selectTabBarItemAtIndex = function (index) {
        var item = this.items[index];
        this.selectTabBarItem(item);
    };
    MIOTabBar.prototype.layout = function () {
        var len = this.items.length;
        var width = this.getWidth();
        var w = width / len;
        var x = 0;
        for (var index = 0; index < this.items.length; index++) {
            var item = this.items[index];
            item.setFrame(MIOFrame.frameWithRect(x, 0, w, this.getHeight()));
            x += w;
        }
    };
    return MIOTabBar;
}(MIOView));
/**
 * Created by godshadow on 24/08/16.
 */
/// <reference path="MIOViewController.ts" />
/// <reference path="MIOTabBar.ts" />
var MIOTabBarController = (function (_super) {
    __extends(MIOTabBarController, _super);
    function MIOTabBarController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.tabBar = null;
        _this.pageController = null;
        return _this;
    }
    MIOTabBarController.prototype.viewDidLoad = function () {
        _super.prototype.viewDidLoad.call(this);
        this.tabBar = new MIOTabBar(this.layerID + "tabbar");
        this.view.addSubview(this.tabBar);
    };
    MIOTabBarController.prototype.addTabBarViewController = function (vc) {
        this.addChildViewController(vc);
        vc.onLoadLayer(this, function () {
            this.tabBar.addTabBarItem(vc.tabBarItem);
            this.pageController.addPageViewController(vc);
        });
    };
    return MIOTabBarController;
}(MIOViewController));
/**
 * Created by godshadow on 20/5/16.
 */
/// <reference path="MIOObject.ts" />
/// <reference path="MIOUserDefaults.ts" />
/// <reference path="MIOString.ts" />
/// <reference path="MIODate.ts" />
/// <reference path="MIOUUID.ts" />
/// <reference path="MIONotificationCenter.ts" />
/// <reference path="MIOWebApplication.ts" />
/// <reference path="MIOURLConnection.ts" />
/// <reference path="MIOManagedObjectContext.ts" />
/// <reference path="MIOFetchedResultsController.ts" />
/// <reference path="MIOView.ts" />
/// <reference path="MIOWindow.ts" />
/// <reference path="MIOLabel.ts" />
/// <reference path="MIOTableView.ts" />
/// <reference path="MIOCollectionView.ts" />
/// <reference path="MIOCalendarView.ts" />
/// <reference path="MIOImageView.ts" />
/// <reference path="MIOActivityIndicator.ts" />
/// <reference path="MIOWebView.ts" />
/// <reference path="MIOControl.ts" />
/// <reference path="MIOButton.ts" />
/// <reference path="MIOPopUpButton.ts" />
/// <reference path="MIOCheckButton.ts" />
/// <reference path="MIOTextField.ts" />
/// <reference path="MIOTextArea.ts" />
/// <reference path="MIOViewController.ts" />
/// <reference path="MIOViewController_Animation.ts" />
/// <reference path="MIOViewController_PopoverPresentationController.ts" />
/// <reference path="MIONavigationController.ts" />
/// <reference path="MIOPageController.ts" />
/// <reference path="MIOSplitViewController.ts" />
/// <reference path="MIOTabBarController.ts" />
/// <reference path="MIOUIKit.ts" />
var MIOLibIsLoaded = false;
var _MIOLibLoadedTarget = null;
var _MIOLibLoadedCompletion = null;
var _MIOLibFileIndex = 0;
var _MIOLibFiles = [];
var _mc_force_mobile = false;
var MIOLibInitType;
(function (MIOLibInitType) {
    MIOLibInitType[MIOLibInitType["Release"] = 0] = "Release";
    MIOLibInitType[MIOLibInitType["Debug"] = 1] = "Debug";
})(MIOLibInitType || (MIOLibInitType = {}));
var _MIOLibMainFn = null;
function MIOLibInit(mainFn, type) {
    _MIOLibMainFn = mainFn;
    MIOLibDecodeParams(window.location.search, this, function (param, value) {
        // Only for test
        if (param == "forceMobile")
            _mc_force_mobile = value == "true" ? true : false;
    });
    // If debug load MIOJS Libs
    if (type == MIOLibInitType.Debug) {
        _MIOLibDownloadLibFiles();
    }
}
function MIOLibDownloadScript(url, target, completion) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status == 200 && xhr.responseText != null) {
            // success!
            completion.call(target, xhr.responseText);
        }
        else {
            throw "We couldn't download the mio libs";
        }
    };
    xhr.open("GET", url);
    xhr.send();
}
function MIOLibLoadStyle(url) {
    var ss = document.createElement("link");
    ss.type = "text/css";
    ss.rel = "stylesheet";
    ss.href = url;
    document.getElementsByTagName("head")[0].appendChild(ss);
}
function MIOLibLoadScript(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    //script.onreadystatechange = callback;
    script.onload = callback;
    // Fire the loading
    head.appendChild(script);
}
function MIOLibLoadScriptCallback() {
    console.log("Download completed " + _MIOLibFileIndex);
    _MIOLibFileIndex++;
    if (_MIOLibFileIndex < _MIOLibFiles.length)
        MIOLibDownloadNextFile();
    else {
        MIOLibIsLoaded = true;
        if (_MIOLibLoadedCompletion != null && _MIOLibLoadedTarget != null)
            _MIOLibLoadedCompletion.call(_MIOLibLoadedTarget);
        _MIOLibLoadedTarget = null;
        _MIOLibLoadedCompletion = null;
    }
}
function MIOLibDownloadNextFile() {
    var file = _MIOLibFiles[_MIOLibFileIndex];
    var url = "src/miolib/" + file + ".js";
    console.log("Downloading " + url + " (" + _MIOLibFileIndex + ")");
    MIOLibLoadScript(url, MIOLibLoadScriptCallback);
}
function MIOLibOnLoaded(target, completion) {
    if (MIOLibIsLoaded == true) {
        completion.call(target);
    }
    else {
        MIOLibLoadStyle("src/miolib/extras/animate.min.css");
        if (_MIOLibFiles.length == 0) {
            MIOLibIsLoaded = true;
            completion.call(target);
        }
        else {
            _MIOLibLoadedTarget = target;
            _MIOLibLoadedCompletion = completion;
            MIOLibDownloadNextFile();
        }
    }
}
function MIOLibDownloadLibFile(file) {
    _MIOLibFiles.push(file);
    console.log("Added file to download: " + file);
}
function MIOLibDownloadFile(file) {
    _MIOLibFiles.push("../" + file);
    console.log("Added file to download: " + file);
}
function MIOLibIsMobile() {
    if (_mc_force_mobile == true)
        return true;
    ///<summary>Detecting whether the browser is a mobile browser or desktop browser</summary>
    ///<returns>A boolean value indicating whether the browser is a mobile browser or not</returns>
    /*if (sessionStorage .desktop) // desktop storage
     return false;
     else if (localStorage.mobile) // mobile storage
     return true;*/
    // alternative
    //var mobile = ['iphone','ipad','android','blackberry','nokia','opera mini','windows mobile','windows phone','iemobile'];
    var mobile = ['iphone', 'android', 'blackberry', 'nokia', 'opera mini', 'windows mobile', 'windows phone', 'iemobile'];
    for (var i in mobile)
        if (navigator.userAgent.toLowerCase().indexOf(mobile[i].toLowerCase()) > 0)
            return true;
    // nothing found.. assume desktop
    return false;
}
function MIOLibIsRetina() {
    var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
            (min--moz-device-pixel-ratio: 1.5),\
            (-o-min-device-pixel-ratio: 3/2),\
            (min-resolution: 1.5dppx)";
    if (window.devicePixelRatio > 1)
        return true;
    if (window.matchMedia && window.matchMedia(mediaQuery).matches)
        return true;
    return false;
}
function MIOLibDecodeParams(string, target, completion) {
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
            MIOLibEvaluateParam(param, value, target, completion);
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
    MIOLibEvaluateParam(param, value, target, completion);
}
function MIOLibEvaluateParam(param, value, target, completion) {
    if (target != null && completion != null)
        completion.call(target, param, value);
}
// Download files individually in debug mode
function _MIOLibDownloadLibFiles() {
    // MIOLib files
    MIOLibDownloadLibFile("MIOCore");
    MIOLibDownloadLibFile("MIOCoreTypes");
    MIOLibDownloadLibFile("MIOObject");
    MIOLibDownloadLibFile("MIOUserDefaults");
    MIOLibDownloadLibFile("MIOString");
    MIOLibDownloadLibFile("MIODate");
    MIOLibDownloadLibFile("Date_MIO");
    MIOLibDownloadLibFile("MIOUUID");
    MIOLibDownloadLibFile("MIONotificationCenter");
    MIOLibDownloadLibFile("MIOWebApplication");
    MIOLibDownloadLibFile("MIOURLConnection");
    MIOLibDownloadLibFile("MIOBundle");
    MIOLibDownloadLibFile("MIOPredicate");
    MIOLibDownloadLibFile("MIOSortDescriptor");
    MIOLibDownloadLibFile("MIOManagedObjectContext");
    MIOLibDownloadLibFile("MIOFetchedResultsController");
    MIOLibDownloadLibFile("MIOView");
    MIOLibDownloadLibFile("MIOScrollView");
    MIOLibDownloadLibFile("MIOWindow");
    MIOLibDownloadLibFile("MIOLabel");
    MIOLibDownloadLibFile("MIOTableView");
    MIOLibDownloadLibFile("MIOCollectionView");
    MIOLibDownloadLibFile("MIOCalendarView");
    MIOLibDownloadLibFile("MIOImageView");
    MIOLibDownloadLibFile("MIOMenu");
    MIOLibDownloadLibFile("MIOActivityIndicator");
    MIOLibDownloadLibFile("MIOWebView");
    MIOLibDownloadLibFile("MIOControl");
    MIOLibDownloadLibFile("MIOButton");
    MIOLibDownloadLibFile("MIOComboBox");
    MIOLibDownloadLibFile("MIOPopUpButton");
    MIOLibDownloadLibFile("MIOCheckButton");
    MIOLibDownloadLibFile("MIOSegmentedControl");
    MIOLibDownloadLibFile("MIOTextField");
    MIOLibDownloadLibFile("MIOTextArea");
    MIOLibDownloadLibFile("MIOTabBar");
    MIOLibDownloadLibFile("MIOPageControl");
    MIOLibDownloadLibFile("MIOViewController");
    MIOLibDownloadLibFile("MIOViewController_Animation");
    MIOLibDownloadLibFile("MIOViewController_PresentationController");
    MIOLibDownloadLibFile("MIOViewController_PopoverPresentationController");
    MIOLibDownloadLibFile("MIONavigationController");
    MIOLibDownloadLibFile("MIOPageController");
    MIOLibDownloadLibFile("MIOSplitViewController");
    MIOLibDownloadLibFile("MIOUIKit");
    MIOLibDownloadLibFile("webworkers/MIOHTMLParser");
}
/*
    Window events mapping
*/
window.onload = function () {
    MIOLibOnLoaded(this, function () {
        _MIOLibMainFn(null);
    });
};
window.onresize = function (e) {
    if (MIOLibIsLoaded == false)
        return;
    var app = MIOWebApplication.sharedInstance();
    app.forwardResizeEvent.call(app, e);
};
window.addEventListener("click", function (e) {
    if (MIOLibIsLoaded == false)
        return;
    var app = MIOWebApplication.sharedInstance();
    app.forwardClickEvent.call(app, e.target, e.clientX, e.clientY);
    //e.preventDefault();
}, false);
window.addEventListener('touchend', function (e) {
    if (MIOLibIsLoaded == false)
        return;
    //TODO: Declare changedTouches interface for typescript
    var touch = e.changedTouches[0]; // reference first touch point for this event
    var app = MIOWebApplication.sharedInstance();
    app.forwardClickEvent.call(app, e.target, touch.clientX, touch.clientY);
    //e.preventDefault();
}, false);
// output errors to console log
window.onerror = function (e) {
    console.log("window.onerror ::" + JSON.stringify(e));
};
/**
 * Created by godshadow on 13/12/2016.
 */
/// <reference path="miolibs/MIOLib.ts" />
var ViewController = (function (_super) {
    __extends(ViewController, _super);
    function ViewController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ViewController.prototype.viewDidLoad = function () {
        _super.prototype.viewDidLoad.call(this);
    };
    return ViewController;
}(MIOViewController));
/**
 * Created by godshadow on 26/08/16.
 */
/// <reference path="miolibs/MIOLib.ts" />
/// <reference path="ViewController.ts" />
var AppDelegate = (function () {
    function AppDelegate() {
        this.window = null;
        this._managedObjectContext = null;
    }
    AppDelegate.prototype.didFinishLaunching = function () {
        var vc = new ViewController("view");
        vc.initWithResource("layout/View.html");
        this.window = new MIOWindow();
        this.window.initWithRootViewController(vc);
    };
    Object.defineProperty(AppDelegate.prototype, "managedObjectContext", {
        get: function () {
            if (this._managedObjectContext != null)
                return this._managedObjectContext;
            // TODO: make object model and persistent store coordinator
            this._managedObjectContext = new MIOManagedObjectContext();
            this._managedObjectContext.init();
            return this._managedObjectContext;
        },
        enumerable: true,
        configurable: true
    });
    return AppDelegate;
}());
/**
 * Created by godshadow on 2/5/16.
 */
/// <reference path="MIOControl.ts" />
var MIOComboBox = (function (_super) {
    __extends(MIOComboBox, _super);
    function MIOComboBox() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._selectLayer = null;
        _this.target = null;
        _this.action = null;
        return _this;
    }
    MIOComboBox.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this._selectLayer = MIOLayerGetFirstElementWithTag(this.layer, "SELECT");
        if (this._selectLayer == null) {
            this._selectLayer = document.createElement("select");
            this.layer.appendChild(this._selectLayer);
        }
    };
    MIOComboBox.prototype.setAllowMultipleSelection = function (value) {
        if (value == true)
            this._selectLayer.setAttribute("multiple", "multiple");
        else
            this._selectLayer.removeAttribute("multiple");
    };
    MIOComboBox.prototype.layout = function () {
        _super.prototype.layout.call(this);
        var w = this.getWidth();
        var h = this.getHeight();
        this._selectLayer.style.marginLeft = "8px";
        this._selectLayer.style.width = (w - 16) + "px";
        this._selectLayer.style.marginTop = "4px";
        this._selectLayer.style.height = (h - 8) + "px";
        var color = this.getBackgroundColor();
        this._selectLayer.style.backgroundColor = color;
    };
    MIOComboBox.prototype.addItem = function (text, value) {
        var option = document.createElement("option");
        option.innerHTML = text;
        if (value != null)
            option.value = value;
        this._selectLayer.appendChild(option);
    };
    MIOComboBox.prototype.addItems = function (items) {
        for (var count = 0; count < items.length; count++) {
            var text = items[count];
            this.addItem(text);
        }
    };
    MIOComboBox.prototype.removeAllItems = function () {
        var node = this._selectLayer;
        while (this._selectLayer.hasChildNodes()) {
            if (node.hasChildNodes()) {
                node = node.lastChild; // set current node to child
            }
            else {
                node = node.parentNode; // set node to parent
                node.removeChild(node.lastChild); // remove last node
            }
        }
    };
    MIOComboBox.prototype.getItemAtIndex = function (index) {
        if (this._selectLayer.childNodes.length == 0)
            return null;
        var option = this._selectLayer.childNodes[index];
        return option.innerHTML;
    };
    MIOComboBox.prototype.getSelectedItem = function () {
        return this._selectLayer.value;
    };
    MIOComboBox.prototype.getSelectedItemText = function () {
        for (var index = 0; index < this._selectLayer.childNodes.length; index++) {
            var option = this._selectLayer.childNodes[index];
            if (this._selectLayer.value == option.value)
                return option.innerHTML;
        }
    };
    MIOComboBox.prototype.selectItem = function (item) {
        this._selectLayer.value = item;
    };
    MIOComboBox.prototype.setOnChangeAction = function (target, action) {
        this.target = target;
        this.action = action;
        var instance = this;
        this._selectLayer.onchange = function () {
            if (instance.enabled)
                instance.action.call(target, instance._selectLayer.value);
        };
    };
    return MIOComboBox;
}(MIOControl));
/**
 * Created by godshadow on 30/3/16.
 */
/// <reference path="MIOObject.ts" />
/// <reference path="MIOWebApplication.ts" />
var MIOLocale = (function (_super) {
    __extends(MIOLocale, _super);
    function MIOLocale() {
        return _super.call(this) || this;
    }
    MIOLocale.currentLocale = function () {
        return MIOWebApplication.sharedInstance().currentLanguage;
    };
    return MIOLocale;
}(MIOObject));
/**
 * Created by godshadow on 31/08/16.
 */
/// <reference path="MIOButton.ts" />
var MIOPageControl = (function (_super) {
    __extends(MIOPageControl, _super);
    function MIOPageControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.numberOfPages = 0;
        _this._items = [];
        _this._currentPage = -1;
        return _this;
    }
    MIOPageControl.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        // Check for page items
        for (var index = 0; index < this.layer.childNodes.length; index++) {
            var itemLayer = this.layer.childNodes[index];
            if (itemLayer.tagName == "DIV") {
                var i = new MIOButton();
                i.initWithLayer(itemLayer);
                this._items.push(i);
            }
        }
        if (this._items.length > 0)
            this.currentPage = 0;
    };
    Object.defineProperty(MIOPageControl.prototype, "currentPage", {
        get: function () {
            return this._currentPage;
        },
        set: function (index) {
            if (this._currentPage == index)
                return;
            if (this._currentPage > -1) {
                var i = this._items[this._currentPage];
                i.setSelected(false);
            }
            var i = this._items[index];
            i.setSelected(true);
            this._currentPage = index;
        },
        enumerable: true,
        configurable: true
    });
    return MIOPageControl;
}(MIOControl));
/**
 * Created by godshadow on 01/09/16.
 */
/// <reference path="MIOView.ts" />
var MIOScrollView = (function (_super) {
    __extends(MIOScrollView, _super);
    function MIOScrollView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.pagingEnabled = false;
        _this.delegate = null;
        _this._lastOffsetX = 0;
        return _this;
    }
    MIOScrollView.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        var instance = this;
        this.layer.onscroll = function (e) {
            instance._layerDidScroll.call(instance);
        };
        this.layer.onwheel = function () {
            instance._layerDidMouseUp.call(instance);
        };
    };
    MIOScrollView.prototype._layerDidMouseUp = function () {
        // if (this.pagingEnabled)
        // {
        //     var width = this.getWidth();
        //     var offset = this.layer.scrollLeft;
        //     if (this._lastOffsetX < offset)
        //     {
        //         // to the right
        //         if (offset >= width)
        //         {
        //             this.layer.classList.add("scroll_left_animation");
        //             this.layer.style.transform = "translate(" + width + "px)";
        //         }
        //     }
        //     else
        //     {
        //         // to the left
        //     }
        // }
    };
    MIOScrollView.prototype._layerDidScroll = function () {
        if (this.delegate != null && typeof this.delegate.scrollViewDidScroll === "function")
            this.delegate.scrollViewDidScroll.call(this.delegate, this);
    };
    Object.defineProperty(MIOScrollView.prototype, "contentOffset", {
        get: function () {
            var p = new MIOPoint(this.layer.scrollLeft, this.layer.scrollTop);
            return p;
        },
        enumerable: true,
        configurable: true
    });
    MIOScrollView.prototype.scrollToTop = function (animate) {
        // if (true)
        //     this.layer.style.transition = "scrollTop 0.25s";
        this.layer.scrollTop = 0;
    };
    MIOScrollView.prototype.scrollToBottom = function (animate) {
        // if (true)
        //     this.layer.style.transition = "scrollTop 0.25s";
        this.layer.scrollTop = this.layer.scrollHeight;
    };
    MIOScrollView.prototype.scrollRectToVisible = function (rect, animate) {
        //TODO: Implenet this
    };
    return MIOScrollView;
}(MIOView));
/**
 * Created by godshadow on 29/08/16.
 */
/// <reference path="MIOControl.ts" />
/// <reference path="MIOButton.ts" />
var MIOSegmentedControl = (function (_super) {
    __extends(MIOSegmentedControl, _super);
    function MIOSegmentedControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.segmentedItems = [];
        _this.selectedSegmentedIndex = -1;
        return _this;
    }
    MIOSegmentedControl.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        // Check for segmented items
        var opts = {};
        var sp = layer.getAttribute("data-status-style-prefix");
        if (sp != null)
            opts["status-style-prefix"] = sp;
        for (var index = 0; index < this.layer.childNodes.length; index++) {
            var itemLayer = this.layer.childNodes[index];
            if (itemLayer.tagName == "DIV") {
                var si = new MIOButton();
                si.initWithLayer(itemLayer, opts);
                si.type = MIOButtonType.PushIn;
                this._addSegmentedItem(si);
            }
        }
        if (this.segmentedItems.length > 0) {
            var item = this.segmentedItems[0];
            item.setSelected(true);
            this.selectedSegmentedIndex = 0;
        }
    };
    MIOSegmentedControl.prototype._addSegmentedItem = function (item) {
        this.segmentedItems.push(item);
        item.setAction(this, this._didClickSegmentedButton);
    };
    MIOSegmentedControl.prototype._didClickSegmentedButton = function (button) {
        var index = this.segmentedItems.indexOf(button);
        this.selectSegmentedAtIndex(index);
        if (this.mouseOutTarget != null)
            this.mouseOutAction.call(this.mouseOutTarget, index);
    };
    MIOSegmentedControl.prototype.setAction = function (target, action) {
        this.mouseOutTarget = target;
        this.mouseOutAction = action;
    };
    MIOSegmentedControl.prototype.selectSegmentedAtIndex = function (index) {
        if (this.selectedSegmentedIndex == index)
            return;
        if (this.selectedSegmentedIndex > -1) {
            var lastItem = this.segmentedItems[this.selectedSegmentedIndex];
            lastItem.setSelected(false);
        }
        this.selectedSegmentedIndex = index;
    };
    return MIOSegmentedControl;
}(MIOControl));
/**
 * Created by godshadow on 22/5/16.
 */
/// <reference path="MIOButton.ts" />
var MIOToolbarButton = (function (_super) {
    __extends(MIOToolbarButton, _super);
    function MIOToolbarButton() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOToolbarButton.buttonWithLayer = function (layer) {
        var tb = new MIOToolbarButton();
        tb.initWithLayer(layer);
        return tb;
    };
    return MIOToolbarButton;
}(MIOButton));
var MIOToolbar = (function (_super) {
    __extends(MIOToolbar, _super);
    function MIOToolbar() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.buttons = [];
        return _this;
    }
    MIOToolbar.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        // Check if we have sub nodes
        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var layer = this.layer.childNodes[index];
                if (layer.tagName == "DIV") {
                    var button = MIOToolbarButton.buttonWithLayer(layer);
                    button.parent = this;
                    this._linkViewToSubview(button);
                    this.addToolbarButton(button);
                }
            }
        }
    };
    MIOToolbar.prototype.addToolbarButton = function (button) {
        this.buttons.push(button);
    };
    return MIOToolbar;
}(MIOView));
