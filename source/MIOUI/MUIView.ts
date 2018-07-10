import { MIOObject, MIORect, MIOLocale, MIOLog } from "../MIOFoundation";
import { MUIWindow } from "./MUIWindow";
import { MUICoreLayerIDFromObject, MUICoreLayerCreate, MUICoreLayerAddStyle } from "./MIOUI_CoreLayer";
import { MIOClassFromString } from "../MIOCorePlatform";
import { MUIGestureRecognizer, MUIEvent, MUIGestureRecognizerState } from ".";

/**
 * Created by godshadow on 11/3/16.
 */



export function MUILayerSearchElementByID(layer, elementID)
{
    if (layer.tagName != "DIV" && layer.tagName != "INPUT" && layer.tagName != "SECTION")
            return null;

    if (layer.getAttribute("data-outlet") == elementID)
        return layer;
    
    // Deprecated. For old code we still mantein
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

export function MUILayerGetFirstElementWithTag(layer, tag)
{
    let foundLayer = null;

    if (layer.childNodes.length > 0) {
        var index = 0;
        foundLayer = layer.childNodes[index];
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

function MIOViewSearchViewTag(view, tag){
    if (view.tag == tag) return view;

    for (let index = 0; index < view.subviews.length; index++){
        let v:MUIView = view.subviews[index];
        v = MIOViewSearchViewTag(v, tag);
        if (v != null) return v;        
    }

    return null;
}


export class MUIView extends MIOObject
{
    layerID = null;
    layer = null;
    layerOptions = null;    
    hidden = false;
    alpha = 1;
    tag:number = 0;

    private _parent:MUIView = null;
    set parent(view){this.setParent(view);}
    get parent():MUIView {return this._parent;}


    protected _viewIsVisible = false;
    protected _needDisplay = true;
    _isLayerInDOM = false;

    protected _subviews = [];
    get subviews(){
        return this._subviews;
    }

    _window:MUIWindow = null;

    _outlets = {};

    constructor(layerID?){
        super();
        this.layerID = layerID ? layerID : MUICoreLayerIDFromObject(this);
    }

    protected ui_core_init_layers(){        
    }

    init(){
        this.layer = MUICoreLayerCreate(this.layerID);        
        //MUICoreLayerAddStyle(this.layer, "view");
        //MUICoreLayerAddStyle(this.layer, "view");
        //this.layer.style.position = "absolute";
        // this.layer.style.top = "0px";
        // this.layer.style.left = "0px";
        //this.layer.style.width = "100%";
        //this.layer.style.height = "100%";
        //this.layer.style.background = "rgb(255, 255, 255)";        
        this.ui_core_init_layers();
    }

    initWithFrame(frame:MIORect){
        this.layer = MUICoreLayerCreate(this.layerID);
        this.layer.style.position = "absolute";
        this.setX(frame.origin.x);
        this.setY(frame.origin.y);
        this.setWidth(frame.size.width);
        this.setHeight(frame.size.height);
        this.ui_core_init_layers();
    }

    initWithLayer(layer, owner, options?){
        this.layer = layer;
        this.layerOptions = options;
        
        let layerID = this.layer.getAttribute("id");
        if (layerID != null) this.layerID = layerID;

        let tag = this.layer.getAttribute("data-tag");
        this.tag = tag || 0;

        this._addLayerToDOM();

        // Add subviews
        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var subLayer = this.layer.childNodes[index];

                if (subLayer.tagName != "DIV")
                    continue;

                let sv:MUIView = new MUIView();
                sv.initWithLayer(subLayer, this); 
                this._linkViewToSubview(sv);            
            }
        }

        this.ui_core_init_layers();
    }

    copy() {
        let objLayer = this.layer.cloneNode(true);
        
        let className = this.getClassName();
        MIOLog("MUIView:copy:Copying class name " + className);
        if (className == null) throw Error("MUIView:copy: Error classname is null");
        
        let view = MIOClassFromString(className);
        view.initWithLayer(objLayer, null);        

        return view;
    }

    awakeFromHTML(){}

    setParent(view:MUIView){
        this.willChangeValue("parent");
        this._parent = view;
        this.didChangeValue("parent");
    }

    addSubLayer(layer){
        this.layer.innerHTML = layer.innerHTML;
    }

    _linkViewToSubview(view)
    {
        if ((view instanceof MUIView) == false) throw new Error("_linkViewToSubview: Trying to add an object that is not a view");
        
        this.subviews.push(view);
    }

    addSubview(view, index?)
    {
        if ((view instanceof MUIView) == false) throw new Error("addSubview: Trying to add an object that is not a view");

        view.setParent(this);

        if (index == null)
            this.subviews.push(view);
        else 
            this.subviews.splice(index, 0, view);

        view._addLayerToDOM(index);
        view.setNeedsDisplay();
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

    removeFromSuperview(){
        let subviews = this.parent._subviews;
        var index = subviews.indexOf(this);
        subviews.splice(index, 1);

        if (this._isLayerInDOM == false) return;

        this.parent.layer.removeChild(this.layer);
        this._isLayerInDOM = false;
    }

    protected _removeLayerFromDOM(){
        if (this._isLayerInDOM == false)
            return;

        this.layer.removeChild(this.layer);
        this._isLayerInDOM = false;
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

    viewWithTag(tag):MUIView{
        // TODO: Use also the view tag component
        let view = MIOViewSearchViewTag(this, tag);
        return view;
    }

    layoutSubviews(){
                
        for(var index = 0; index < this.subviews.length; index++)
        {
            var v = this.subviews[index];
            if ((v instanceof MUIView) == false) throw new Error("layout: Trying to layout an object that is not a view");
            v.setNeedsDisplay();
        }
    }

    setNeedsDisplay(){
        this._needDisplay = true;

        if (this._viewIsVisible == false) return;
        if (this.hidden == true) return;
        
        this._needDisplay = false;
        this.layoutSubviews();

        for(var index = 0; index < this.subviews.length; index++){
            let v = this.subviews[index];
            if (!(v instanceof MUIView))
            {
                console.log("ERROR: trying to call setNeedsDisplay: in object that it's not a view");
            }
            else
                v.setNeedsDisplay();
        }        
    }

    layerWithItemID(itemID){
        return MUILayerSearchElementByID(this.layer, itemID);
    }

    setHidden(hidden){
        this.hidden = hidden;

        if (this.layer == null)
            return;

        if (hidden)
            this.layer.style.display = "none";
        else
            this.layer.style.display = "";

    }

    setBackgroundColor(color){
        this.layer.style.backgroundColor = "#" + color;
    }

    setBackgroundRGBColor(r, g, b, a?){
        if (a == null)
        {
            let value = "rgb(" + r + ", " + g + ", " + b + ")";
            this.layer.style.backgroundColor = value;
        }
        else
        {
            let value = "rgba(" + r + ", " + g + ", " + b + ", " + a +")";
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
        if (isNaN(w)) w = 0;
        return w;
    }

    private _height = 0;
    setHeight(h){
        this.willChangeValue("height");
        this.layer.style.height = h + "px";
        this._height = h;
        this.didChangeValue("height");
    }

    getHeight(){
        let h = this._height;
        if (h == 0) h = this.layer.clientHeight;
        else {
            if (h == 0) h = this.layer.height;
            else if (h == 0) h = this._getIntValueFromCSSProperty("height");        
        }
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

    public get frame() {
        return MIORect.rectWithValues(this.getX(), this.getY(), this.getWidth(), this.getHeight());
    }

    public get bounds(){
        return MIORect.rectWithValues(0, 0, this.getWidth(), this.getHeight());
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
        var r = v.hasSuffix("px");
        if (r == true) v = v.substring(0, v.length - 2);
        else
        {
            var r2 = v.hasSuffix("%");
            if (r2 == true) v = v.substring(0, v.length - 1);
        }

        return parseInt(v);
    }

    private _userInteraction = false;
    set userInteraction(value){
        if (value == this._userInteraction) return;

        if (value == true){
            this.layer.view_instance = this;
            this.layer.addEventListener("mousedown", this.mouseDownEvent);
            this.layer.addEventListener("mouseup", this.mouseUpEvent);
        }
        else {
            this.layer.removeEventListener("mousedown", this.mouseDownEvent);
            this.layer.removeEventListener("mouseup", this.mouseUpEvent);            
        }
    }

    mouseDownEvent(ev){    
        let view = ev.currentTarget.view_instance;    
        view.touchesBeganWithEvent.call(view, null, null);
    }

    mouseUpEvent(ev){    
        let view = ev.currentTarget.view_instance;    
        view.touchesEndedWithEvent.call(view, null, null);
    }

    touchesBeganWithEvent(touches, ev:MUIEvent){
        for (let index = 0; index < this.gestureRecognizers.length; index++){
            let gr:MUIGestureRecognizer = this.gestureRecognizers[index];
            gr._viewTouchesBeganWithEvent(touches, ev);
        }
    }

    touchesMovedWithEvent(touches, ev:MUIEvent){
        for (let index = 0; index < this.gestureRecognizers.length; index++){
            let gr:MUIGestureRecognizer = this.gestureRecognizers[index];
            gr._viewTouchesMovedWithEvent(touches, ev);
        }
    }

    touchesEndedWithEvent(touches, ev:MUIEvent){
        for (let index = 0; index < this.gestureRecognizers.length; index++){
            let gr:MUIGestureRecognizer = this.gestureRecognizers[index];
            gr._viewTouchesEndedWithEvent(touches, ev);
        }
    }

    private gestureRecognizers = [];
    addGestureRecognizer(gesture:MUIGestureRecognizer){
        if (this.gestureRecognizers.containsObject(gesture)) return;
        
        gesture.view = this;
        this.gestureRecognizers.addObject(gesture);
        this.userInteraction = true;
    }

    removeGestureRecognizer(gesture:MUIGestureRecognizer){        
        gesture.view = null;
        this.gestureRecognizers.removeObject(gesture);
    }
}

