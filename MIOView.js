/**
 * Created by godshadow on 11/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOCore.ts" />
function MIOViewFromElementID(view, elementID) {
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var v = new MIOView();
    v.initWithLayer(layer);
    view._linkViewToSubview(v);
    return v;
}
function MIOLayerSearchElementByID(layer, elementID) {
    if (layer.tagName != "DIV")
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
function MIOViewFromResource(url, css, elementID) {
    var view = new MIOView();
    var layer = MIOLayerFromResource(url, css, elementID);
    view.initWithLayer(layer);
    return view;
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
        _super.call(this);
        this.layerID = null;
        this.layer = null;
        this.subviews = [];
        this.hidden = false;
        this.alpha = 1;
        this.parent = null;
        this.layerID = layerID;
    }
    MIOView.prototype.init = function () {
        this.layer = document.createElement("div");
        this.layer.setAttribute("id", this.layerID);
        this.layer.style.position = "absolute";
        this.layer.style.top = "0px";
        this.layer.style.left = "0px";
        this.layer.style.width = "100%";
        this.layer.style.height = "100%";
    };
    MIOView.prototype.initWithFrame = function (x, y, width, height) {
        this.init();
        this.layer.style.position = "absolute";
        this.layer.setAttribute("id", this.layerID);
        this.layer.style.left = x + "px";
        this.layer.style.top = y + "px";
        this.layer.style.width = width + "px";
        this.layer.style.height = height + "px";
    };
    MIOView.prototype.initWithLayer = function (layer) {
        this.layer = layer;
        // Async loading / DOM model
        if (this.parent != null)
            this.parent.layer.appendChild(this.layer);
        // Set all properties when the layer is ready
        this.setHidden(this.hidden);
        this.setAlpha(this.alpha);
    };
    MIOView.prototype.setParent = function (view) {
        this.willChangeValue("parent");
        this.parent = view;
        this.didChangeValue("parent");
    };
    MIOView.prototype.layout = function () {
        for (var index = 0; index < this.subviews.length; index++) {
            var v = this.subviews[index];
            v.layout();
        }
    };
    MIOView.prototype.addSubview = function (view) {
        view.setParent(this);
        this.subviews.push(view);
        if (view.layer != null)
            this.layer.appendChild(view.layer);
    };
    MIOView.prototype.removeFromSuperview = function () {
        this.parent._removeView(this);
    };
    MIOView.prototype._linkViewToSubview = function (view) {
        this.subviews.push(view);
    };
    MIOView.prototype._removeView = function (view) {
        var index = this.subviews.indexOf(view);
        this.subviews.slice(index, 1);
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
    MIOView.prototype.layerWithItemID = function (itemID) {
        return MIOLayerSearchElementByID(this.layer, itemID);
    };
    MIOView.prototype.setHidden = function (hidden) {
        if (hidden)
            this.layer.style.display = "none";
        else
            this.layer.style.display = "inline";
        this.hidden = hidden;
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
        var x = this.layer.clientX;
        return x;
    };
    MIOView.prototype.setY = function (y) {
        this.layer.style.top = y + "px";
    };
    MIOView.prototype.getY = function () {
        var y = this.layer.clientY;
        return y;
    };
    MIOView.prototype.setWidth = function (w) {
        this.layer.style.width = w + "px";
    };
    MIOView.prototype.getWidth = function () {
        var w = this.layer.clientWidth;
        return w;
    };
    MIOView.prototype.setHeight = function (h) {
        this.willChangeValue("height");
        this.layer.style.height = h + "px";
        this.didChangeValue("height");
    };
    MIOView.prototype.getHeight = function () {
        var h = this.layer.clientHeight;
        return h;
    };
    MIOView.prototype.setFrame = function (x, y, w, h) {
        this.setX(x);
        this.setY(y);
        this.setWidth(w);
        this.setHeight(h);
    };
    return MIOView;
})(MIOObject);
//# sourceMappingURL=MIOView.js.map