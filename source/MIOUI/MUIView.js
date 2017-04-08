/**
 * Created by godshadow on 11/3/16.
 */
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
/// <reference path="../MIOFoundation/MIOFoundation.ts" />
var _MIOViewNextLayerID = 0;
function MUIViewGetNextLayerID(prefix) {
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
function MUILayerSearchElementByID(layer, elementID) {
    if (layer.tagName != "DIV" && layer.tagName != "INPUT")
        return null;
    if (layer.getAttribute("id") == elementID)
        return layer;
    var elementFound = null;
    for (var count = 0; count < layer.childNodes.length; count++) {
        var l = layer.childNodes[count];
        elementFound = MUILayerSearchElementByID(l, elementID);
        if (elementFound != null)
            return elementFound;
    }
    return null;
}
function MUILayerGetFirstElementWithTag(layer, tag) {
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
// function MUILayerFromResource(url, css, elementID)
// {
//     var htmlString = MIOCCoreLoadTextFile(url);
//     var parser = new DOMParser();
//     var html = parser.parseFromString(htmlString, "text/html");
//     //var styles = html.styleSheets;
//     //if (css != null)
//         //MIOCoreLoadStyle(css);
//     return(html.getElementById(elementID));
// }
var MUIView = (function (_super) {
    __extends(MUIView, _super);
    function MUIView(layerID) {
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
        _this._window = null;
        _this.layerID = layerID ? layerID : MUICoreLayerIDFromObject(_this);
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
    MUIView.prototype.initWithFrame = function (frame) {
        this.layer = document.createElement("div");
        this.layer.setAttribute("id", this.layerID);
        this.layer.style.position = "absolute";
        this.layer.style.left = frame.origin.x + "px";
        this.layer.style.top = frame.origin.y + "px";
        this.layer.style.width = frame.size.width + "px";
        this.layer.style.height = frame.size.height + "px";
    };
    MUIView.prototype.initWithLayer = function (layer, options) {
        this.layer = layer;
        this.layerOptions = options;
        this._addLayerToDOM();
    };
    MUIView.prototype.awakeFromHTML = function () {
    };
    MUIView.prototype.setParent = function (view) {
        this.willChangeValue("parent");
        this.parent = view;
        this.didChangeValue("parent");
    };
    MUIView.prototype.addSubLayer = function (layer) {
        this.layer.innerHTML = layer.innerHTML;
    };
    MUIView.prototype.addSubview = function (view) {
        view.setParent(this);
        this.subviews.push(view);
        view._addLayerToDOM();
    };
    MUIView.prototype._addLayerToDOM = function () {
        if (this._isLayerInDOM == true)
            return;
        if (this.layer == null || this.parent == null)
            return;
        this.parent.layer.appendChild(this.layer);
        this._isLayerInDOM = true;
    };
    MUIView.prototype.removeFromSuperview = function () {
        this.parent._removeView(this);
        this._isLayerInDOM = false;
    };
    MUIView.prototype._removeLayerFromDOM = function () {
        if (this._isLayerInDOM == false)
            return;
        this.layer.removeChild(this.layer);
        this._isLayerInDOM = false;
    };
    MUIView.prototype._linkViewToSubview = function (view) {
        this.subviews.push(view);
    };
    MUIView.prototype._removeView = function (view) {
        var index = this.subviews.indexOf(view);
        this.subviews.splice(index, 1);
        this.layer.removeChild(view.layer);
    };
    MUIView.prototype._removeAllSubviews = function () {
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
    MUIView.prototype.layout = function () {
        if (this.hidden == true)
            return;
        for (var index = 0; index < this.subviews.length; index++) {
            var v = this.subviews[index];
            if (!(v instanceof MUIView)) {
                console.log("ERROR Laying out not a view");
            }
            else
                v.layout();
        }
    };
    MUIView.prototype.layerWithItemID = function (itemID) {
        return MUILayerSearchElementByID(this.layer, itemID);
    };
    MUIView.prototype.setHidden = function (hidden) {
        this.hidden = hidden;
        if (this.layer == null)
            return;
        if (hidden)
            this.layer.style.display = "none";
        else
            this.layer.style.display = "";
    };
    MUIView.prototype.setBackgroundColor = function (color) {
        this.layer.style.backgroundColor = "#" + color;
    };
    MUIView.prototype.setBackgroundRGBColor = function (r, g, b, a) {
        if (a == null) {
            var value = "rgb(" + r + ", " + g + ", " + b + ")";
            this.layer.style.backgroundColor = value;
        }
        else {
            var value = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
            this.layer.style.backgroundColor = value;
        }
    };
    MUIView.prototype.getBackgroundColor = function () {
        var cs = document.defaultView.getComputedStyle(this.layer, null);
        var bg = cs.getPropertyValue('background-color');
        return bg;
    };
    MUIView.prototype.setAlpha = function (alpha, animate, duration) {
        if (animate == true || duration > 0) {
            this.layer.style.transition = "opacity " + duration + "s";
        }
        this.alpha = alpha;
        this.layer.style.opacity = alpha;
    };
    MUIView.prototype.setX = function (x, animate, duration) {
        if (animate == true || duration > 0) {
            this.layer.style.transition = "left " + duration + "s";
        }
        this.layer.style.left = x + "px";
    };
    MUIView.prototype.getX = function () {
        //var x = this.layer.clientX;
        var x = this._getIntValueFromCSSProperty("left");
        return x;
    };
    MUIView.prototype.setY = function (y) {
        this.layer.style.top = y + "px";
    };
    MUIView.prototype.getY = function () {
        //var y = this.layer.clientY;
        var y = this._getIntValueFromCSSProperty("top");
        return y;
    };
    MUIView.prototype.setWidth = function (w) {
        this.layer.style.width = w + "px";
    };
    MUIView.prototype.getWidth = function () {
        var w1 = this.layer.clientWidth;
        var w2 = this._getIntValueFromCSSProperty("width");
        var w = Math.max(w1, w2);
        return w;
    };
    MUIView.prototype.setHeight = function (h) {
        this.willChangeValue("height");
        this.layer.style.height = h + "px";
        this.didChangeValue("height");
    };
    MUIView.prototype.getHeight = function () {
        var h1 = this.layer.clientHeight;
        var h2 = this._getIntValueFromCSSProperty("height");
        var h = Math.max(h1, h2);
        return h;
    };
    MUIView.prototype.setFrameComponents = function (x, y, w, h) {
        this.setX(x);
        this.setY(y);
        this.setWidth(w);
        this.setHeight(h);
    };
    MUIView.prototype.setFrame = function (frame) {
        this.willChangeValue("frame");
        this.setFrameComponents(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
        this.didChangeValue("frame");
    };
    Object.defineProperty(MUIView.prototype, "frame", {
        get: function () {
            return MIOFrame.frameWithRect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
        },
        enumerable: true,
        configurable: true
    });
    //
    // CSS Subsystem
    //
    MUIView.prototype._getValueFromCSSProperty = function (property) {
        var v = window.getComputedStyle(this.layer, null).getPropertyValue(property);
        return v;
    };
    MUIView.prototype._getIntValueFromCSSProperty = function (property) {
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
    return MUIView;
}(MIOObject));
