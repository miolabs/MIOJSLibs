(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./Bundle_WebWorker.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../../../MIOFoundation/MIOObject.ts":
/*!***********************************************************************************!*\
  !*** /Users/mat/project/Miolabs/Libs/MIOJSLibs/source/MIOFoundation/MIOObject.ts ***!
  \***********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar MIOCorePlatform_1 = __webpack_require__(/*! ../MIOCorePlatform */ \"../../index.ts\");\nvar MIOObject = (function () {\n    function MIOObject() {\n        this.keyPaths = {};\n    }\n    Object.defineProperty(MIOObject.prototype, \"className\", {\n        get: function () {\n            var comp = this.constructor;\n            return comp.name;\n        },\n        enumerable: true,\n        configurable: true\n    });\n    MIOObject.prototype.init = function () { };\n    MIOObject.prototype._notifyValueChange = function (key, type) {\n        var observers = this.keyPaths[key];\n        if (observers == null)\n            return;\n        var obs = [];\n        for (var count = 0; count < observers.length; count++) {\n            var item = observers[count];\n            obs.push(item);\n        }\n        for (var count = 0; count < obs.length; count++) {\n            var item = obs[count];\n            var o = item[\"OBS\"];\n            if (typeof o.observeValueForKeyPath === \"function\") {\n                var keyPath = item[\"KP\"] != null ? item[\"KP\"] : key;\n                var ctx = item[\"CTX\"];\n                o.observeValueForKeyPath.call(o, keyPath, type, this, ctx);\n            }\n        }\n    };\n    MIOObject.prototype.willChangeValueForKey = function (key) {\n        this.willChangeValue(key);\n    };\n    MIOObject.prototype.didChangeValueForKey = function (key) {\n        this.didChangeValue(key);\n    };\n    MIOObject.prototype.willChangeValue = function (key) {\n        this._notifyValueChange(key, \"will\");\n    };\n    MIOObject.prototype.didChangeValue = function (key) {\n        this._notifyValueChange(key, \"did\");\n    };\n    MIOObject.prototype._addObserver = function (obs, key, context, keyPath) {\n        var observers = this.keyPaths[key];\n        if (observers == null) {\n            observers = [];\n            this.keyPaths[key] = observers;\n        }\n        var item = { \"OBS\": obs };\n        if (context != null)\n            item[\"CTX\"] = context;\n        if (keyPath != null)\n            item[\"KP\"] = keyPath;\n        observers.push(item);\n    };\n    MIOObject.prototype._keyFromKeypath = function (keypath) {\n        var index = keypath.indexOf('.');\n        if (index == -1) {\n            return [keypath, null];\n        }\n        var key = keypath.substring(0, index);\n        var offset = keypath.substring(index + 1);\n        return [key, offset];\n    };\n    MIOObject.prototype.addObserver = function (obs, keypath, context) {\n        var _a = this._keyFromKeypath(keypath), key = _a[0], offset = _a[1];\n        if (offset == null) {\n            this._addObserver(obs, key, context);\n        }\n        else {\n            var obj = this;\n            var exit = false;\n            while (exit == false) {\n                if (offset == null) {\n                    obj._addObserver(obs, key, context, keypath);\n                    exit = true;\n                }\n                else {\n                    obj = this.valueForKey(key);\n                    _b = this._keyFromKeypath(offset), key = _b[0], offset = _b[1];\n                }\n                if (obj == null)\n                    throw (\"ERROR: Registering observer to null object\");\n            }\n        }\n        var _b;\n    };\n    MIOObject.prototype.removeObserver = function (obs, keypath) {\n        var observers = this.keyPaths[keypath];\n        if (observers == null)\n            return;\n        var index = observers.indexOf(obs);\n        observers.splice(index, 1);\n    };\n    MIOObject.prototype.setValueForKey = function (value, key) {\n        this.willChangeValue(key);\n        this[key] = value;\n        this.didChangeValue(value);\n    };\n    MIOObject.prototype.valueForKey = function (key) {\n        return this[key];\n    };\n    MIOObject.prototype.valueForKeyPath = function (keyPath) {\n        var _a = this._keyFromKeypath(keyPath), key = _a[0], offset = _a[1];\n        var value = null;\n        var obj = this;\n        var exit = false;\n        while (exit == false) {\n            if (offset == null) {\n                value = obj.valueForKey(key);\n                exit = true;\n            }\n            else {\n                obj = obj.valueForKey(key);\n                _b = this._keyFromKeypath(offset), key = _b[0], offset = _b[1];\n                if (obj == null)\n                    exit = true;\n            }\n        }\n        return value;\n        var _b;\n    };\n    MIOObject.prototype.copy = function () {\n        var obj = MIOCorePlatform_1.MIOClassFromString(this.className);\n        obj.init();\n        return obj;\n    };\n    return MIOObject;\n}());\nexports.MIOObject = MIOObject;\n\n\n//# sourceURL=webpack:////Users/mat/project/Miolabs/Libs/MIOJSLibs/source/MIOFoundation/MIOObject.ts?");

/***/ }),

/***/ "../../../MIOFoundation/MIOURL.ts":
/*!********************************************************************************!*\
  !*** /Users/mat/project/Miolabs/Libs/MIOJSLibs/source/MIOFoundation/MIOURL.ts ***!
  \********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || (function () {\n    var extendStatics = Object.setPrototypeOf ||\n        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\n        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };\n    return function (d, b) {\n        extendStatics(d, b);\n        function __() { this.constructor = d; }\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n    };\n})();\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar MIOObject_1 = __webpack_require__(/*! ./MIOObject */ \"../../../MIOFoundation/MIOObject.ts\");\nvar MIOURLTokenType;\n(function (MIOURLTokenType) {\n    MIOURLTokenType[MIOURLTokenType[\"Protocol\"] = 0] = \"Protocol\";\n    MIOURLTokenType[MIOURLTokenType[\"Host\"] = 1] = \"Host\";\n    MIOURLTokenType[MIOURLTokenType[\"Path\"] = 2] = \"Path\";\n    MIOURLTokenType[MIOURLTokenType[\"Param\"] = 3] = \"Param\";\n    MIOURLTokenType[MIOURLTokenType[\"Value\"] = 4] = \"Value\";\n})(MIOURLTokenType = exports.MIOURLTokenType || (exports.MIOURLTokenType = {}));\nvar MIOURL = (function (_super) {\n    __extends(MIOURL, _super);\n    function MIOURL() {\n        var _this = _super !== null && _super.apply(this, arguments) || this;\n        _this.baseURL = null;\n        _this.absoluteString = null;\n        _this.scheme = null;\n        _this.user = null;\n        _this.password = null;\n        _this.host = null;\n        _this.port = 0;\n        _this.hostname = null;\n        _this.path = \"/\";\n        _this.file = null;\n        _this.pathExtension = null;\n        _this.params = [];\n        return _this;\n    }\n    MIOURL.urlWithString = function (urlString) {\n        var url = new MIOURL();\n        url.initWithURLString(urlString);\n        return url;\n    };\n    MIOURL.prototype.initWithScheme = function (scheme, host, path) {\n        _super.prototype.init.call(this);\n        this.scheme = scheme;\n        this.host = host;\n        this.path = path;\n        this.absoluteString = \"\";\n        if (scheme.length > 0)\n            this.absoluteString += scheme + \"://\";\n        if (host.length > 0)\n            this.absoluteString += host + \"/\";\n        if (path.length > 0)\n            this.absoluteString += path;\n    };\n    MIOURL.prototype.initWithURLString = function (urlString) {\n        _super.prototype.init.call(this);\n        this.absoluteString = urlString;\n        this._parseURLString(urlString);\n    };\n    MIOURL.prototype._parseURLString = function (urlString) {\n        var param = \"\";\n        var value = \"\";\n        var token = \"\";\n        var step = MIOURLTokenType.Protocol;\n        var foundPort = false;\n        var foundExt = false;\n        for (var index = 0; index < urlString.length; index++) {\n            var ch = urlString.charAt(index);\n            if (ch == \":\") {\n                if (step == MIOURLTokenType.Protocol) {\n                    this.scheme = token;\n                    token = \"\";\n                    index += 2;\n                    step = MIOURLTokenType.Host;\n                }\n                else if (step == MIOURLTokenType.Host) {\n                    this.hostname = token;\n                    token = \"\";\n                    foundPort = true;\n                }\n            }\n            else if (ch == \"/\") {\n                if (step == MIOURLTokenType.Host) {\n                    if (foundPort == true) {\n                        this.host = this.hostname + \":\" + token;\n                        this.port = parseInt(token);\n                    }\n                    else {\n                        this.host = token;\n                        this.hostname = token;\n                    }\n                    step = MIOURLTokenType.Path;\n                }\n                else {\n                    this.path += token + ch;\n                }\n                token = \"\";\n            }\n            else if (ch == \".\" && step == MIOURLTokenType.Path) {\n                this.file = token;\n                foundExt = true;\n                token = \"\";\n            }\n            else if (ch == \"?\") {\n                if (foundExt == true) {\n                    this.file += \".\" + token;\n                    this.pathExtension = token;\n                }\n                else\n                    this.file = token;\n                token = \"\";\n                step = MIOURLTokenType.Param;\n            }\n            else if (ch == \"&\") {\n                var item = { \"Key\": param, \"Value\": value };\n                this.params.push(item);\n                step = MIOURLTokenType.Param;\n                param = \"\";\n                value = \"\";\n            }\n            else if (ch == \"=\") {\n                param = token;\n                step = MIOURLTokenType.Value;\n                token = \"\";\n            }\n            else {\n                token += ch;\n            }\n        }\n        if (token.length > 0) {\n            if (step == MIOURLTokenType.Path) {\n                if (foundExt == true) {\n                    this.file += \".\" + token;\n                    this.pathExtension = token;\n                }\n                else\n                    this.path += token;\n            }\n            else if (step == MIOURLTokenType.Param) {\n                var i = { \"key\": token };\n                this.params.push(i);\n            }\n            else if (step == MIOURLTokenType.Value) {\n                var item = { \"Key\": param, \"Value\": token };\n                this.params.push(item);\n            }\n        }\n    };\n    MIOURL.prototype.urlByAppendingPathComponent = function (path) {\n        var urlString = this.scheme + \"://\" + this.host + this.path;\n        if (urlString.charAt(urlString.length - 1) != \"/\")\n            urlString += \"/\";\n        if (path.charAt(0) != \"/\")\n            urlString += path;\n        else\n            urlString += path.substr(1);\n        var newURL = MIOURL.urlWithString(urlString);\n        return newURL;\n    };\n    MIOURL.prototype.standardizedURL = function () {\n        return null;\n    };\n    return MIOURL;\n}(MIOObject_1.MIOObject));\nexports.MIOURL = MIOURL;\n\n\n//# sourceURL=webpack:////Users/mat/project/Miolabs/Libs/MIOJSLibs/source/MIOFoundation/MIOURL.ts?");

/***/ }),

/***/ "../../../MIOFoundation/MIOURLConnection.ts":
/*!******************************************************************************************!*\
  !*** /Users/mat/project/Miolabs/Libs/MIOJSLibs/source/MIOFoundation/MIOURLConnection.ts ***!
  \******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar MIOURLConnection = (function () {\n    function MIOURLConnection() {\n        this.request = null;\n        this.delegate = null;\n        this.blockFN = null;\n        this.blockTarget = null;\n        this.xmlHttpRequest = null;\n    }\n    MIOURLConnection.prototype.initWithRequest = function (request, delegate) {\n        this.request = request;\n        this.delegate = delegate;\n        this.start();\n    };\n    MIOURLConnection.prototype.initWithRequestBlock = function (request, blockTarget, blockFN) {\n        this.request = request;\n        this.blockFN = blockFN;\n        this.blockTarget = blockTarget;\n        this.start();\n    };\n    MIOURLConnection.prototype.start = function () {\n        this.xmlHttpRequest = new XMLHttpRequest();\n        var instance = this;\n        this.xmlHttpRequest.onload = function () {\n            if (this.status >= 200 && this.status <= 300) {\n                if (instance.delegate != null)\n                    instance.delegate.connectionDidReceiveText(instance, this.responseText);\n                else if (instance.blockFN != null) {\n                }\n            }\n            else {\n                if (instance.delegate != null)\n                    instance.delegate.connectionDidFail(instance);\n                else if (instance.blockFN != null)\n                    instance.blockFN.call(instance.blockTarget, this.status, this.responseText);\n            }\n        };\n        var urlString = this.request.url.absoluteString;\n        this.xmlHttpRequest.open(this.request.httpMethod, urlString);\n        for (var count = 0; count < this.request.headers.length; count++) {\n            var item = this.request.headers[count];\n            this.xmlHttpRequest.setRequestHeader(item[\"Field\"], item[\"Value\"]);\n        }\n        if (this.request.binary == true)\n            this.xmlHttpRequest.responseType = \"arraybuffer\";\n        if (this.request.httpMethod == \"GET\" || this.request.httpBody == null)\n            this.xmlHttpRequest.send();\n        else\n            this.xmlHttpRequest.send(this.request.httpBody);\n    };\n    return MIOURLConnection;\n}());\nexports.MIOURLConnection = MIOURLConnection;\n\n\n//# sourceURL=webpack:////Users/mat/project/Miolabs/Libs/MIOJSLibs/source/MIOFoundation/MIOURLConnection.ts?");

/***/ }),

/***/ "../../../MIOFoundation/MIOURLRequest.ts":
/*!***************************************************************************************!*\
  !*** /Users/mat/project/Miolabs/Libs/MIOJSLibs/source/MIOFoundation/MIOURLRequest.ts ***!
  \***************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || (function () {\n    var extendStatics = Object.setPrototypeOf ||\n        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\n        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };\n    return function (d, b) {\n        extendStatics(d, b);\n        function __() { this.constructor = d; }\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n    };\n})();\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar MIOObject_1 = __webpack_require__(/*! ./MIOObject */ \"../../../MIOFoundation/MIOObject.ts\");\nvar MIOURLRequest = (function (_super) {\n    __extends(MIOURLRequest, _super);\n    function MIOURLRequest() {\n        var _this = _super !== null && _super.apply(this, arguments) || this;\n        _this.url = null;\n        _this.httpMethod = \"GET\";\n        _this.httpBody = null;\n        _this.headers = [];\n        _this.binary = false;\n        _this.download = false;\n        return _this;\n    }\n    MIOURLRequest.requestWithURL = function (url) {\n        var request = new MIOURLRequest();\n        request.initWithURL(url);\n        return request;\n    };\n    MIOURLRequest.prototype.initWithURL = function (url) {\n        this.url = url;\n    };\n    MIOURLRequest.prototype.setHeaderField = function (field, value) {\n        this.headers.push({ \"Field\": field, \"Value\": value });\n    };\n    return MIOURLRequest;\n}(MIOObject_1.MIOObject));\nexports.MIOURLRequest = MIOURLRequest;\n\n\n//# sourceURL=webpack:////Users/mat/project/Miolabs/Libs/MIOJSLibs/source/MIOFoundation/MIOURLRequest.ts?");

/***/ }),

/***/ "../../WebWorker/MIOCore_WebWorker.ts":
/*!*******************************************************************************************************!*\
  !*** /Users/mat/project/Miolabs/Libs/MIOJSLibs/source/MIOCorePlatform/WebWorker/MIOCore_WebWorker.ts ***!
  \*******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || (function () {\n    var extendStatics = Object.setPrototypeOf ||\n        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\n        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };\n    return function (d, b) {\n        extendStatics(d, b);\n        function __() { this.constructor = d; }\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n    };\n})();\nObject.defineProperty(exports, \"__esModule\", { value: true });\nfunction MIOClassFromString(name) {\n    return null;\n}\nexports.MIOClassFromString = MIOClassFromString;\nvar MIOCoreEvent = (function () {\n    function MIOCoreEvent() {\n        this.eventType = null;\n        this.target = null;\n        this.completion = null;\n    }\n    MIOCoreEvent.prototype.initWithType = function (eventType, coreEvent) {\n        this.coreEvent = coreEvent;\n        this.eventType = eventType;\n    };\n    MIOCoreEvent.prototype.cancel = function () {\n        this.coreEvent.preventDefault();\n    };\n    return MIOCoreEvent;\n}());\nexports.MIOCoreEvent = MIOCoreEvent;\nvar MIOCoreEventInput = (function (_super) {\n    __extends(MIOCoreEventInput, _super);\n    function MIOCoreEventInput() {\n        var _this = _super !== null && _super.apply(this, arguments) || this;\n        _this.target = null;\n        _this.x = 0;\n        _this.y = 0;\n        _this.deltaX = 0;\n        _this.deltaY = 0;\n        return _this;\n    }\n    return MIOCoreEventInput;\n}(MIOCoreEvent));\nexports.MIOCoreEventInput = MIOCoreEventInput;\nvar MIOCoreEventType;\n(function (MIOCoreEventType) {\n    MIOCoreEventType[MIOCoreEventType[\"KeyUp\"] = 0] = \"KeyUp\";\n    MIOCoreEventType[MIOCoreEventType[\"KeyDown\"] = 1] = \"KeyDown\";\n    MIOCoreEventType[MIOCoreEventType[\"MouseUp\"] = 2] = \"MouseUp\";\n    MIOCoreEventType[MIOCoreEventType[\"MouseDown\"] = 3] = \"MouseDown\";\n    MIOCoreEventType[MIOCoreEventType[\"TouchStart\"] = 4] = \"TouchStart\";\n    MIOCoreEventType[MIOCoreEventType[\"TouchEnd\"] = 5] = \"TouchEnd\";\n    MIOCoreEventType[MIOCoreEventType[\"Click\"] = 6] = \"Click\";\n    MIOCoreEventType[MIOCoreEventType[\"Resize\"] = 7] = \"Resize\";\n})(MIOCoreEventType = exports.MIOCoreEventType || (exports.MIOCoreEventType = {}));\n\n\n//# sourceURL=webpack:////Users/mat/project/Miolabs/Libs/MIOJSLibs/source/MIOCorePlatform/WebWorker/MIOCore_WebWorker.ts?");

/***/ }),

/***/ "../../index.ts":
/*!*********************************************************************************!*\
  !*** /Users/mat/project/Miolabs/Libs/MIOJSLibs/source/MIOCorePlatform/index.ts ***!
  \*********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nfunction __export(m) {\n    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];\n}\nObject.defineProperty(exports, \"__esModule\", { value: true });\n__export(__webpack_require__(/*! ./WebWorker/MIOCore_WebWorker */ \"../../WebWorker/MIOCore_WebWorker.ts\"));\n\n\n//# sourceURL=webpack:////Users/mat/project/Miolabs/Libs/MIOJSLibs/source/MIOCorePlatform/index.ts?");

/***/ }),

/***/ "./Bundle_WebWorker.ts":
/*!*****************************!*\
  !*** ./Bundle_WebWorker.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar MIOURLRequest_1 = __webpack_require__(/*! ../../../MIOFoundation/MIOURLRequest */ \"../../../MIOFoundation/MIOURLRequest.ts\");\nvar MIOURLConnection_1 = __webpack_require__(/*! ../../../MIOFoundation/MIOURLConnection */ \"../../../MIOFoundation/MIOURLConnection.ts\");\nvar MIOURL_1 = __webpack_require__(/*! ../../../MIOFoundation/MIOURL */ \"../../../MIOFoundation/MIOURL.ts\");\nvar ww = self;\nvar _languageStrings = null;\nww.addEventListener('message', function (e) {\n    var item = e.data;\n    var cmd = item[\"CMD\"];\n    if (cmd == \"SetLanguageStrings\") {\n        _languageStrings = item[\"LanguageStrings\"];\n    }\n    else if (cmd == \"DownloadHTML\") {\n        var url = item[\"URL\"];\n        var layerID = item[\"LayerID\"];\n        var path = item[\"Path\"];\n        downloadHTML(url, layerID, path);\n    }\n}, false);\nfunction downloadHTML(url, layerID, path) {\n    var conn = new MIOURLConnection_1.MIOURLConnection();\n    conn.initWithRequestBlock(MIOURLRequest_1.MIOURLRequest.requestWithURL(MIOURL_1.MIOURL.urlWithString(url)), this, function (code, data) {\n        this.parseHTML(url, data, layerID, path);\n    });\n}\nfunction parseHTML(url, data, layerID, path) {\n    if (data == null) {\n        ww.postMessage({ \"Error\": \"Couldn't download resource\" });\n    }\n    else {\n        var result = MIOHTMLParser(data, layerID, path, function (css) {\n        });\n        var item = [];\n        item[\"Type\"] = \"HTML\";\n        item[\"Result\"] = result;\n        item[\"LayerID\"] = layerID;\n        ww.postMessage(item);\n    }\n}\nfunction MIOHTMLParser(string, layerID, relativePath, callback) {\n    var tag = \"\";\n    var attribute = \"\";\n    var value = \"\";\n    var token = \"\";\n    var styles = [];\n    var currentStyle = null;\n    var tagContent = \"\";\n    var layout = \"\";\n    var isCapturing = false;\n    var captureTag = null;\n    var openTagCount = 0;\n    console.log(\"*********************\");\n    console.log(string);\n    var stepIndex = 0;\n    for (var index = 0; index < string.length; index++) {\n        var ch = string.charAt(index);\n        if (isCapturing == true)\n            layout += ch;\n        if (ch == \"<\") {\n            if (isCapturing && string.charAt(index + 1) != \"/\")\n                openTagCount++;\n            tagContent = \"<\";\n            tag = \"\";\n            attribute = \"\";\n            var attributes = {};\n            value = \"\";\n            stepIndex = 1;\n            index++;\n            for (var count = index; count < string.length; count++, index++) {\n                var ch2 = string.charAt(index);\n                tagContent += ch2;\n                if (isCapturing == true)\n                    layout += ch2;\n                if (ch2 == \"/\") {\n                    if (token.length > 0) {\n                        value = token;\n                        if (currentStyle != null) {\n                            currentStyle[attribute] = value;\n                        }\n                    }\n                    if (isCapturing) {\n                        openTagCount--;\n                        if (openTagCount == 0) {\n                            isCapturing = false;\n                            layout += captureTag + \">\";\n                        }\n                    }\n                    tagContent = \"\";\n                }\n                else if (ch2 == \">\") {\n                    if (currentStyle != null) {\n                        styles.push(currentStyle);\n                        FoundLink(currentStyle, callback);\n                    }\n                    currentStyle = null;\n                    break;\n                }\n                else if (ch2 == \" \") {\n                    if (token.length == 0)\n                        continue;\n                    switch (stepIndex) {\n                        case 1:\n                            tag = token;\n                            stepIndex = 2;\n                            if (tag == \"link\") {\n                                currentStyle = {};\n                            }\n                            break;\n                        case 3:\n                            value = token;\n                            attributes[attribute] = value;\n                            stepIndex = 2;\n                            if (currentStyle != null) {\n                                currentStyle[attribute] = value;\n                            }\n                            break;\n                    }\n                    token = \"\";\n                }\n                else if (ch2 == \"=\") {\n                    stepIndex = 3;\n                    attribute = token;\n                    token = \"\";\n                }\n                else if (ch2 == \"\\\"\") {\n                    count++;\n                    index++;\n                    for (var count2 = index; count2 < string.length; count2++, count++, index++) {\n                        var ch3 = string.charAt(index);\n                        tagContent += ch3;\n                        if (isCapturing == true)\n                            layout += ch3;\n                        if (ch3 == \"\\\"\")\n                            break;\n                        else\n                            token += ch3;\n                    }\n                }\n                else {\n                    token += ch2;\n                }\n            }\n            if (token.length > 0) {\n                switch (stepIndex) {\n                    case 1:\n                        tag = token;\n                        stepIndex = 2;\n                        if (tag == \"link\") {\n                            currentStyle = {};\n                        }\n                        break;\n                    case 2:\n                        attribute = token;\n                        break;\n                    case 3:\n                        value = token;\n                        attributes[attribute] = value;\n                        stepIndex = 2;\n                        if (attributes[\"id\"] == layerID) {\n                            isCapturing = true;\n                            openTagCount = 1;\n                            captureTag = tag;\n                            layout += tagContent;\n                        }\n                        if (currentStyle != null) {\n                            currentStyle[attribute] = value;\n                        }\n                        break;\n                }\n                token = \"\";\n            }\n            stepIndex = 4;\n        }\n    }\n    console.log(\"---------------------\");\n    console.log(layout);\n    var styleFiles = [];\n    for (var index_1 = 0; index_1 < styles.length; index_1++) {\n        var s = styles[index_1];\n        if (s[\"rel\"] == \"stylesheet\") {\n            var css = { \"url\": s[\"href\"] };\n            var media = s[\"media\"];\n            if (media != null)\n                css[\"media\"] = media;\n            styleFiles.push(css);\n            console.log(\"CSS: \" + css);\n        }\n    }\n    console.log(\"*********************\");\n    return {\n        styles: styleFiles,\n        layout: layout\n    };\n}\nfunction FoundLink(link, callback) {\n    if (link[\"rel\"] == \"stylesheet\") {\n        var css = { \"url\": link[\"href\"] };\n        var media = link[\"media\"];\n        if (media != null)\n            css[\"media\"] = media;\n        callback(css);\n        console.log(\"Send CSS: \" + css);\n    }\n}\n\n\n//# sourceURL=webpack:///./Bundle_WebWorker.ts?");

/***/ })

/******/ });
});