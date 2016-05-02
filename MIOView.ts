/**
 * Created by godshadow on 11/3/16.
 */

    /// <reference path="MIOCore.ts" />

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
    if (layer.tagName != "DIV")
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

    constructor(layerID?)
    {
        super();

        this.layerID = layerID;
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
    }

    initWithFrame(x, y, width, height)
    {
        this.layer = document.createElement("div");
        this.layer.style.position = "absolute";
        this.layer.setAttribute("id", this.layerID);
        this.layer.style.left = x + "px";
        this.layer.style.top = y + "px";
        this.layer.style.width = width + "px";
        this.layer.style.height = height + "px";
    }

    initWithLayer(layer, options?)
    {
        this.layer = layer;
        this.layerOptions = options;

        // Async loading / DOM model
        if (this.parent != null)
            this.parent.layer.appendChild(this.layer);

        // Set all properties when the layer is ready
        this.setHidden(this.hidden);
        this.setAlpha(this.alpha);
    }

    setParent(view)
    {
        this.willChangeValue("parent");
        this.parent = view;
        this.didChangeValue("parent");
    }

    layout()
    {
        for(var index = 0; index < this.subviews.length; index++)
        {
            var v = this.subviews[index];
            v.layout();
        }
    }

    addSubview(view)
    {
        view.setParent(this);
        this.subviews.push(view);

        if (view.layer != null)
            this.layer.appendChild(view.layer);

    }

    removeFromSuperview()
    {
        this.parent._removeView(this);
    }

    _linkViewToSubview(view)
    {
        this.subviews.push(view);
    }

    private _removeView(view)
    {
        var index = this.subviews.indexOf(view);
        this.subviews.slice(index, 1);
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

    layerWithItemID(itemID)
    {
        return MIOLayerSearchElementByID(this.layer, itemID);
    }

    setHidden(hidden)
    {
        if (hidden)
            this.layer.style.display = "none";
        else
            this.layer.style.display = "inline";

        this.hidden = hidden;
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

    setFrame(x, y, w, h)
    {
        this.setX(x);
        this.setY(y);
        this.setWidth(w);
        this.setHeight(h);
    }

}

