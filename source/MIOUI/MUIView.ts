/**
 * Created by godshadow on 11/3/16.
 */

/// <reference path="../MIOFoundation/MIOFoundation.ts" />

function MUILayerSearchElementByID(layer, elementID)
{
    if (layer.tagName != "DIV" && layer.tagName != "INPUT")
            return null;

    if (layer.getAttribute("id") == elementID)
        return layer;

    var elementFound = null;

    for (var count = 0; count < layer.childNodes.length; count++)
    {
        var l = layer.childNodes[count];
        elementFound = MUILayerSearchElementByID(l, elementID);
        if (elementFound != null)
            return elementFound;

    }

    return null;
}

function MUILayerGetFirstElementWithTag(layer, tag)
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

class MUIView extends MIOObject
{
    layerID = null;
    layer = null;
    layerOptions = null;
    subviews = [];
    hidden = false;
    alpha = 1;
    parent = null;
    tag = null;

    protected _viewIsVisible = false;
    protected _needDisplay = true;
    _isLayerInDOM = false;

    _window:MUIWindow = null;

    _outlets = {};

    constructor(layerID?)
    {
        super();
        this.layerID = layerID ? layerID : MUICoreLayerIDFromObject(this);
    }

    init()
    {
        this.layer = MUICoreLayerCreate(this.layerID);
        this.layer.style.position = "absolute";
        this.layer.style.top = "0px";
        this.layer.style.left = "0px";
        this.layer.style.width = "100%";
        this.layer.style.height = "100%";
        //this.layer.style.background = "rgb(255, 255, 255)";
    }

    initWithFrame(frame)
    {
        this.layer = MUICoreLayerCreate(this.layerID);
        this.layer.style.position = "absolute";
        this.layer.style.left = frame.origin.x + "px";
        this.layer.style.top = frame.origin.y + "px";
        this.layer.style.width = frame.size.width + "px";
        this.layer.style.height = frame.size.height + "px";
    }

    initWithLayer(layer, owner, options?)
    {
        this.layer = layer;
        this.layerOptions = options;
        var layerID = this.layer.getAttribute("id");
        if (layerID != null) this.layerID = layerID;

        this._addLayerToDOM();
    }

    awakeFromHTML(){}

    setParent(view)
    {
        this.willChangeValue("parent");
        this.parent = view;
        this.didChangeValue("parent");
    }

    addSubLayer(layer)
    {
        this.layer.innerHTML = layer.innerHTML;
    }

    _linkViewToSubview(view)
    {
        if ((view instanceof MUIView) == false) throw ("_linkViewToSubview: Trying to add an object that is not a view");
        
        this.subviews.push(view);
    }

    addSubview(view, index?)
    {
        if ((view instanceof MUIView) == false) throw ("addSubview: Trying to add an object that is not a view");

        view.setParent(this);

        if (index == null)
            this.subviews.push(view);
        else 
            this.subviews.splice(index, 0, view);

        view._addLayerToDOM(index);
    }

    protected _addLayerToDOM(index?)
    {
        if (this._isLayerInDOM == true)
            return;

        if (this.layer == null || this.parent == null)
            return;

        if (index == null)
            this.parent.layer.appendChild(this.layer);
        else
            this.parent.layer.insertBefore(this.layer, this.parent.layer.children[0])

        this._isLayerInDOM = true;
    }

    removeFromSuperview()
    {
        this.parent._removeView(this);
        this._isLayerInDOM = false;
    }

    protected _removeLayerFromDOM()
    {
        if (this._isLayerInDOM == false)
            return;

        this.layer.removeChild(this.layer);
        this._isLayerInDOM = false;
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

    setViewIsVisible(value:boolean){

        this._viewIsVisible = true;
        for(var index = 0; index < this.subviews.length; index++){
            var v = this.subviews[index];
            v.setViewIsVisible(value);
        }
    }

    layout()
    {
        if (this._viewIsVisible == false) return;
        if (this.hidden == true) return;
        if (this._needDisplay == false) return;
        this._needDisplay = false;
        
        for(var index = 0; index < this.subviews.length; index++)
        {
            var v = this.subviews[index];
            if ((v instanceof MUIView) == false) throw ("layout: Trying to layout an object that is not a view");
            v.layout();
        }
    }

    setNeedsDisplay(){

        this._needDisplay = true;
        this.layout();

        for(var index = 0; index < this.subviews.length; index++)
        {
            var v = this.subviews[index];
            if (!(v instanceof MUIView))
            {
                console.log("ERROR: trying to call setNeedsDisplay: in object that it's not a view");
            }
            else
                v.setNeedsDisplay();
        }        
    }

    layerWithItemID(itemID)
    {
        return MUILayerSearchElementByID(this.layer, itemID);
    }

    setHidden(hidden)
    {
        this.hidden = hidden;

        if (this.layer == null)
            return;

        if (hidden)
            this.layer.style.display = "none";
        else
            this.layer.style.display = "";

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
        //var x = this.layer.clientX;
        var x = this._getIntValueFromCSSProperty("left");
        return x;
    }

    setY(y)
    {
        this.layer.style.top = y + "px";
    }

    getY()
    {
        //var y = this.layer.clientY;
        var y = this._getIntValueFromCSSProperty("top");
        return y;
    }

    setWidth(w)
    {
        this.layer.style.width = w + "px";
    }

    getWidth()
    {        
        var w1 = this.layer.clientWidth;
        var w2 = this._getIntValueFromCSSProperty("width");
        var w = Math.max(w1, w2);
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
        var h1 = this.layer.clientHeight;
        var h2 = this._getIntValueFromCSSProperty("height");
        var h = Math.max(h1, h2);
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
        this.willChangeValue("frame");
        this.setFrameComponents(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
        this.didChangeValue("frame");
    }

    public get frame()
    {
        return MIOFrame.frameWithRect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
    }

    //
    // CSS Subsystem
    //

    protected _getValueFromCSSProperty(property)
    {
        var v = window.getComputedStyle(this.layer, null).getPropertyValue(property);
        return v;
    }

    protected _getIntValueFromCSSProperty(property)
    {
        var v = this._getValueFromCSSProperty(property);
        var r = MIOStringHasSuffix(v, "px");
        if (r == true) v = v.substring(0, v.length - 2);
        else
        {
            var r2 = MIOStringHasSuffix(v, "%");
            if (r2 == true) v = v.substring(0, v.length - 1);
        }

        return parseInt(v);
    }

}

