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
Array.prototype.addObject = function (object) {
    this.push(object);
};
Array.prototype.removeObject = function (object) {
    var index = this.indexOf(object);
    if (index > -1) {
        this.splice(index, 1);
    }
};
Array.prototype.removeObjectAtIndex = function (index) {
    this.splice(index, 1);
};
Array.prototype.indexOfObject = function (object) {
    return this.indexOf(object);
};
Array.prototype.containsObject = function (object) {
    var index = this.indexOf(object);
    return index > -1 ? true : false;
};
Array.prototype.objectAtIndex = function (index) {
    return this[index];
};
Object.defineProperty(Array.prototype, "count", {
    get: function () {
        return this.length;
    },
    enumerable: true,
    configurable: true
});
var MIOObject = (function () {
    function MIOObject() {
        this.keyPaths = {};
    }
    Object.defineProperty(MIOObject.prototype, "className", {
        get: function () {
            var comp = this.constructor;
            return comp.name;
        },
        enumerable: true,
        configurable: true
    });
    MIOObject.prototype.init = function () { };
    MIOObject.prototype._notifyValueChange = function (key, type) {
        var observers = this.keyPaths[key];
        if (observers == null)
            return;
        var obs = [];
        for (var count = 0; count < observers.length; count++) {
            var item = observers[count];
            obs.push(item);
        }
        for (var count = 0; count < obs.length; count++) {
            var item = obs[count];
            var o = item["OBS"];
            if (typeof o.observeValueForKeyPath === "function") {
                var keyPath = item["KP"] != null ? item["KP"] : key;
                var ctx = item["CTX"];
                o.observeValueForKeyPath.call(o, keyPath, type, this, ctx);
            }
        }
    };
    MIOObject.prototype.willChangeValueForKey = function (key) {
        this.willChangeValue(key);
    };
    MIOObject.prototype.didChangeValueForKey = function (key) {
        this.didChangeValue(key);
    };
    MIOObject.prototype.willChangeValue = function (key) {
        this._notifyValueChange(key, "will");
    };
    MIOObject.prototype.didChangeValue = function (key) {
        this._notifyValueChange(key, "did");
    };
    MIOObject.prototype._addObserver = function (obs, key, context, keyPath) {
        var observers = this.keyPaths[key];
        if (observers == null) {
            observers = [];
            this.keyPaths[key] = observers;
        }
        var item = { "OBS": obs };
        if (context != null)
            item["CTX"] = context;
        if (keyPath != null)
            item["KP"] = keyPath;
        observers.push(item);
    };
    MIOObject.prototype._keyFromKeypath = function (keypath) {
        var index = keypath.indexOf('.');
        if (index == -1) {
            return [keypath, null];
        }
        var key = keypath.substring(0, index);
        var offset = keypath.substring(index + 1);
        return [key, offset];
    };
    MIOObject.prototype.addObserver = function (obs, keypath, context) {
        var _a = this._keyFromKeypath(keypath), key = _a[0], offset = _a[1];
        if (offset == null) {
            this._addObserver(obs, key, context);
        }
        else {
            var obj = this;
            var exit = false;
            while (exit == false) {
                if (offset == null) {
                    obj._addObserver(obs, key, context, keypath);
                    exit = true;
                }
                else {
                    obj = this.valueForKey(key);
                    _b = this._keyFromKeypath(offset), key = _b[0], offset = _b[1];
                }
                if (obj == null)
                    throw ("ERROR: Registering observer to null object");
            }
        }
        var _b;
    };
    MIOObject.prototype.removeObserver = function (obs, keypath) {
        var observers = this.keyPaths[keypath];
        if (observers == null)
            return;
        var index = observers.indexOf(obs);
        observers.splice(index, 1);
    };
    MIOObject.prototype.setValueForKey = function (value, key) {
        this.willChangeValue(key);
        this[key] = value;
        this.didChangeValue(value);
    };
    MIOObject.prototype.valueForKey = function (key) {
        return this[key];
    };
    MIOObject.prototype.valueForKeyPath = function (keyPath) {
        var _a = this._keyFromKeypath(keyPath), key = _a[0], offset = _a[1];
        var value = null;
        var obj = this;
        var exit = false;
        while (exit == false) {
            if (offset == null) {
                value = obj.valueForKey(key);
                exit = true;
            }
            else {
                obj = obj.valueForKey(key);
                _b = this._keyFromKeypath(offset), key = _b[0], offset = _b[1];
                if (obj == null)
                    exit = true;
            }
        }
        return value;
        var _b;
    };
    MIOObject.prototype.copy = function () {
        var obj = MIOClassFromString(this.className);
        obj.init();
        return obj;
    };
    return MIOObject;
}());
var MIOURLTokenType;
(function (MIOURLTokenType) {
    MIOURLTokenType[MIOURLTokenType["Protocol"] = 0] = "Protocol";
    MIOURLTokenType[MIOURLTokenType["Host"] = 1] = "Host";
    MIOURLTokenType[MIOURLTokenType["Path"] = 2] = "Path";
    MIOURLTokenType[MIOURLTokenType["Param"] = 3] = "Param";
    MIOURLTokenType[MIOURLTokenType["Value"] = 4] = "Value";
})(MIOURLTokenType || (MIOURLTokenType = {}));
var MIOURL = (function (_super) {
    __extends(MIOURL, _super);
    function MIOURL() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.baseURL = null;
        _this.absoluteString = null;
        _this.scheme = null;
        _this.user = null;
        _this.password = null;
        _this.host = null;
        _this.port = 0;
        _this.hostname = null;
        _this.path = "/";
        _this.file = null;
        _this.pathExtension = null;
        _this.params = [];
        return _this;
    }
    MIOURL.urlWithString = function (urlString) {
        var url = new MIOURL();
        url.initWithURLString(urlString);
        return url;
    };
    MIOURL.prototype.initWithScheme = function (scheme, host, path) {
        _super.prototype.init.call(this);
        this.scheme = scheme;
        this.host = host;
        this.path = path;
        this.absoluteString = "";
        if (scheme.length > 0)
            this.absoluteString += scheme + "://";
        if (host.length > 0)
            this.absoluteString += host + "/";
        if (path.length > 0)
            this.absoluteString += path;
    };
    MIOURL.prototype.initWithURLString = function (urlString) {
        _super.prototype.init.call(this);
        this.absoluteString = urlString;
        this._parseURLString(urlString);
    };
    MIOURL.prototype._parseURLString = function (urlString) {
        var param = "";
        var value = "";
        var token = "";
        var step = MIOURLTokenType.Protocol;
        var foundPort = false;
        var foundExt = false;
        for (var index = 0; index < urlString.length; index++) {
            var ch = urlString.charAt(index);
            if (ch == ":") {
                if (step == MIOURLTokenType.Protocol) {
                    this.scheme = token;
                    token = "";
                    index += 2;
                    step = MIOURLTokenType.Host;
                }
                else if (step == MIOURLTokenType.Host) {
                    this.hostname = token;
                    token = "";
                    foundPort = true;
                }
            }
            else if (ch == "/") {
                if (step == MIOURLTokenType.Host) {
                    if (foundPort == true) {
                        this.host = this.hostname + ":" + token;
                        this.port = parseInt(token);
                    }
                    else {
                        this.host = token;
                        this.hostname = token;
                    }
                    step = MIOURLTokenType.Path;
                }
                else {
                    this.path += token + ch;
                }
                token = "";
            }
            else if (ch == "." && step == MIOURLTokenType.Path) {
                this.file = token;
                foundExt = true;
                token = "";
            }
            else if (ch == "?") {
                if (foundExt == true) {
                    this.file += "." + token;
                    this.pathExtension = token;
                }
                else
                    this.file = token;
                token = "";
                step = MIOURLTokenType.Param;
            }
            else if (ch == "&") {
                var item = { "Key": param, "Value": value };
                this.params.push(item);
                step = MIOURLTokenType.Param;
                param = "";
                value = "";
            }
            else if (ch == "=") {
                param = token;
                step = MIOURLTokenType.Value;
                token = "";
            }
            else {
                token += ch;
            }
        }
        if (token.length > 0) {
            if (step == MIOURLTokenType.Path) {
                if (foundExt == true) {
                    this.file += "." + token;
                    this.pathExtension = token;
                }
                else
                    this.path += token;
            }
            else if (step == MIOURLTokenType.Param) {
                var i = { "key": token };
                this.params.push(i);
            }
            else if (step == MIOURLTokenType.Value) {
                var item = { "Key": param, "Value": token };
                this.params.push(item);
            }
        }
    };
    MIOURL.prototype.urlByAppendingPathComponent = function (path) {
        var urlString = this.scheme + "://" + this.host + this.path;
        if (urlString.charAt(urlString.length - 1) != "/")
            urlString += "/";
        if (path.charAt(0) != "/")
            urlString += path;
        else
            urlString += path.substr(1);
        var newURL = MIOURL.urlWithString(urlString);
        return newURL;
    };
    MIOURL.prototype.standardizedURL = function () {
        return null;
    };
    return MIOURL;
}(MIOObject));
var MIOBundle = (function (_super) {
    __extends(MIOBundle, _super);
    function MIOBundle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.url = null;
        _this._webBundle = null;
        return _this;
    }
    MIOBundle.mainBundle = function () {
        if (this._mainBundle == null) {
            var url = MIOCoreGetMainBundleURLString();
            this._mainBundle = new MIOBundle();
            this._mainBundle.initWithURL(url);
        }
        return this._mainBundle;
    };
    MIOBundle.prototype.initWithURL = function (url) {
        this.url = url;
    };
    MIOBundle.prototype.loadHTMLNamed = function (path, layerID, target, completion) {
        if (MIOCoreGetAppType() == MIOCoreAppType.Web) {
            if (this._webBundle == null) {
                this._webBundle = new MIOCoreBundle();
                this._webBundle.baseURL = this.url.absoluteString;
            }
            this._webBundle.loadHMTLFromPath(path, layerID, this, function (layerData) {
                var domParser = new DOMParser();
                var items = domParser.parseFromString(layerData, "text/html");
                var layer = items.getElementById(layerID);
                if (target != null && completion != null)
                    completion.call(target, layer);
            });
        }
    };
    MIOBundle.prototype._loadResourceFromURL = function (url, target, completion) {
        var request = MIOURLRequest.requestWithURL(url);
        var conn = new MIOURLConnection();
        conn.initWithRequestBlock(request, this, function (error, data) {
            completion.call(target, data);
        });
    };
    MIOBundle._mainBundle = null;
    return MIOBundle;
}(MIOObject));
var MIODateFirstWeekDay;
(function (MIODateFirstWeekDay) {
    MIODateFirstWeekDay[MIODateFirstWeekDay["Sunday"] = 0] = "Sunday";
    MIODateFirstWeekDay[MIODateFirstWeekDay["Monday"] = 1] = "Monday";
})(MIODateFirstWeekDay || (MIODateFirstWeekDay = {}));
var _MIODateFirstWeekDay = MIODateFirstWeekDay.Monday;
var _MIODateStringDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var _MIODateStringMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function MIODateSetFirstWeekDay(day) {
    _MIODateFirstWeekDay = day;
    if (day == MIODateFirstWeekDay.Sunday)
        _MIODateStringDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    else
        _MIODateStringDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
}
function MIODateGetStringForMonth(month) {
    return _MIODateStringMonths[month];
}
function MIODateGetStringForDay(day) {
    return _MIODateStringDays[day];
}
function MIODateGetDayFromDate(date) {
    if (_MIODateFirstWeekDay == MIODateFirstWeekDay.Sunday)
        return date.getDay();
    var day = date.getDay();
    if (day == 0)
        day = 6;
    else
        day--;
    return day;
}
function MIODateGetDayStringFromDate(date) {
    var day = MIODateGetDayFromDate(date);
    return MIODateGetStringForDay(day);
}
function MIODateGetString(date) {
    var d = MIODateGetDateString(date);
    var t = MIODateGetTimeString(date);
    return d + " " + t;
}
function MIODateGetDateString(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();
    return yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]);
}
function MIODateGetTimeString(date) {
    var hh = date.getHours().toString();
    var mm = date.getMinutes().toString();
    return (hh[1] ? hh : "0" + hh[0]) + ":" + (mm[1] ? mm : "0" + mm[0]);
}
function MIODateGetUTCString(date) {
    var d = MIODateGetUTCDateString(date);
    var t = MIODateGetUTCTimeString(date);
    return d + " " + t;
}
function MIODateGetUTCDateString(date) {
    var yyyy = date.getUTCFullYear().toString();
    var mm = (date.getUTCMonth() + 1).toString();
    var dd = date.getUTCDate().toString();
    return yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]);
}
function MIODateGetUTCTimeString(date) {
    var hh = date.getUTCHours().toString();
    var mm = date.getUTCMinutes().toString();
    var ss = date.getUTCSeconds().toString();
    return (hh[1] ? hh : "0" + hh[0]) + ":" + (mm[1] ? mm : "0" + mm[0]) + ":" + (ss[1] ? ss : "0" + ss[0]);
}
function MIODateFromString(string) {
    var lexer = new MIOCoreLexer(string);
    lexer.addTokenType(0, /^[0-9]{4}-/i);
    lexer.addTokenType(1, /^[0-9]{2}-/i);
    lexer.addTokenType(2, /^[0-9]{2} /i);
    lexer.addTokenType(3, /^[0-9]{2}:/i);
    lexer.addTokenType(4, /^[0-9]{2}/i);
    lexer.tokenize();
    var y = -1;
    var m = -1;
    var d = -1;
    var h = -1;
    var mm = -1;
    var s = -1;
    var token = lexer.nextToken();
    while (token != null) {
        switch (token.type) {
            case 0:
                y = parseInt(token.value.substring(0, 4));
                break;
            case 1:
                if (y == -1)
                    return null;
                m = parseInt(token.value.substring(0, 2)) - 1;
                break;
            case 2:
                if (m == -1)
                    return null;
                d = parseInt(token.value.substring(0, 2));
                break;
            case 3:
                if (d == -1)
                    return null;
                if (h == -1)
                    h = parseInt(token.value.substring(0, 2));
                else if (mm == -1)
                    mm = parseInt(token.value.substring(0, 2));
                else
                    return null;
                break;
            case 4:
                if (mm == -1) {
                    d = parseInt(token.value.substring(0, 2));
                }
                else
                    s = parseInt(token.value);
                break;
            default:
                return null;
        }
        token = lexer.nextToken();
    }
    if (h == -1)
        h = 0;
    if (mm == -1)
        mm = 0;
    if (s == -1)
        s = 0;
    var date = new Date(y, m, d, h, mm, s);
    return date;
}
function MIODateToUTC(date) {
    var dif = date.getTimezoneOffset();
    var d = new Date();
    d.setTime(date.getTime() + (dif * 60 * 1000));
    return d;
}
function MIODateAddDaysToDateString(dateString, days) {
    var d = MIODateFromString(dateString);
    d.setDate(d.getDate() + parseInt(days));
    var ds = MIODateGetDateString(d);
    return ds;
}
function MIODateRemoveDaysToDateString(dateString, days) {
    var d = MIODateFromString(dateString);
    d.setDate(d.getDate() - parseInt(days));
    var ds = MIODateGetDateString(d);
    return ds;
}
function MIODateFromMiliseconds(miliseconds) {
    var mEpoch = parseInt(miliseconds);
    if (mEpoch < 10000000000)
        mEpoch *= 1000;
    var ds = new Date();
    ds.setTime(mEpoch);
    return ds;
}
function isDate(x) {
    return (null != x) && !isNaN(x) && ("undefined" !== typeof x.getDate);
}
function MIODateToday() {
    var d = new Date();
    d.setHours(0, 0, 0);
    return d;
}
function MIODateNow() {
    return new Date();
}
function MIODateTodayString() {
    var d = MIODateToday();
    return MIODateGetString(d);
}
function MIODateYesterday() {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0);
    return d;
}
function MIODateTomorrow() {
    var d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0);
    return d;
}
function MIODateGetFirstDayOfTheWeek(date) {
    var dayString = MIODateGetDateString(date);
    var firstDayString = MIODateRemoveDaysToDateString(dayString, date.getDay() - 1);
    var first = MIODateFromString(firstDayString);
    return first;
}
function MIODateGetLastDayOfTheWeek(date) {
    var dayString = MIODateGetDateString(date);
    var lastDayString = MIODateAddDaysToDateString(dayString, (7 - date.getDay()));
    var last = MIODateFromString(lastDayString);
    return last;
}
var MIOFormatter = (function (_super) {
    __extends(MIOFormatter, _super);
    function MIOFormatter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOFormatter.prototype.stringForObjectValue = function (value) {
        return value;
    };
    MIOFormatter.prototype.getObjectValueForString = function (str) {
    };
    MIOFormatter.prototype.editingStringForObjectValue = function (value) {
    };
    MIOFormatter.prototype.isPartialStringValid = function (str) {
        var newStr = "";
        return [false, newStr];
    };
    return MIOFormatter;
}(MIOObject));
var MIODateFormatterStyle;
(function (MIODateFormatterStyle) {
    MIODateFormatterStyle[MIODateFormatterStyle["NoStyle"] = 0] = "NoStyle";
    MIODateFormatterStyle[MIODateFormatterStyle["ShortStyle"] = 1] = "ShortStyle";
    MIODateFormatterStyle[MIODateFormatterStyle["MediumStyle"] = 2] = "MediumStyle";
    MIODateFormatterStyle[MIODateFormatterStyle["LongStyle"] = 3] = "LongStyle";
    MIODateFormatterStyle[MIODateFormatterStyle["FullStyle"] = 4] = "FullStyle";
})(MIODateFormatterStyle || (MIODateFormatterStyle = {}));
var MIODateFormatter = (function (_super) {
    __extends(MIODateFormatter, _super);
    function MIODateFormatter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dateStyle = MIODateFormatterStyle.ShortStyle;
        _this.timeStyle = MIODateFormatterStyle.ShortStyle;
        _this.browserDateSeparatorSymbol = null;
        return _this;
    }
    MIODateFormatter.prototype.init = function () {
        _super.prototype.init.call(this);
        var browser = MIOCoreGetBrowser();
        if (browser == MIOCoreBrowserType.Safari)
            this.browserDateSeparatorSymbol = "/";
        else
            this.browserDateSeparatorSymbol = "-";
    };
    MIODateFormatter.prototype.dateFromString = function (str) {
        var result, value, dateString;
        if (!str || str.length <= 0)
            return null;
        _a = this._parse(str), result = _a[0], value = _a[1], dateString = _a[2];
        if (result == true) {
            var date = Date.parse(dateString);
            return isNaN(date) == false ? new Date(dateString) : null;
        }
        return null;
        var _a;
    };
    MIODateFormatter.prototype.stringFromDate = function (date) {
        return this.stringForObjectValue(date);
    };
    MIODateFormatter.prototype.stringForObjectValue = function (value) {
        var date = value;
        if (date == null)
            return null;
        var str = "";
        switch (this.dateStyle) {
            case MIODateFormatterStyle.ShortStyle:
                str = this._shortDateStyle(date);
                break;
            case MIODateFormatterStyle.FullStyle:
                str = this._fullDateStyle(date);
                break;
        }
        if (this.dateStyle != MIODateFormatterStyle.NoStyle && this.timeStyle != MIODateFormatterStyle.NoStyle)
            str += " ";
        switch (this.timeStyle) {
            case MIODateFormatterStyle.ShortStyle:
                str += this._shortTimeStyle(date);
                break;
        }
        return str;
    };
    MIODateFormatter.prototype.isPartialStringValid = function (str) {
        if (str.length == 0)
            return [true, str];
        var result, newStr;
        _a = this._parse(str), result = _a[0], newStr = _a[1];
        return [result, newStr];
        var _a;
    };
    MIODateFormatter.prototype._parse = function (str) {
        var result, newStr, value;
        var dateString = "";
        if (this.dateStyle != MIODateFormatterStyle.NoStyle) {
            _a = this._parseDate(str), result = _a[0], newStr = _a[1], value = _a[2];
            if (result == false)
                return [result, newStr, value];
            dateString = value;
        }
        else {
            var today = new Date();
            dateString = this.iso8601DateStyle(today);
        }
        if (this.timeStyle != MIODateFormatterStyle.NoStyle) {
            _b = this._parseTime(str), result = _b[0], newStr = _b[1], value = _b[2];
            if (result == false) {
                return [result, newStr, value];
            }
            dateString += " " + value;
        }
        return [result, newStr, dateString];
        var _a, _b;
    };
    MIODateFormatter.prototype._parseDate = function (str) {
        var parseString = "";
        var step = 0;
        var dd = "";
        var mm = "";
        var yy = "";
        for (var index = 0; index < str.length; index++) {
            var ch = str[index];
            if (ch == "-" || ch == "." || ch == "/") {
                if (parseString.length == 0)
                    return [false, parseString, ""];
                parseString += "/";
                step++;
            }
            else {
                var result_1 = void 0, value = void 0;
                switch (step) {
                    case 0:
                        _a = this._parseDay(ch, dd), result_1 = _a[0], dd = _a[1];
                        break;
                    case 1:
                        _b = this._parseMonth(ch, mm), result_1 = _b[0], mm = _b[1];
                        break;
                    case 2:
                        _c = this._parseYear(ch, yy), result_1 = _c[0], yy = _c[1];
                        break;
                }
                if (result_1 == true)
                    parseString += ch;
                else
                    return [false, parseString, ""];
            }
        }
        var result = true;
        if (dd.length > 0)
            result = result && this._validateDay(dd);
        if (mm.length > 0)
            result = result && this._validateMonth(mm);
        if (yy.length > 0)
            result = result && this._validateYear(yy);
        if (result == false)
            return [false, parseString, null];
        var dateString = (yy[3] ? yy : ("20" + yy)) + this.browserDateSeparatorSymbol + (mm[1] ? mm : "0" + mm) + this.browserDateSeparatorSymbol + (dd[1] ? dd : "0" + dd);
        return [true, parseString, dateString];
        var _a, _b, _c;
    };
    MIODateFormatter.prototype._parseDay = function (ch, dd) {
        var c = parseInt(ch);
        if (isNaN(c))
            return [false, dd];
        var v = parseInt(dd + ch);
        return [true, dd + ch];
    };
    MIODateFormatter.prototype._validateDay = function (dd) {
        var v = parseInt(dd);
        if (isNaN(v))
            return false;
        if (dd < 1 || dd > 31)
            return false;
        return true;
    };
    MIODateFormatter.prototype._parseMonth = function (ch, mm) {
        var c = parseInt(ch);
        if (isNaN(c))
            return [false, mm];
        var v = parseInt(mm + ch);
        return [true, mm + ch];
    };
    MIODateFormatter.prototype._validateMonth = function (mm) {
        var v = parseInt(mm);
        if (isNaN(v))
            return false;
        if (v < 1 || v > 12)
            return false;
        return true;
    };
    MIODateFormatter.prototype._parseYear = function (ch, yy) {
        var c = parseInt(ch);
        if (isNaN(c))
            return [false, yy];
        var v = parseInt(yy + ch);
        return [true, yy + ch];
    };
    MIODateFormatter.prototype._validateYear = function (yy) {
        var v = parseInt(yy);
        if (isNaN(yy) == true)
            return false;
        if (v > 3000)
            return false;
        return true;
    };
    MIODateFormatter.prototype.iso8601DateStyle = function (date) {
        var dd = date.getDate().toString();
        var mm = (date.getMonth() + 1).toString();
        var yy = date.getFullYear().toString();
        return yy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]);
    };
    MIODateFormatter.prototype._shortDateStyle = function (date, separatorString) {
        var separator = separatorString ? separatorString : "/";
        var d = date.getDate().toString();
        var m = (date.getMonth() + 1).toString();
        var y = date.getFullYear().toString();
        return (d[1] ? d : 0 + d) + separator + (m[1] ? m : "0" + m) + separator + y;
    };
    MIODateFormatter.prototype._fullDateStyle = function (date) {
        var day = _MIODateFormatterStringDays[date.getDay()];
        var month = _MIODateFormatterStringMonths[date.getMonth()];
        return day + ", " + month + " " + date.getDate() + ", " + date.getFullYear();
    };
    MIODateFormatter.prototype._parseTime = function (str) {
        var parseString = "";
        var step = 0;
        var hh = "";
        var mm = "";
        var ss = "";
        for (var index = 0; index < str.length; index++) {
            var ch = str[index];
            if (ch == ":" || ch == ".") {
                if (parseString.length == 0)
                    return [false, parseString, ""];
                parseString += ":";
                step++;
            }
            else {
                var result, value;
                switch (step) {
                    case 0:
                        _a = this._parseHour(ch, hh), result = _a[0], hh = _a[1];
                        break;
                    case 1:
                        _b = this._parseMinute(ch, mm), result = _b[0], mm = _b[1];
                        break;
                    case 2:
                        _c = this._parseSecond(ch, ss), result = _c[0], ss = _c[1];
                        break;
                }
                if (result == true)
                    parseString += ch;
                else
                    return [false, parseString, ""];
            }
        }
        var hourString = (hh[1] ? hh : ("0" + hh));
        if (mm.length > 0)
            hourString += ":" + (mm[1] ? mm : ("0" + mm));
        else
            hourString += ":00";
        if (ss.length > 0)
            hourString += ":" + (ss[1] ? ss : ("0" + ss));
        else
            hourString += ":00";
        return [true, parseString, hourString];
        var _a, _b, _c;
    };
    MIODateFormatter.prototype._parseHour = function (ch, hh) {
        var c = parseInt(ch);
        if (isNaN(c))
            return [false, hh];
        var v = parseInt(hh + ch);
        if (v < 0 || v > 23)
            return [false, hh];
        return [true, hh + ch];
    };
    MIODateFormatter.prototype._parseMinute = function (ch, mm) {
        var c = parseInt(ch);
        if (isNaN(c))
            return [false, mm];
        var v = parseInt(mm + ch);
        if (v < 0 || v > 59)
            return [false, mm];
        return [true, mm + ch];
    };
    MIODateFormatter.prototype._parseSecond = function (ch, ss) {
        var c = parseInt(ch);
        if (isNaN(c))
            return [false, ss];
        var v = parseInt(ss + ch);
        if (v < 0 || v > 59)
            return [false, ss];
        return [true, ss + ch];
    };
    MIODateFormatter.prototype.iso8601TimeStyle = function (date) {
        var hh = date.getHours().toString();
        var mm = date.getMinutes().toString();
        var ss = date.getSeconds().toString();
        return (hh[1] ? hh : "0" + hh[0]) + ":" + (mm[1] ? mm : "0" + mm[0]) + ":" + (ss[1] ? ss : "0" + ss[0]);
    };
    MIODateFormatter.prototype._shortTimeStyle = function (date) {
        var h = date.getHours().toString();
        var m = date.getMinutes().toString();
        return (h[1] ? h : "0" + h) + ":" + (m[1] ? m : "0" + m);
    };
    return MIODateFormatter;
}(MIOFormatter));
var _MIODateFormatterStringDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var _MIODateFormatterStringMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var MIONumber = (function (_super) {
    __extends(MIONumber, _super);
    function MIONumber() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.storeValue = null;
        return _this;
    }
    MIONumber.numberWithBool = function (value) {
        var n = new MIONumber();
        n.initWithBool(value);
        return n;
    };
    MIONumber.numberWithInteger = function (value) {
        var n = new MIONumber();
        n.initWithInteger(value);
        return n;
    };
    MIONumber.numberWithFloat = function (value) {
        var n = new MIONumber();
        n.initWithFloat(value);
        return n;
    };
    MIONumber.prototype.initWithBool = function (value) {
        if (isNaN(value) || value == null) {
            this.storeValue = 1;
        }
        else {
            this.storeValue = value ? 0 : 1;
        }
    };
    MIONumber.prototype.initWithInteger = function (value) {
        if (isNaN(value) || value == null) {
            this.storeValue = 0;
        }
        else {
            this.storeValue = value;
        }
    };
    MIONumber.prototype.initWithFloat = function (value) {
        if (isNaN(value) || value == null) {
            this.storeValue = 0.0;
        }
        else {
            this.storeValue = value;
        }
    };
    return MIONumber;
}(MIOObject));
var MIODecimalNumber = (function (_super) {
    __extends(MIODecimalNumber, _super);
    function MIODecimalNumber() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIODecimalNumber.decimalNumberWithString = function (str) {
        var dn = new MIODecimalNumber();
        dn.initWithString(str);
        return dn;
    };
    MIODecimalNumber.one = function () {
        return MIODecimalNumber.numberWithInteger(1);
    };
    MIODecimalNumber.zero = function () {
        return MIODecimalNumber.numberWithInteger(0);
    };
    MIODecimalNumber.numberWithBool = function (value) {
        var n = new MIODecimalNumber();
        n._initWithValue(value);
        return n;
    };
    MIODecimalNumber.numberWithInteger = function (value) {
        var n = new MIODecimalNumber();
        n._initWithValue(value);
        return n;
    };
    MIODecimalNumber.numberWithFloat = function (value) {
        var n = new MIODecimalNumber();
        n._initWithValue(value);
        return n;
    };
    MIODecimalNumber.prototype.initWithString = function (str) {
        this._initWithValue(str);
    };
    MIODecimalNumber.prototype.initWithDecimal = function (value) {
        _super.prototype.init;
        if (isNaN(value) || value == null) {
            this.storeValue = new Decimal(0);
        }
        else {
            this.storeValue = value;
        }
    };
    MIODecimalNumber.prototype._initWithValue = function (value) {
        _super.prototype.init.call(this);
        this.storeValue = new Decimal(value || 0);
    };
    MIODecimalNumber.prototype.decimalNumberByAdding = function (value) {
        var dv = new MIODecimalNumber();
        dv.initWithDecimal(this.storeValue.add(value.storeValue));
        return dv;
    };
    MIODecimalNumber.prototype.decimalNumberBySubtracting = function (value) {
        var dv = new MIODecimalNumber();
        dv.initWithDecimal(this.storeValue.sub(value.storeValue));
        return dv;
    };
    MIODecimalNumber.prototype.decimalNumberByMultiplyingBy = function (value) {
        var dv = new MIODecimalNumber();
        dv.initWithDecimal(this.storeValue.mul(value.storeValue));
        return dv;
    };
    MIODecimalNumber.prototype.decimalNumberByDividingBy = function (value) {
        var dv = new MIODecimalNumber();
        dv.initWithDecimal(this.storeValue.div(value.storeValue));
        return dv;
    };
    Object.defineProperty(MIODecimalNumber.prototype, "decimalValue", {
        get: function () {
            return this.storeValue.toNumber();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIODecimalNumber.prototype, "floatValue", {
        get: function () {
            return this.storeValue.toNumber();
        },
        enumerable: true,
        configurable: true
    });
    return MIODecimalNumber;
}(MIONumber));
var MIOError = (function (_super) {
    __extends(MIOError, _super);
    function MIOError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.errorCode = 0;
        return _this;
    }
    return MIOError;
}(MIOObject));
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
var MIORange = (function () {
    function MIORange(location, length) {
        this.location = 0;
        this.length = 0;
        this.location = location;
        this.length = length;
    }
    return MIORange;
}());
function MIOMaxRange(range) {
    return range.location + range.length;
}
function MIOEqualRanges(range1, range2) {
    return (range1.location == range2.location && range1.length == range2.length);
}
function MIOLocationInRange(location, range) {
    if (range == null)
        return false;
    return (location >= range.location && location < MIOMaxRange(range)) ? true : false;
}
function MIOIntersectionRange(range1, range2) {
    var max1 = MIOMaxRange(range1);
    var max2 = MIOMaxRange(range2);
    var min, loc;
    var result;
    min = (max1 < max2) ? max1 : max2;
    loc = (range1.location > range2.location) ? range1.location : range2.location;
    if (min < loc) {
        result.location = result.length = 0;
    }
    else {
        result.location = loc;
        result.length = min - loc;
    }
    return result;
}
function MIOUnionRange(range1, range2) {
    var max1 = MIOMaxRange(range1);
    var max2 = MIOMaxRange(range2);
    var max, loc;
    var result;
    max = (max1 > max2) ? max1 : max2;
    loc = (range1.location < range2.location) ? range1.location : range2.location;
    result.location = loc;
    result.length = max - result.location;
    return result;
}
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
    MIOSize.prototype.isEqualTo = function (size) {
        if (this.width == size.width
            && this.height == size.height)
            return true;
        return false;
    };
    return MIOSize;
}());
var MIORect = (function () {
    function MIORect(p, s) {
        this.origin = null;
        this.size = null;
        this.origin = p;
        this.size = s;
    }
    MIORect.Zero = function () {
        var f = new MIORect(MIOPoint.Zero(), MIOSize.Zero());
        return f;
    };
    MIORect.rectWithValues = function (x, y, w, h) {
        var p = new MIOPoint(x, y);
        var s = new MIOSize(w, h);
        var f = new MIORect(p, s);
        return f;
    };
    return MIORect;
}());
function MIORectMaxY(rect) {
    return rect.origin.y;
}
function MIORectMinY(rect) {
    return rect.origin.y + rect.size.height;
}
var MIONull = (function (_super) {
    __extends(MIONull, _super);
    function MIONull() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIONull.nullValue = function () {
        var n = new MIONull();
        n.init();
        return n;
    };
    return MIONull;
}(MIOObject));
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
String.prototype.lastPathComponent = function () {
    return MIOCoreStringLastPathComponent(this);
};
String.prototype.stringByAppendingPathComponent = function (path) {
    return MIOCoreStringAppendPathComponent(this, path);
};
String.prototype.stringByDeletingLastPathComponent = function () {
    return MIOCoreStringDeletingLastPathComponent(this);
};
String.prototype.hasPreffix = function (preffix) {
    return MIOCoreStringHasPreffix(this, preffix);
};
String.prototype.hasSuffix = function (suffix) {
    return MIOCoreStringHasSuffix(this, suffix);
};
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
        s[14] = "4";
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
        s[8] = s[13] = s[18] = s[23] = "-";
        var uuid = s.join("");
        return uuid.toUpperCase();
    };
    return MIOUUID;
}());
var MIOISO8601DateFormatter = (function (_super) {
    __extends(MIOISO8601DateFormatter, _super);
    function MIOISO8601DateFormatter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.timeZone = null;
        return _this;
    }
    MIOISO8601DateFormatter.iso8601DateFormatter = function () {
        var df = new MIOISO8601DateFormatter();
        df.init();
        return df;
    };
    MIOISO8601DateFormatter.prototype.dateFromString = function (str) {
        if (str == null)
            return null;
        var dateString;
        if (MIOCoreGetBrowser() == MIOCoreBrowserType.Safari)
            dateString = str.split('-').join("/");
        else
            dateString = str;
        var d = new Date(dateString);
        if (d == null)
            console.log("DATE FORMATTER: Error, invalid date");
        return d;
    };
    MIOISO8601DateFormatter.prototype.stringFromDate = function (date) {
        var str = "";
        if (date == null)
            return null;
        if (this.dateStyle != MIODateFormatterStyle.NoStyle) {
            str += this.iso8601DateStyle(date);
        }
        if (this.timeStyle != MIODateFormatterStyle.NoStyle) {
            if (str.length > 0)
                str += " ";
            str += this.iso8601TimeStyle(date);
        }
        return str;
    };
    return MIOISO8601DateFormatter;
}(MIODateFormatter));
var MIOPredicateComparatorType;
(function (MIOPredicateComparatorType) {
    MIOPredicateComparatorType[MIOPredicateComparatorType["Equal"] = 0] = "Equal";
    MIOPredicateComparatorType[MIOPredicateComparatorType["Less"] = 1] = "Less";
    MIOPredicateComparatorType[MIOPredicateComparatorType["LessOrEqual"] = 2] = "LessOrEqual";
    MIOPredicateComparatorType[MIOPredicateComparatorType["Greater"] = 3] = "Greater";
    MIOPredicateComparatorType[MIOPredicateComparatorType["GreaterOrEqual"] = 4] = "GreaterOrEqual";
    MIOPredicateComparatorType[MIOPredicateComparatorType["Distinct"] = 5] = "Distinct";
    MIOPredicateComparatorType[MIOPredicateComparatorType["Contains"] = 6] = "Contains";
    MIOPredicateComparatorType[MIOPredicateComparatorType["NotContains"] = 7] = "NotContains";
    MIOPredicateComparatorType[MIOPredicateComparatorType["In"] = 8] = "In";
    MIOPredicateComparatorType[MIOPredicateComparatorType["NotIn"] = 9] = "NotIn";
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
var MIOPredicateItemValueType;
(function (MIOPredicateItemValueType) {
    MIOPredicateItemValueType[MIOPredicateItemValueType["Undefined"] = 0] = "Undefined";
    MIOPredicateItemValueType[MIOPredicateItemValueType["UUID"] = 1] = "UUID";
    MIOPredicateItemValueType[MIOPredicateItemValueType["String"] = 2] = "String";
    MIOPredicateItemValueType[MIOPredicateItemValueType["Number"] = 3] = "Number";
    MIOPredicateItemValueType[MIOPredicateItemValueType["Boolean"] = 4] = "Boolean";
    MIOPredicateItemValueType[MIOPredicateItemValueType["Null"] = 5] = "Null";
    MIOPredicateItemValueType[MIOPredicateItemValueType["Property"] = 6] = "Property";
})(MIOPredicateItemValueType || (MIOPredicateItemValueType = {}));
var MIOPredicateItem = (function () {
    function MIOPredicateItem() {
        this.key = null;
        this.comparator = null;
        this.value = null;
        this.valueType = MIOPredicateItemValueType.Undefined;
    }
    MIOPredicateItem.prototype.evaluateObject = function (object) {
        var lValue = object.valueForKeyPath(this.key);
        if (lValue instanceof Date) {
            var sdf = new MIOISO8601DateFormatter();
            sdf.init();
            lValue = sdf.stringFromDate(lValue);
        }
        var rValue = this.value;
        if (this.valueType == MIOPredicateItemValueType.Property) {
            rValue = object.valueForKeyPath(rValue);
        }
        if (this.comparator == MIOPredicateComparatorType.Equal)
            return (lValue == rValue);
        else if (this.comparator == MIOPredicateComparatorType.Distinct)
            return (lValue != rValue);
        else if (this.comparator == MIOPredicateComparatorType.Less)
            return (lValue < rValue);
        else if (this.comparator == MIOPredicateComparatorType.LessOrEqual)
            return (lValue <= rValue);
        else if (this.comparator == MIOPredicateComparatorType.Greater)
            return (lValue > rValue);
        else if (this.comparator == MIOPredicateComparatorType.GreaterOrEqual)
            return (lValue >= rValue);
        else if (this.comparator == MIOPredicateComparatorType.Contains) {
            if (lValue == null)
                return false;
            lValue = lValue.toLowerCase();
            if (lValue.indexOf(rValue.toLowerCase()) > -1)
                return true;
            return false;
        }
        else if (this.comparator == MIOPredicateComparatorType.NotContains) {
            if (lValue == null)
                return true;
            lValue = lValue.toLowerCase();
            if (lValue.indexOf(rValue.toLowerCase()) > -1)
                return false;
            return true;
        }
    };
    return MIOPredicateItem;
}());
var MIOPredicateGroup = (function () {
    function MIOPredicateGroup() {
        this.predicates = [];
    }
    MIOPredicateGroup.prototype.evaluateObject = function (object) {
        var result = false;
        var op = null;
        var lastResult = null;
        for (var count = 0; count < this.predicates.length; count++) {
            var o = this.predicates[count];
            if (o instanceof MIOPredicateGroup) {
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
            else {
                throw ("MIOPredicate: Error. Predicate class type invalid. (" + o + ")");
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
    return MIOPredicateGroup;
}());
var MIOPredicateTokenType;
(function (MIOPredicateTokenType) {
    MIOPredicateTokenType[MIOPredicateTokenType["Identifier"] = 0] = "Identifier";
    MIOPredicateTokenType[MIOPredicateTokenType["UUIDValue"] = 1] = "UUIDValue";
    MIOPredicateTokenType[MIOPredicateTokenType["StringValue"] = 2] = "StringValue";
    MIOPredicateTokenType[MIOPredicateTokenType["NumberValue"] = 3] = "NumberValue";
    MIOPredicateTokenType[MIOPredicateTokenType["BooleanValue"] = 4] = "BooleanValue";
    MIOPredicateTokenType[MIOPredicateTokenType["NullValue"] = 5] = "NullValue";
    MIOPredicateTokenType[MIOPredicateTokenType["PropertyValue"] = 6] = "PropertyValue";
    MIOPredicateTokenType[MIOPredicateTokenType["MinorOrEqualComparator"] = 7] = "MinorOrEqualComparator";
    MIOPredicateTokenType[MIOPredicateTokenType["MinorComparator"] = 8] = "MinorComparator";
    MIOPredicateTokenType[MIOPredicateTokenType["MajorOrEqualComparator"] = 9] = "MajorOrEqualComparator";
    MIOPredicateTokenType[MIOPredicateTokenType["MajorComparator"] = 10] = "MajorComparator";
    MIOPredicateTokenType[MIOPredicateTokenType["EqualComparator"] = 11] = "EqualComparator";
    MIOPredicateTokenType[MIOPredicateTokenType["DistinctComparator"] = 12] = "DistinctComparator";
    MIOPredicateTokenType[MIOPredicateTokenType["ContainsComparator"] = 13] = "ContainsComparator";
    MIOPredicateTokenType[MIOPredicateTokenType["NotContainsComparator"] = 14] = "NotContainsComparator";
    MIOPredicateTokenType[MIOPredicateTokenType["InComparator"] = 15] = "InComparator";
    MIOPredicateTokenType[MIOPredicateTokenType["NotIntComparator"] = 16] = "NotIntComparator";
    MIOPredicateTokenType[MIOPredicateTokenType["OpenParenthesisSymbol"] = 17] = "OpenParenthesisSymbol";
    MIOPredicateTokenType[MIOPredicateTokenType["CloseParenthesisSymbol"] = 18] = "CloseParenthesisSymbol";
    MIOPredicateTokenType[MIOPredicateTokenType["Whitespace"] = 19] = "Whitespace";
    MIOPredicateTokenType[MIOPredicateTokenType["AND"] = 20] = "AND";
    MIOPredicateTokenType[MIOPredicateTokenType["OR"] = 21] = "OR";
})(MIOPredicateTokenType || (MIOPredicateTokenType = {}));
var MIOPredicate = (function (_super) {
    __extends(MIOPredicate, _super);
    function MIOPredicate() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.predicateGroup = null;
        _this.lexer = null;
        return _this;
    }
    MIOPredicate.predicateWithFormat = function (format) {
        var p = new MIOPredicate();
        p.initWithFormat(format);
        return p;
    };
    MIOPredicate.prototype.initWithFormat = function (format) {
        this.parse(format);
    };
    MIOPredicate.prototype.evaluateObject = function (object) {
        return this.predicateGroup.evaluateObject(object);
    };
    MIOPredicate.prototype.tokenizeWithFormat = function (format) {
        this.lexer = new MIOCoreLexer(format);
        this.lexer.addTokenType(MIOPredicateTokenType.UUIDValue, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        this.lexer.addTokenType(MIOPredicateTokenType.StringValue, /^"([^"]*)"|^'([^']*)'/);
        this.lexer.addTokenType(MIOPredicateTokenType.NumberValue, /^-?\d+(?:\.\d+)?(?:e[+\-]?\d+)?/i);
        this.lexer.addTokenType(MIOPredicateTokenType.BooleanValue, /^true|false/i);
        this.lexer.addTokenType(MIOPredicateTokenType.NullValue, /^null|nil/i);
        this.lexer.addTokenType(MIOPredicateTokenType.OpenParenthesisSymbol, /^\(/);
        this.lexer.addTokenType(MIOPredicateTokenType.CloseParenthesisSymbol, /^\)/);
        this.lexer.addTokenType(MIOPredicateTokenType.MinorOrEqualComparator, /^<=?/);
        this.lexer.addTokenType(MIOPredicateTokenType.MinorComparator, /^</);
        this.lexer.addTokenType(MIOPredicateTokenType.MajorOrEqualComparator, /^>=?/);
        this.lexer.addTokenType(MIOPredicateTokenType.MajorComparator, /^>/);
        this.lexer.addTokenType(MIOPredicateTokenType.EqualComparator, /^==?/);
        this.lexer.addTokenType(MIOPredicateTokenType.DistinctComparator, /^!=/);
        this.lexer.addTokenType(MIOPredicateTokenType.NotContainsComparator, /^not contains/i);
        this.lexer.addTokenType(MIOPredicateTokenType.ContainsComparator, /^contains/i);
        this.lexer.addTokenType(MIOPredicateTokenType.InComparator, /^in/i);
        this.lexer.addTokenType(MIOPredicateTokenType.AND, /^and|&&/i);
        this.lexer.addTokenType(MIOPredicateTokenType.OR, /^or|\|\|/i);
        this.lexer.addTokenType(MIOPredicateTokenType.Whitespace, /^\s+/);
        this.lexer.ignoreTokenType(MIOPredicateTokenType.Whitespace);
        this.lexer.addTokenType(MIOPredicateTokenType.Identifier, /^[a-zA-Z-_][a-zA-Z0-9-_\.]*/);
        this.lexer.tokenize();
    };
    MIOPredicate.prototype.parse = function (format) {
        console.log("**** Start predicate format parser");
        console.log(format);
        console.log("****");
        this.tokenizeWithFormat(format);
        this.predicateGroup = new MIOPredicateGroup();
        this.predicateGroup.predicates = this.parsePredicates();
        console.log("**** End predicate format parser");
    };
    MIOPredicate.prototype.parsePredicates = function () {
        var token = this.lexer.nextToken();
        var predicates = [];
        var exit = false;
        while (token != null && exit == false) {
            switch (token.type) {
                case MIOPredicateTokenType.Identifier:
                    var pi = new MIOPredicateItem();
                    this.lexer.prevToken();
                    this.property(pi);
                    this.comparator(pi);
                    this.value(pi);
                    predicates.push(pi);
                    break;
                case MIOPredicateTokenType.AND:
                    predicates.push(MIOPredicateOperator.andPredicateOperatorType());
                    break;
                case MIOPredicateTokenType.OR:
                    predicates.push(MIOPredicateOperator.orPredicateOperatorType());
                    break;
                case MIOPredicateTokenType.OpenParenthesisSymbol:
                    var pg = new MIOPredicateGroup();
                    pg.predicates = this.parsePredicates();
                    predicates.push(pg);
                    break;
                case MIOPredicateTokenType.CloseParenthesisSymbol:
                    exit = true;
                    break;
                default:
                    throw ("MIOPredicate: Error. Unexpected token. (" + token.value + ")");
            }
            if (exit != true) {
                token = this.lexer.nextToken();
            }
        }
        return predicates;
    };
    MIOPredicate.prototype.property = function (item) {
        var token = this.lexer.nextToken();
        switch (token.type) {
            case MIOPredicateTokenType.Identifier:
                item.key = token.value;
                break;
            default:
                throw ("MIOPredicate: Error. Unexpected identifier key. (" + token.value + ")");
        }
    };
    MIOPredicate.prototype.comparator = function (item) {
        var token = this.lexer.nextToken();
        switch (token.type) {
            case MIOPredicateTokenType.EqualComparator:
                item.comparator = MIOPredicateComparatorType.Equal;
                break;
            case MIOPredicateTokenType.MajorComparator:
                item.comparator = MIOPredicateComparatorType.Greater;
                break;
            case MIOPredicateTokenType.MajorOrEqualComparator:
                item.comparator = MIOPredicateComparatorType.GreaterOrEqual;
                break;
            case MIOPredicateTokenType.MinorComparator:
                item.comparator = MIOPredicateComparatorType.Less;
                break;
            case MIOPredicateTokenType.MinorOrEqualComparator:
                item.comparator = MIOPredicateComparatorType.LessOrEqual;
                break;
            case MIOPredicateTokenType.DistinctComparator:
                item.comparator = MIOPredicateComparatorType.Distinct;
                break;
            case MIOPredicateTokenType.ContainsComparator:
                item.comparator = MIOPredicateComparatorType.Contains;
                break;
            case MIOPredicateTokenType.NotContainsComparator:
                item.comparator = MIOPredicateComparatorType.NotContains;
                break;
            case MIOPredicateTokenType.InComparator:
                item.comparator = MIOPredicateComparatorType.In;
                break;
            default:
                throw ("MIOPredicate: Error. Unexpected comparator. (" + token.value + ")");
        }
    };
    MIOPredicate.prototype.value = function (item) {
        var token = this.lexer.nextToken();
        switch (token.type) {
            case MIOPredicateTokenType.UUIDValue:
                item.value = token.value;
                item.valueType = MIOPredicateItemValueType.UUID;
                break;
            case MIOPredicateTokenType.StringValue:
                item.value = token.value.substring(1, token.value.length - 1);
                item.valueType = MIOPredicateItemValueType.String;
                break;
            case MIOPredicateTokenType.NumberValue:
                item.value = token.value;
                item.valueType = MIOPredicateItemValueType.Number;
                break;
            case MIOPredicateTokenType.BooleanValue:
                item.value = this.booleanFromString(token.value);
                item.valueType = MIOPredicateItemValueType.Boolean;
                break;
            case MIOPredicateTokenType.NullValue:
                item.value = this.nullFromString(token.value);
                item.valueType = MIOPredicateItemValueType.Null;
                break;
            case MIOPredicateTokenType.Identifier:
                item.value = token.value;
                item.valueType = MIOPredicateItemValueType.Property;
                break;
            default:
                throw ("MIOPredicate: Error. Unexpected comparator. (" + token.value + ")");
        }
    };
    MIOPredicate.prototype.booleanFromString = function (value) {
        var v = value.toLocaleLowerCase();
        var bv = false;
        switch (v) {
            case "yes":
            case "true":
                bv = true;
                break;
            case "no":
            case "false":
                bv = false;
                break;
            default:
                throw ("MIOPredicate: Error. Cann't convert '" + value + "' to boolean");
        }
        return bv;
    };
    MIOPredicate.prototype.nullFromString = function (value) {
        var v = value.toLocaleLowerCase();
        var nv = null;
        switch (v) {
            case "nil":
            case "null":
                nv = null;
                break;
            default:
                throw ("MIOPredicate: Error. Cann't convert '" + value + "' to null");
        }
        return nv;
    };
    return MIOPredicate;
}(MIOObject));
function _MIOPredicateFilterObjects(objs, predicate) {
    if (objs == null)
        return [];
    var resultObjects = null;
    if (objs.length == 0 || predicate == null) {
        resultObjects = objs.slice(0);
    }
    else {
        resultObjects = objs.filter(function (obj) {
            var result = predicate.evaluateObject(obj);
            if (result)
                return obj;
        });
    }
    return resultObjects;
}
var MIOSet = (function (_super) {
    __extends(MIOSet, _super);
    function MIOSet() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._objects = [];
        return _this;
    }
    MIOSet.set = function () {
        var s = new MIOSet();
        s.init();
        return s;
    };
    MIOSet.prototype.addObject = function (object) {
        if (this._objects.containsObject(object) == true)
            return;
        this._objects.addObject(object);
    };
    MIOSet.prototype.removeObject = function (object) {
        if (this._objects.containsObject(object) == true)
            return;
        this._objects.removeObject(object);
    };
    MIOSet.prototype.removeAllObjects = function () {
        this._objects = [];
    };
    MIOSet.prototype.indexOfObject = function (object) {
        return this._objects.indexOf(object);
    };
    MIOSet.prototype.containsObject = function (object) {
        return this._objects.indexOfObject(object) > -1 ? true : false;
    };
    MIOSet.prototype.objectAtIndex = function (index) {
        return this._objects[index];
    };
    Object.defineProperty(MIOSet.prototype, "allObjects", {
        get: function () {
            return this._objects;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOSet.prototype, "count", {
        get: function () {
            return this._objects.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOSet.prototype, "length", {
        get: function () {
            return this._objects.length;
        },
        enumerable: true,
        configurable: true
    });
    MIOSet.prototype.copy = function () {
        var set = new MIOSet();
        set.init();
        for (var index = 0; index < this._objects.length; index++) {
            var obj = this._objects[index];
            set.addObject(obj);
        }
        return set;
    };
    MIOSet.prototype.filterWithPredicate = function (predicate) {
        var objs = _MIOPredicateFilterObjects(this._objects, predicate);
        return objs;
    };
    MIOSet.prototype.addObserver = function (obs, keypath, context) {
        if (keypath == "count" || keypath == "length")
            throw "MIOSet: Can't observe count. It's not KVO Compilant";
        _super.prototype.addObserver.call(this, obs, keypath, context);
    };
    return MIOSet;
}(MIOObject));
function MIOIndexPathEqual(indexPath1, indexPath2) {
    if (indexPath1 == null || indexPath2 == null)
        return false;
    if (indexPath1.section == indexPath2.section
        && indexPath1.row == indexPath2.row) {
        return true;
    }
    return false;
}
var MIOIndexPath = (function (_super) {
    __extends(MIOIndexPath, _super);
    function MIOIndexPath() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.indexes = [];
        return _this;
    }
    MIOIndexPath.indexForRowInSection = function (row, section) {
        var ip = new MIOIndexPath();
        ip.add(section);
        ip.add(row);
        return ip;
    };
    MIOIndexPath.indexForColumnInRowAndSection = function (column, row, section) {
        var ip = MIOIndexPath.indexForRowInSection(row, section);
        ip.add(column);
        return ip;
    };
    MIOIndexPath.prototype.add = function (value) {
        this.indexes.push(value);
    };
    Object.defineProperty(MIOIndexPath.prototype, "section", {
        get: function () {
            return this.indexes[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOIndexPath.prototype, "row", {
        get: function () {
            return this.indexes[1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOIndexPath.prototype, "column", {
        get: function () {
            return this.indexes[2];
        },
        enumerable: true,
        configurable: true
    });
    return MIOIndexPath;
}(MIOObject));
var _mio_currentLocale;
var MIOLocale = (function (_super) {
    __extends(MIOLocale, _super);
    function MIOLocale() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.languageIdentifier = "es";
        _this.countryIdentifier = "ES";
        return _this;
    }
    MIOLocale.currentLocale = function () {
        if (_mio_currentLocale == null) {
            _mio_currentLocale = new MIOLocale();
            _mio_currentLocale.initWithLocaleIdentifier("es_ES");
        }
        return _mio_currentLocale;
    };
    MIOLocale.prototype.initWithLocaleIdentifier = function (identifer) {
        var array = identifer.split("_");
        if (array.length == 1) {
            this.languageIdentifier = array[0];
        }
        else if (array.length == 2) {
            this.languageIdentifier = array[0];
            this.countryIdentifier = array[1];
        }
    };
    Object.defineProperty(MIOLocale.prototype, "decimalSeparator", {
        get: function () {
            var ds;
            switch (this.countryIdentifier) {
                case "ES":
                    ds = ",";
                    break;
                case "US":
                    ds = ".";
                    break;
                case "UK":
                    ds = ".";
                    break;
            }
            return ds;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOLocale.prototype, "currencySymbol", {
        get: function () {
            var cs;
            switch (this.countryIdentifier) {
                case "ES":
                    cs = "€";
                    break;
                case "US":
                    cs = "$";
                    break;
            }
            return cs;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOLocale.prototype, "groupingSeparator", {
        get: function () {
            var gs;
            switch (this.countryIdentifier) {
                case "ES":
                    gs = ".";
                    break;
                case "US":
                    gs = ",";
                    break;
            }
            return gs;
        },
        enumerable: true,
        configurable: true
    });
    return MIOLocale;
}(MIOObject));
var MIONumberFormatterStyle;
(function (MIONumberFormatterStyle) {
    MIONumberFormatterStyle[MIONumberFormatterStyle["NoStyle"] = 0] = "NoStyle";
    MIONumberFormatterStyle[MIONumberFormatterStyle["DecimalStyle"] = 1] = "DecimalStyle";
    MIONumberFormatterStyle[MIONumberFormatterStyle["CurrencyStyle"] = 2] = "CurrencyStyle";
    MIONumberFormatterStyle[MIONumberFormatterStyle["PercentStyle"] = 3] = "PercentStyle";
})(MIONumberFormatterStyle || (MIONumberFormatterStyle = {}));
var _MIONumberFormatterType;
(function (_MIONumberFormatterType) {
    _MIONumberFormatterType[_MIONumberFormatterType["Int"] = 0] = "Int";
    _MIONumberFormatterType[_MIONumberFormatterType["Decimal"] = 1] = "Decimal";
})(_MIONumberFormatterType || (_MIONumberFormatterType = {}));
var MIONumberFormatter = (function (_super) {
    __extends(MIONumberFormatter, _super);
    function MIONumberFormatter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.numberStyle = MIONumberFormatterStyle.NoStyle;
        _this.locale = null;
        _this.minimumFractionDigits = 0;
        _this.maximumFractionDigits = 0;
        return _this;
    }
    MIONumberFormatter.prototype.init = function () {
        _super.prototype.init.call(this);
        this.locale = MIOLocale.currentLocale();
        this.groupingSeparator = this.locale.groupingSeparator;
    };
    MIONumberFormatter.prototype.numberFromString = function (str) {
        if (str === null)
            return null;
        var result, parseString, numberString, type;
        _a = this._parse(str), result = _a[0], parseString = _a[1], numberString = _a[2], type = _a[3];
        if (result == true) {
            var value = null;
            if (type == _MIONumberFormatterType.Int) {
                value = parseInt(numberString);
            }
            else if (type == _MIONumberFormatterType.Decimal) {
                value = parseFloat(numberString);
            }
            return isNaN(value) ? null : value;
        }
        return null;
        var _a;
    };
    MIONumberFormatter.prototype.stringFromNumber = function (number) {
        return this.stringForObjectValue(number);
    };
    MIONumberFormatter.prototype.stringForObjectValue = function (value) {
        var number = value;
        if (!number)
            return '0';
        var str = number.toString();
        var intValue = null;
        var floatValue = null;
        var array = str.split(".");
        if (array.length == 1) {
            intValue = array[0];
        }
        else if (array.length == 2) {
            intValue = array[0];
            floatValue = array[1];
        }
        var res = "";
        var minusOffset = intValue.charAt(0) == "-" ? 1 : 0;
        if (intValue.length > (3 + minusOffset)) {
            var offset = Math.floor((intValue.length - minusOffset) / 3);
            if (((intValue.length - minusOffset) % 3) == 0)
                offset--;
            var posArray = [];
            var intLen = intValue.length;
            for (var index = offset; index > 0; index--) {
                posArray.push(intLen - (index * 3));
            }
            var posArrayIndex = 0;
            var groupPos = posArray[0];
            for (var index = 0; index < intLen; index++) {
                if (index == groupPos) {
                    res += this.groupingSeparator;
                    posArrayIndex++;
                    groupPos = posArrayIndex < posArray.length ? posArray[posArrayIndex] : -1;
                }
                var ch = intValue[index];
                res += ch;
            }
        }
        else {
            res = intValue;
        }
        if (this.minimumFractionDigits > 0 && floatValue == null)
            floatValue = "";
        if (floatValue != null) {
            res += this.locale.decimalSeparator;
            if (this.maximumFractionDigits > 0 && floatValue.length > this.maximumFractionDigits)
                floatValue = floatValue.substring(0, this.maximumFractionDigits);
            for (var index = 0; index < this.minimumFractionDigits; index++) {
                if (index < floatValue.length)
                    res += floatValue[index];
                else
                    res += "0";
            }
        }
        if (this.numberStyle == MIONumberFormatterStyle.PercentStyle)
            res += "%";
        return res;
    };
    MIONumberFormatter.prototype.isPartialStringValid = function (str) {
        if (str.length == 0)
            return [true, str];
        var result, newStr;
        _a = this._parse(str), result = _a[0], newStr = _a[1];
        return [result, newStr];
        var _a;
    };
    MIONumberFormatter.prototype._parse = function (str) {
        var number = 0;
        var parseString = "";
        var numberString = "";
        var type = _MIONumberFormatterType.Int;
        var minusSymbol = false;
        var percentSymbol = false;
        for (var index = 0; index < str.length; index++) {
            var ch = str[index];
            if (ch == this.locale.decimalSeparator && type != _MIONumberFormatterType.Decimal) {
                parseString += ch;
                numberString += ".";
                type = _MIONumberFormatterType.Decimal;
            }
            else if (ch == "-" && minusSymbol == false) {
                parseString += ch;
                numberString += ch;
                minusSymbol = true;
            }
            else if (ch == "%"
                && this.numberStyle == MIONumberFormatterStyle.PercentStyle
                && percentSymbol == false) {
                percentSymbol = true;
                parseString += ch;
            }
            else if (!isNaN(parseInt(ch))) {
                parseString += ch;
                numberString += ch;
            }
            else
                return [false, parseString, numberString, type];
        }
        return [true, parseString, numberString, type];
    };
    return MIONumberFormatter;
}(MIOFormatter));
var MIOTimer = (function (_super) {
    __extends(MIOTimer, _super);
    function MIOTimer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._timerInterval = 0;
        _this._repeat = false;
        _this._target = null;
        _this._completion = null;
        _this._coreTimer = null;
        return _this;
    }
    MIOTimer.scheduledTimerWithTimeInterval = function (timeInterval, repeat, target, completion) {
        var timer = new MIOTimer();
        timer.initWithTimeInterval(timeInterval, repeat, target, completion);
        timer.fire();
        return timer;
    };
    MIOTimer.prototype.initWithTimeInterval = function (timeInterval, repeat, target, completion) {
        this._timerInterval = timeInterval;
        this._repeat = repeat;
        this._target = target;
        this._completion = completion;
    };
    MIOTimer.prototype.fire = function () {
        var instance = this;
        if (this._repeat) {
            this._coreTimer = setInterval(function () {
                instance._timerCallback.call(instance);
            }, this._timerInterval);
        }
        else {
            this._coreTimer = setTimeout(function () {
                instance._timerCallback.call(instance);
            }, this._timerInterval);
        }
    };
    MIOTimer.prototype.invalidate = function () {
        if (this._repeat)
            clearInterval(this._coreTimer);
        else
            clearTimeout(this._coreTimer);
    };
    MIOTimer.prototype._timerCallback = function () {
        if (this._target != null && this._completion != null)
            this._completion.call(this._target, this);
        if (this._repeat == true)
            this.invalidate();
    };
    return MIOTimer;
}(MIOObject));
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
    MIONotificationCenter._sharedInstance = new MIONotificationCenter();
    return MIONotificationCenter;
}());
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
    MIOUserDefaults._sharedInstance = new MIOUserDefaults();
    return MIOUserDefaults;
}());
var MIOURLRequest = (function (_super) {
    __extends(MIOURLRequest, _super);
    function MIOURLRequest() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.url = null;
        _this.httpMethod = "GET";
        _this.httpBody = null;
        _this.headers = [];
        _this.binary = false;
        _this.download = false;
        return _this;
    }
    MIOURLRequest.requestWithURL = function (url) {
        var request = new MIOURLRequest();
        request.initWithURL(url);
        return request;
    };
    MIOURLRequest.prototype.initWithURL = function (url) {
        this.url = url;
    };
    MIOURLRequest.prototype.setHeaderField = function (field, value) {
        this.headers.push({ "Field": field, "Value": value });
    };
    return MIOURLRequest;
}(MIOObject));
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
                if (instance.delegate != null)
                    instance.delegate.connectionDidReceiveText(instance, this.responseText);
                else if (instance.blockFN != null) {
                    var type = instance.xmlHttpRequest.getResponseHeader('Content-Type').split(';')[0];
                    if (type != 'application/json' && type != 'text/html') {
                        var filename;
                        if (type == 'application/pdf')
                            filename = 'document.pdf';
                        else if (type == 'application/csv')
                            filename = 'document.csv';
                        else
                            filename = "manager_document.xls";
                        var disposition = instance.xmlHttpRequest.getResponseHeader('Content-Disposition');
                        if (disposition && disposition.indexOf('attachment') !== -1) {
                            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                            var matches = filenameRegex.exec(disposition);
                            if (matches != null && matches[1])
                                filename = matches[1].replace(/['"]/g, '');
                        }
                        var data = new Uint8Array(this.response);
                        if (instance.request.download == true) {
                            var blob = new Blob([data], { type: type });
                            if (typeof window.navigator.msSaveBlob !== 'undefined') {
                                window.navigator.msSaveBlob(blob, filename);
                            }
                            else {
                                var URL = window.URL || window.webkitURL;
                                var downloadUrl = URL.createObjectURL(blob);
                                if (filename) {
                                    var a = document.createElement("a");
                                    if (typeof a.download === 'undefined') {
                                        window.location = downloadUrl;
                                    }
                                    else {
                                        a.href = downloadUrl;
                                        a.download = filename;
                                        document.body.appendChild(a);
                                        a.click();
                                    }
                                }
                                else {
                                    window.location = downloadUrl;
                                }
                                setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100);
                                instance.blockFN.call(instance.blockTarget, this.status, null, null);
                            }
                        }
                        else {
                            var arr = new Array();
                            for (var i = 0; i != data.length; ++i)
                                arr[i] = String.fromCharCode(data[i]);
                            var bstr = arr.join("");
                            instance.blockFN.call(instance.blockTarget, this.status, null, bstr);
                        }
                    }
                    else
                        instance.blockFN.call(instance.blockTarget, this.status, this.responseText);
                }
            }
            else {
                if (instance.delegate != null)
                    instance.delegate.connectionDidFail(instance);
                else if (instance.blockFN != null)
                    instance.blockFN.call(instance.blockTarget, this.status, this.responseText);
            }
        };
        var urlString = this.request.url.absoluteString;
        this.xmlHttpRequest.open(this.request.httpMethod, urlString);
        for (var count = 0; count < this.request.headers.length; count++) {
            var item = this.request.headers[count];
            this.xmlHttpRequest.setRequestHeader(item["Field"], item["Value"]);
        }
        if (this.request.binary == true)
            this.xmlHttpRequest.responseType = "arraybuffer";
        if (this.request.httpMethod == "GET" || this.request.httpBody == null)
            this.xmlHttpRequest.send();
        else
            this.xmlHttpRequest.send(this.request.httpBody);
    };
    return MIOURLConnection;
}());
var MIOXMLTokenType;
(function (MIOXMLTokenType) {
    MIOXMLTokenType[MIOXMLTokenType["Identifier"] = 0] = "Identifier";
    MIOXMLTokenType[MIOXMLTokenType["QuestionMark"] = 1] = "QuestionMark";
    MIOXMLTokenType[MIOXMLTokenType["OpenTag"] = 2] = "OpenTag";
    MIOXMLTokenType[MIOXMLTokenType["CloseTag"] = 3] = "CloseTag";
    MIOXMLTokenType[MIOXMLTokenType["Slash"] = 4] = "Slash";
    MIOXMLTokenType[MIOXMLTokenType["Quote"] = 5] = "Quote";
    MIOXMLTokenType[MIOXMLTokenType["End"] = 6] = "End";
})(MIOXMLTokenType || (MIOXMLTokenType = {}));
var MIOXMLParser = (function (_super) {
    __extends(MIOXMLParser, _super);
    function MIOXMLParser() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.str = null;
        _this.delegate = null;
        _this.strIndex = 0;
        _this.elements = [];
        _this.attributes = null;
        _this.currentElement = null;
        _this.currentTokenValue = null;
        _this.lastTokenValue = null;
        return _this;
    }
    MIOXMLParser.prototype.initWithString = function (str, delegate) {
        this.str = str;
        this.delegate = delegate;
    };
    MIOXMLParser.prototype.nextChar = function () {
        if (this.strIndex >= this.str.length)
            return null;
        var ch = this.str.charAt(this.strIndex);
        this.strIndex++;
        return ch;
    };
    MIOXMLParser.prototype.prevChar = function () {
        this.strIndex--;
        return this.str.charAt(this.strIndex);
    };
    MIOXMLParser.prototype.readToken = function () {
        var exit = false;
        var value = "";
        while (exit == false) {
            var ch = this.nextChar();
            if (ch == null)
                return null;
            if (ch == "<" || ch == ">" || ch == "/" || ch == "?") {
                if (value.length > 0)
                    this.prevChar();
                else
                    value = ch;
                exit = true;
            }
            else if (ch == " ") {
                exit = true;
            }
            else
                value += ch;
        }
        return value;
    };
    MIOXMLParser.prototype.nextToken = function () {
        this.lastTokenValue = this.currentTokenValue;
        var exit = false;
        var token = MIOXMLTokenType.Identifier;
        var value = this.readToken();
        if (value == null)
            return [MIOXMLTokenType.End, null];
        switch (value) {
            case "<":
                token = MIOXMLTokenType.OpenTag;
                break;
            case ">":
                token = MIOXMLTokenType.CloseTag;
                break;
            case "/":
                token = MIOXMLTokenType.Slash;
                break;
            case "?":
                token = MIOXMLTokenType.QuestionMark;
                break;
        }
        this.currentTokenValue = token;
        return [token, value];
    };
    MIOXMLParser.prototype.prevToken = function () {
        return this.lastTokenValue;
    };
    MIOXMLParser.prototype.parse = function () {
        if (typeof this.delegate.parserDidStartDocument === "function")
            this.delegate.parserDidStartDocument(this);
        var token, value;
        _a = this.nextToken(), token = _a[0], value = _a[1];
        while (token != MIOXMLTokenType.End) {
            switch (token) {
                case MIOXMLTokenType.OpenTag:
                    this.openTag();
                    break;
                case MIOXMLTokenType.Identifier:
                    this.text(value);
                    break;
            }
            _b = this.nextToken(), token = _b[0], value = _b[1];
        }
        if (typeof this.delegate.parserDidEndDocument === "function")
            this.delegate.parserDidEndDocument(this);
        var _a, _b;
    };
    MIOXMLParser.prototype.openTag = function () {
        this.attributes = {};
        var token, value;
        _a = this.nextToken(), token = _a[0], value = _a[1];
        switch (token) {
            case MIOXMLTokenType.QuestionMark:
                this.questionMark();
                break;
            case MIOXMLTokenType.Identifier:
                this.beginElement(value);
                break;
            case MIOXMLTokenType.Slash:
                this.slash();
                break;
            default:
                this.error("Expected: element");
                break;
        }
        var _a;
    };
    MIOXMLParser.prototype.questionMark = function () {
        var token, value;
        _a = this.nextToken(), token = _a[0], value = _a[1];
        switch (token) {
            case MIOXMLTokenType.Identifier:
                this.xmlOpenTag(value);
                break;
            case MIOXMLTokenType.CloseTag:
                this.xmlCloseTag();
                break;
        }
        var _a;
    };
    MIOXMLParser.prototype.xmlOpenTag = function (value) {
        var token, value;
        _a = this.nextToken(), token = _a[0], value = _a[1];
        switch (token) {
            case MIOXMLTokenType.Identifier:
                this.attribute(value);
                break;
            case MIOXMLTokenType.QuestionMark:
                this.questionMark();
                break;
        }
        var _a;
    };
    MIOXMLParser.prototype.xmlCloseTag = function () {
    };
    MIOXMLParser.prototype.beginElement = function (value) {
        this.elements.push(value);
        this.currentElement = value;
        this.attributes = {};
        var token, value;
        _a = this.nextToken(), token = _a[0], value = _a[1];
        switch (token) {
            case MIOXMLTokenType.Identifier:
                this.attribute(value);
                break;
            case MIOXMLTokenType.Slash:
                this.slash();
                break;
            case MIOXMLTokenType.CloseTag:
                this.closeTag();
                break;
        }
        var _a;
    };
    MIOXMLParser.prototype.endElement = function (value) {
        this.attributes = {};
        this.currentElement = null;
        var token, value;
        _a = this.nextToken(), token = _a[0], value = _a[1];
        switch (token) {
            case MIOXMLTokenType.CloseTag:
                this.closeTag();
                this.didEndElement();
                break;
            default:
                this.error("Expected: close token");
                break;
        }
        var _a;
    };
    MIOXMLParser.prototype.attribute = function (attr) {
        this.decodeAttribute(attr);
        var token, value;
        _a = this.nextToken(), token = _a[0], value = _a[1];
        switch (token) {
            case MIOXMLTokenType.Identifier:
                this.attribute(value);
                break;
            case MIOXMLTokenType.Slash:
                this.slash();
                break;
            case MIOXMLTokenType.QuestionMark:
                this.questionMark();
                break;
            case MIOXMLTokenType.CloseTag:
                this.closeTag();
                this.didStartElement();
                break;
        }
        var _a;
    };
    MIOXMLParser.prototype.decodeAttribute = function (attr) {
        var key = null;
        var value = null;
        var token = "";
        for (var index = 0; index < attr.length; index++) {
            var ch = attr[index];
            if (ch == "=") {
                key = token;
                token = "";
            }
            else if (ch == "\"" || ch == "'") {
                index++;
                var ch2 = attr[index];
                while (ch2 != ch) {
                    token += ch2;
                    index++;
                    ch2 = attr[index];
                }
            }
            else {
                token += ch;
            }
        }
        if (key != null && token.length > 0)
            value = token;
        else if (key == null && token.length > 0)
            key = token;
        this.attributes[key] = value;
    };
    MIOXMLParser.prototype.slash = function () {
        var token, value;
        _a = this.nextToken(), token = _a[0], value = _a[1];
        switch (token) {
            case MIOXMLTokenType.CloseTag:
                this.closeTag();
                this.didStartElement();
                this.didEndElement();
                break;
            case MIOXMLTokenType.Identifier:
                this.endElement(value);
                break;
        }
        var _a;
    };
    MIOXMLParser.prototype.closeTag = function () {
    };
    MIOXMLParser.prototype.didStartElement = function () {
        var element = this.currentElement;
        if (typeof this.delegate.parserDidStartElement === "function")
            this.delegate.parserDidStartElement(this, element, this.attributes);
        this.currentElement = null;
        this.attributes = {};
    };
    MIOXMLParser.prototype.didEndElement = function () {
        var element = this.elements.pop();
        if (typeof this.delegate.parserDidEndElement === "function")
            this.delegate.parserDidEndElement(this, element);
    };
    MIOXMLParser.prototype.text = function (value) {
        if (typeof this.delegate.parserFoundString === "function")
            this.delegate.parserFoundString(this, value);
    };
    MIOXMLParser.prototype.error = function (expected) {
        MIOLog("Error: Unexpected token. " + expected);
    };
    return MIOXMLParser;
}(MIOObject));
var MIOOperation = (function (_super) {
    __extends(MIOOperation, _super);
    function MIOOperation() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = null;
        _this.target = null;
        _this.completion = null;
        _this._dependencies = [];
        _this._isExecuting = false;
        _this._isFinished = false;
        _this._ready = true;
        return _this;
    }
    Object.defineProperty(MIOOperation.prototype, "dependencies", {
        get: function () { return this._dependencies; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOOperation.prototype, "isExecuting", {
        get: function () { return this.executing(); },
        enumerable: true,
        configurable: true
    });
    MIOOperation.prototype.setExecuting = function (value) {
        if (value == this._isExecuting)
            return;
        this.willChangeValue("isExecuting");
        this._isExecuting = value;
        this.didChangeValue("isExecuting");
    };
    Object.defineProperty(MIOOperation.prototype, "isFinished", {
        get: function () { return this.finished(); },
        enumerable: true,
        configurable: true
    });
    MIOOperation.prototype.setFinished = function (value) {
        if (value == this._isFinished)
            return;
        this.willChangeValue("isFinished");
        this._isFinished = value;
        this.didChangeValue("isFinished");
    };
    MIOOperation.prototype.setReady = function (value) {
        if (value == this._ready)
            return;
        this.willChangeValue("ready");
        this._ready = value;
        this.didChangeValue("ready");
    };
    Object.defineProperty(MIOOperation.prototype, "ready", {
        get: function () {
            return this._ready;
        },
        enumerable: true,
        configurable: true
    });
    MIOOperation.prototype.addDependency = function (operation) {
        this._dependencies.push(operation);
        if (operation.isFinished == false) {
            operation.addObserver(this, "isFinished");
            this.setReady(false);
        }
    };
    MIOOperation.prototype.main = function () { };
    MIOOperation.prototype.start = function () {
        this.setExecuting(true);
        this.main();
        this.setExecuting(false);
        this.setFinished(true);
    };
    MIOOperation.prototype.executing = function () {
        return this._isExecuting;
    };
    MIOOperation.prototype.finished = function () {
        return this._isFinished;
    };
    MIOOperation.prototype.observeValueForKeyPath = function (keyPath, type, object, ctx) {
        if (type != "did")
            return;
        if (keyPath == "isFinished") {
            var op = object;
            if (op.isFinished == true) {
                object.removeObserver(this, "isFinished");
                this.checkDependecies();
            }
        }
    };
    MIOOperation.prototype.checkDependecies = function () {
        for (var index = 0; index < this._dependencies.length; index++) {
            var op = this._dependencies[index];
            if (op.isFinished == false)
                return;
        }
        this.setReady(true);
    };
    return MIOOperation;
}(MIOObject));
var MIOBlockOperation = (function (_super) {
    __extends(MIOBlockOperation, _super);
    function MIOBlockOperation() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.executionBlocks = [];
        return _this;
    }
    MIOBlockOperation.operationWithBlock = function (target, block) {
        var op = new MIOBlockOperation();
        op.init();
    };
    MIOBlockOperation.prototype.addExecutionBlock = function (target, block) {
        var item = {};
        item["Target"] = target;
        item["Block"] = block;
        this.executionBlocks.push(item);
    };
    MIOBlockOperation.prototype.main = function () {
        for (var index = 0; index < this.executionBlocks.length; index++) {
            var item = this.executionBlocks[index];
            var target = item["Target"];
            var block = item["Block"];
            block.call(target);
        }
    };
    return MIOBlockOperation;
}(MIOOperation));
var MIOOperationQueue = (function (_super) {
    __extends(MIOOperationQueue, _super);
    function MIOOperationQueue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._operations = [];
        _this._suspended = false;
        return _this;
    }
    MIOOperationQueue.prototype.addOperation = function (operation) {
        if (operation.isFinished == true) {
            throw ("MIOOperationQueue: Tying to add an operation already finished");
        }
        this.willChangeValue("operationCount");
        this.willChangeValue("operations");
        this._operations.addObject(operation);
        this.didChangeValue("operationCount");
        this.didChangeValue("operations");
        if (operation.ready == false) {
            operation.addObserver(this, "ready", null);
        }
        else {
            operation.addObserver(this, "isFinished", null);
            if (this.suspended == false)
                operation.start();
        }
    };
    MIOOperationQueue.prototype.removeOperation = function (operation) {
        var index = this._operations.indexOf(operation);
        if (index == -1)
            return;
        this.willChangeValue("operationCount");
        this.willChangeValue("operations");
        this._operations.splice(index, 1);
        this.didChangeValue("operationCount");
        this.didChangeValue("operations");
    };
    Object.defineProperty(MIOOperationQueue.prototype, "operations", {
        get: function () {
            return this._operations;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOOperationQueue.prototype, "operationCount", {
        get: function () {
            return this._operations.count;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOOperationQueue.prototype, "suspended", {
        get: function () {
            return this._suspended;
        },
        set: function (value) {
            this.setSupended(value);
        },
        enumerable: true,
        configurable: true
    });
    MIOOperationQueue.prototype.setSupended = function (value) {
        if (this._suspended == value)
            return;
        this._suspended = value;
        if (value == true)
            return;
        for (var index = 0; index < this.operations.length; index++) {
            var op = this.operations[index];
            if (op.ready == true)
                op.start();
        }
    };
    MIOOperationQueue.prototype.observeValueForKeyPath = function (keyPath, type, object, ctx) {
        if (type != "did")
            return;
        if (keyPath == "ready") {
            var op = object;
            if (op.ready == true) {
                op.removeObserver(this, "ready");
                op.addObserver(this, "isFinished", null);
                if (this.suspended == false)
                    op.start();
            }
        }
        else if (keyPath == "isFinished") {
            var op = object;
            if (op.isFinished == true) {
                op.removeObserver(this, "isFinished");
                this.removeOperation(op);
                if (op.target != null && op.completion != null)
                    op.completion.call(op.target);
            }
        }
    };
    return MIOOperationQueue;
}(MIOObject));
function MIOLog(format) {
    console.log(format);
}
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
        if (param == "forceMobile")
            _mc_force_mobile = value == "true" ? true : false;
    });
    if (type == MIOLibInitType.Debug) {
        _MIOLibDownloadLibFiles();
    }
}
function MIOLibDownloadScript(url, target, completion) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status == 200 && xhr.responseText != null) {
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
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
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
function _MIOLibDownloadLibFiles() {
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
    MIOLibDownloadLibFile("MUILabel");
    MIOLibDownloadLibFile("MIOTableView");
    MIOLibDownloadLibFile("MIOCollectionView");
    MIOLibDownloadLibFile("MIOCalendarView");
    MIOLibDownloadLibFile("MIOImageView");
    MIOLibDownloadLibFile("MIOMenu");
    MIOLibDownloadLibFile("MIOActivityIndicator");
    MIOLibDownloadLibFile("MIOWebView");
    MIOLibDownloadLibFile("MIOControl");
    MIOLibDownloadLibFile("MUIButton");
    MIOLibDownloadLibFile("MIOComboBox");
    MIOLibDownloadLibFile("MIOPopUpButton");
    MIOLibDownloadLibFile("MIOCheckButton");
    MIOLibDownloadLibFile("MIOSegmentedControl");
    MIOLibDownloadLibFile("MUITextField");
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
function _MIOSortDescriptorSortObjects(objs, sortDescriptors) {
    var resultObjects = null;
    if (objs.length == 0 || sortDescriptors == null) {
        resultObjects = objs.slice(0);
    }
    else {
        if (sortDescriptors == null)
            return objs;
        if (objs.length == 0)
            return objs;
        resultObjects = objs.sort(function (a, b) {
            return _MIOSortDescriptorSortObjects2(a, b, sortDescriptors, 0);
        });
    }
    return resultObjects;
}
function _MIOSortDescriptorSortObjects2(a, b, sortDescriptors, index) {
    if (index >= sortDescriptors.length)
        return 0;
    var sd = sortDescriptors[index];
    var key = sd.key;
    if (a[key] == b[key]) {
        if (a[key] == b[key]) {
            return _MIOSortDescriptorSortObjects2(a, b, sortDescriptors, ++index);
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
}
//# sourceMappingURL=index.js.map