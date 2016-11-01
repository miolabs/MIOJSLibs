/**
 * Created by godshadow on 11/3/16.
 */

    /// <reference path="MIOCore.ts" />
    /// <reference path="MIOObject.ts" />

var _MIOViewNextLayerID = 0;

function MIOViewGetNextLayerID(prefix?)
{
    var layerID = null;
    if (prefix == null)
    {
        _MIOViewNextLayerID++;
        layerID = _MIOViewNextLayerID;
    }
    else
    {
        layerID = prefix + "_" + _MIOViewNextLayerID;
    }

    return layerID;
}

function MIOViewFromElementID(view, elementID)
{
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;

    var v = new MIOView();
    v.initWithLayer(layer);
    view._linkViewToSubview(v);

    return v;
}

function MIOLayerSearchElementByID(layer, elementID)
{
    if (layer.tagName != "DIV" && layer.tagName != "INPUT")
            return null;

    if (layer.getAttribute("id") == elementID)
        return layer;

    var elementFound = null;

    for (var count = 0; count < layer.childNodes.length; count++)
    {
        var l = layer.childNodes[count];
        elementFound = MIOLayerSearchElementByID(l, elementID);
        if (elementFound != null)
            return elementFound;

    }

    return null;
}

function MIOLayerGetFirstElementWithTag(layer, tag)
{
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

function MIOViewFromResource(url, css, elementID)
{
    var view = new MIOView();

    var layer = MIOLayerFromResource(url, css, elementID);
    view.initWithLayer(layer);

    return view;
}

function MIOLayerFromResource(url, css, elementID)
{
    var htmlString = MIOCCoreLoadTextFile(url);

    var parser = new DOMParser();
    var html = parser.parseFromString(htmlString, "text/html");

    //var styles = html.styleSheets;

    //if (css != null)
        //MIOCoreLoadStyle(css);

    return(html.getElementById(elementID));
}


class MIOView extends MIOObject
{
    layerID = null;
    layer = null;
    layerOptions = null;
    subviews = [];
    hidden = false;
    alpha = 1;
    parent = null;
    tag = null;

    _needDisplay = false;
    _isLayerInDOM = false;

    constructor(layerID?)
    {
        super();
        if (layerID != null)
            this.layerID = layerID;
        else
            this.layerID = MIOViewGetNextLayerID();
    }

    init()
    {
        this.layer = document.createElement("div");
        this.layer.setAttribute("id", this.layerID);
        this.layer.style.position = "absolute";
        this.layer.style.top = "0px";
        this.layer.style.left = "0px";
        this.layer.style.width = "100%";
        this.layer.style.height = "100%";
        this.layer.style.background = "rgb(255, 255, 255)";
    }

    // initWithFrame(x, y, width, height)
    // {
    //     this.layer = document.createElement("div");
    //     this.layer.setAttribute("id", this.layerID);
    //     this.layer.style.position = "absolute";
    //     this.layer.setAttribute("id", this.layerID);
    //     this.layer.style.left = x + "px";
    //     this.layer.style.top = y + "px";
    //     this.layer.style.width = width + "px";
    //     this.layer.style.height = height + "px";
    // }

    initWithLayer(layer, options?)
    {
        this.layer = layer;
        this.layerOptions = options;
    }

    setParent(view)
    {
        this.willChangeValue("parent");
        this.parent = view;
        this.didChangeValue("parent");
    }

    addSubLayersFromLayer(layer)
    {
        this.layer.innerHTML = layer.innerHTML;
    }

    addSubview(view)
    {
        view.setParent(this);
        this.subviews.push(view);

        view._addLayerToDOM();
    }

    protected _addLayerToDOM()
    {
        if (this._isLayerInDOM == true)
            return;

        if (this.layer == null || this.parent == null)
            return;

        this.parent.layer.appendChild(this.layer);

        this._isLayerInDOM = true;
    }

    removeFromSuperview()
    {
        this.parent._removeView(this);
        this._isLayerInDOM = false;
    }

    _removeLayerFromDOM()
    {
        if (this._isLayerInDOM == false)
            return;

        this.layer.removeChild(this.layer);
        this._isLayerInDOM = false;
    }

    _linkViewToSubview(view)
    {
        this.subviews.push(view);
    }

    private _removeView(view)
    {
        var index = this.subviews.indexOf(view);
        this.subviews.splice(index, 1);

        this.layer.removeChild(view.layer);
    }

    private _removeAllSubviews() {

        var node = this.layer;

        while (this.layer.hasChildNodes()) {              // selected elem has children

            if (node.hasChildNodes()) {                // current node has children
                node = node.lastChild;                 // set current node to child
            }
            else {                                     // last child found
                node = node.parentNode;                // set node to parent
                node.removeChild(node.lastChild);      // remove last node
            }
        }
    }

    layout()
    {
        if (this.hidden == true)
            return;

        for(var index = 0; index < this.subviews.length; index++)
        {
            var v = this.subviews[index];
            if (!(v instanceof MIOView))
            {
                console.log("ERROR Laying out not a view");
            }
            else
                v.layout();
        }
    }


    layerWithItemID(itemID)
    {
        return MIOLayerSearchElementByID(this.layer, itemID);
    }

    setHidden(hidden)
    {
        this.hidden = hidden;

        if (this.layer == null)
            return;

        if (hidden)
            this.layer.style.display = "none";
        else
            this.layer.style.display = "inline";

    }

    setBackgroundColor(color)
    {
        this.layer.style.backgroundColor = "#" + color;
    }

    setBackgroundRGBColor(r, g, b, a?)
    {
        if (a == null)
        {
            var value = "rgb(" + r + ", " + g + ", " + b + ")";
            this.layer.style.backgroundColor = value;
        }
        else
        {
            var value = "rgba(" + r + ", " + g + ", " + b + ", " + a +")";
            this.layer.style.backgroundColor = value;
        }
    }

    getBackgroundColor()
    {
        var cs = document.defaultView.getComputedStyle(this.layer, null);
        var bg = cs.getPropertyValue('background-color');

        return bg;
    }

    setAlpha(alpha, animate?, duration?)
    {
        if (animate == true || duration > 0)
        {
            this.layer.style.transition = "opacity " + duration + "s";
        }

        this.alpha = alpha;
        this.layer.style.opacity = alpha;
    }

    setX(x, animate?, duration?)
    {
        if (animate == true || duration > 0)
        {
            this.layer.style.transition = "left " + duration + "s";
        }

        this.layer.style.left = x + "px";
    }

    getX()
    {
        var x = this.layer.clientX;
        return x;
    }

    setY(y)
    {
        this.layer.style.top = y + "px";
    }

    getY()
    {
        var y = this.layer.clientY;
        return y;
    }

    setWidth(w)
    {
        this.layer.style.width = w + "px";
    }

    getWidth()
    {
        var w = this.layer.clientWidth;
        return w;
    }

    setHeight(h)
    {
        this.willChangeValue("height");
        this.layer.style.height = h + "px";
        this.didChangeValue("height");
    }

    getHeight()
    {
        var h = this.layer.clientHeight;
        return h;
    }

    setFrameComponents(x, y, w, h)
    {
        this.setX(x);
        this.setY(y);
        this.setWidth(w);
        this.setHeight(h);
    }

    setFrame(frame)
    {
        this.setFrameComponents(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
    }
}

