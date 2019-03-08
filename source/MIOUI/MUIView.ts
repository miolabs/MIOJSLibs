import { MIOObject, MIORect, MIOLocale, MIOLog } from "../MIOFoundation";
import { MUIWindow } from "./MUIWindow";
import { MUICoreLayerIDFromObject, MUICoreLayerCreate, MUICoreLayerAddStyle } from "./MIOUI_CoreLayer";
import { MIOClassFromString } from "../MIOCore/platform";
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

    let elementFound = null;

    for (let count = 0; count < layer.childNodes.length; count++)
    {
        let l = layer.childNodes[count];
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
        let index = 0;
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
    }

    initWithFrame(frame:MIORect){
        this.layer = MUICoreLayerCreate(this.layerID);
        this.layer.style.position = "absolute";
        this.setX(frame.origin.x);
        this.setY(frame.origin.y);
        this.setWidth(frame.size.width);
        this.setHeight(frame.size.height);
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
            for (let index = 0; index < this.layer.childNodes.length; index++) {
                let subLayer = this.layer.childNodes[index];

                if (subLayer.tagName != "DIV" && subLayer.tagName != "SECTION") continue;

                let className = subLayer.getAttribute("data-class");
                if (className == null || className.length == 0) className = "MUIView";
                
                let sv = MIOClassFromString(className);
                sv.initWithLayer(subLayer, this); 
                this._linkViewToSubview(sv);            
            }
        }

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

    insertSubviewAboveSubview(view:MUIView, siblingSubview:MUIView){
        view.setParent(this);
        let index = this.subviews.indexOf(siblingSubview);        
        this.subviews.splice(index, 0, view);
        this.addLayerBeforeLayer(view.layer, siblingSubview.layer);
        view.setNeedsDisplay();
    }

    private addLayerBeforeLayer(newLayer, layer){
        if (newLayer._isLayerInDOM == true) return;
        if (layer == null || newLayer == null) return;
        this.layer.insertBefore(newLayer, layer);
        newLayer._isLayerInDOM = true;
    }

    protected _addLayerToDOM(index?){
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
        if (this.parent == null) return;

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
            if (!(v instanceof MUIView)){
                console.log("ERROR: trying to call setNeedsDisplay: in object that it's not a view");
            }
            else
                v.setNeedsDisplay();
        }        
    }

    layerWithItemID(itemID){
        return MUILayerSearchElementByID(this.layer, itemID);
    }

    private _hidden:boolean = false;
    setHidden(hidden:boolean){
        this._hidden = hidden;

        if (this.layer == null)
            return;

        if (hidden)
            this.layer.style.display = "none";
        else
            this.layer.style.display = "";
    }

    get hidden():boolean{
        return this._hidden;
    }

    set hidden(value:boolean){
        this.setHidden(value);
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

    setAlpha(alpha){
        this.willChangeValue("alpha");
        this.alpha = alpha;
        this.didChangeValue("alpha");
        
        if (MUIView.animationsChanges != null) {
            let animation = {"View" : this, "Key" : "opacity", "EndValue": alpha};
            MUIView.animationsChanges.addObject(animation);
        }        
        else {            
            this.layer.style.opacity = alpha;
        }        
    }

    private x = 0;
    setX(x){
        this.willChangeValue("frame");
        this.x = x;
        this.didChangeValue("frame");

        if (MUIView.animationsChanges != null) {
            let animation = {"View" : this, "Key" : "left", "EndValue": x + "px"};
            MUIView.animationsChanges.addObject(animation);
        }        
        else {            
            this.layer.style.left = x + "px";
        }        
    }

    getX(){        
        let x = this._getIntValueFromCSSProperty("left");
        return x;
    }

    private y = 0;
    setY(y){
        this.willChangeValue("frame");
        this.y = y;
        this.didChangeValue("frame");

        if (MUIView.animationsChanges != null) {
            let animation = {"View" : this, "Key" : "top", "EndValue": y + "px"};
            MUIView.animationsChanges.addObject(animation);
        }        
        else {            
            this.layer.style.top = y + "px";
        }                
    }

    getY(){        
        let y = this._getIntValueFromCSSProperty("top");
        return y;
    }

    private width = 0;
    setWidth(w){
        this.willChangeValue("frame");
        this.width = w;
        this.didChangeValue("frame");

        if (MUIView.animationsChanges != null) {
            let animation = {"View" : this, "Key" : "width", "EndValue": w + "px"};
            MUIView.animationsChanges.addObject(animation);
        }        
        else {            
            this.layer.style.width = w + "px";
        }                        
    }

    getWidth(){        
        let w1 = this.layer.clientWidth;
        let w2 = this._getIntValueFromCSSProperty("width");
        let w = Math.max(w1, w2);
        if (isNaN(w)) w = 0;
        return w;
    }
    
    private height = 0;
    setHeight(height){
        this.willChangeValue("height");        
        this.height = height;
        this.didChangeValue("height");

        if (MUIView.animationsChanges != null) {
            let animation = {"View" : this, "Key" : "height", "EndValue": height + "px"};
            MUIView.animationsChanges.addObject(animation);
        }        
        else {            
            this.layer.style.height = height + "px";
        }        
    }
    
    getHeight(){
        let h = this.height;
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
    
    get frame() {        
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
            this.layer.addEventListener("mousedown", this.mouseDownEvent.bind(this));
            this.layer.addEventListener("mouseup", this.mouseUpEvent.bind(this));
        }
        else {
            this.layer.removeEventListener("mousedown", this.mouseDownEvent);
            this.layer.removeEventListener("mouseup", this.mouseUpEvent);             
        }
    }

    private isMouseDown = false;
    private mouseDownEvent(ev){   
        let e = MUIEvent.eventWithSysEvent(ev);                 
        this.touchesBeganWithEvent(null, e);
        this.isMouseDown = true;
        window.addEventListener("mousemove", this.mouseMoveEvent.bind(this));
        ev.preventDefault(); // Prevent selection
    }

    private mouseUpEvent(ev){   
        this.isMouseDown = false; 
        let e = MUIEvent.eventWithSysEvent(ev);                
        this.touchesEndedWithEvent(null, e);
    }

    private mouseMoveEvent(ev){   
        if (this.isMouseDown == false) return;
        if (ev.buttons == 0) {
            window.removeEventListener("mousemove", this.mouseMoveEvent);
            this.isMouseDown = false;
            let e = MUIEvent.eventWithSysEvent(ev);                
            this.touchesEndedWithEvent(null, e);    
        }
        else {
            let e = MUIEvent.eventWithSysEvent(ev);                    
            this.touchesMovedWithEvent(null, e);
        }
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

    //
    // Animations
    //

    private static animationsChanges = null;    
    private static animationsViews = null;
    private static animationTarget = null;
    private static animationCompletion = null;
    static animateWithDuration(duration:number, target, animations, completion?){
        MUIView.animationsChanges = [];
        MUIView.animationsViews = [];
        MUIView.animationTarget = target;
        MUIView.animationCompletion = completion;
        animations.call(target);                

        for (let index = 0; index < MUIView.animationsChanges.length; index++){
            let anim = MUIView.animationsChanges[index];
            let view = anim["View"];
            let key = anim["Key"];
            let value = anim["EndValue"];            
            
            view.layer.style.transition = key + " " + duration + "s";
            switch(key){
                case "opacity":
                view.layer.style.opacity = value;                
                break;

                case "x":
                view.layer.style.left = value;
                break;

                case "y":
                view.layer.style.top = value;
                break;

                case "width":
                view.layer.style.width = value;
                break;

                case "height":
                view.layer.style.height = value;
                break;
            }

            MUIView.addTrackingAnimationView(view);
        }   
        MUIView.animationsChanges = null;                             
    }

    private static addTrackingAnimationView(view:MUIView){
        let index = MUIView.animationsViews.indexOf(view);
        if (index > -1) return;
        MUIView.animationsViews.addObject(view);
        view.layer.animationParams = {"View" : view};
        view.layer.addEventListener("webkitTransitionEnd", MUIView.animationDidFinish);
    }

    private static removeTrackingAnimationView(view:MUIView){
        let index = MUIView.animationsViews.indexOf(view);
        if (index == -1) return;
        MUIView.animationsViews.removeObject(view);                
        view.layer.removeEventListener("webkitTransitionEnd", MUIView.animationDidFinish);            
        view.layer.style.transition = "none";
        view.setNeedsDisplay();
    }

    private static animationDidFinish(event){
        let view = event.target.animationParams["View"];
        MUIView.removeTrackingAnimationView(view);        
        if (MUIView.animationsViews.length > 0) return;
        MUIView.animationsChanges = null;
        MUIView.animationsViews = null;
        if (MUIView.animationTarget != null && MUIView.animationCompletion != null) MUIView.animationCompletion.call(MUIView.animationTarget);
        MUIView.animationTarget = null;
        MUIView.animationCompletion = null;
    }

}


