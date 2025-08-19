import { MIOObject, MIORect, MIOLocale, MIOLog } from "../MIOFoundation";
import { MUIWindow } from "./MUIWindow";
import { MUICoreLayerIDFromObject, MUICoreLayerCreate, MUICoreLayerAddStyle } from "./MIOUI_CoreLayer";
import { MIOClassFromString } from "../MIOCore/platform/Web";
import { MUIGestureRecognizer, MUIEvent, MUIGestureRecognizerState } from ".";
// Import array extensions for addObject, removeObject, etc.
import "../MIOCore";

/**
 * Created by godshadow on 11/3/16.
 */


const g_supported_tags = { "DIV"    : true
                         , "INPUT"  : true
                         , "SECTION": true
                         , "SPAN"   : true
                         , "BUTTON" : true 
                         , "LABEL"  : true 
                         , "FORM"   : true
                         , "MAIN"   : true
                         , "HEADER" : true
                         , "NAV"    : true
                         , "OL"     : true
                         , "LI"     : true
                         , "FOOTER" : true
                         }

export function is_supported_tag ( tagName: string )
{
  return g_supported_tags[ tagName ] === true ;
}

export function MUILayerSearchElementByAttribute(layer, key)
{
    if ( !is_supported_tag( layer.tagName ) )
         return null;

    if (layer.getAttribute(key) == "true") return layer;
    
    let elementFound = null;

    for (let count = 0; count < layer.childNodes.length; count++){
        let l = layer.childNodes[count];
        elementFound = MUILayerSearchElementByAttribute(l, key);
        if (elementFound != null) return elementFound;
    }

    return null;
}



export function MUILayerSearchElementByID(layer, elementID)
{
    if ( !is_supported_tag( layer.tagName ) )
         return null;

    if (layer.getAttribute("data-outlet") == elementID)
        return layer;
    
    // Deprecated. For old code we still mantein
    if (layer.getAttribute("id") == elementID)
        return layer;

    let elementFound = null;

    for (let count = 0; count < layer.childNodes.length; count++){
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
        //this.addLayerBeforeLayer(view.layer, siblingSubview.layer);
        
        this.layer.insertBefore(view.layer, siblingSubview.layer);
        view._isLayerInDOM = true;

        view.setNeedsDisplay();
    }

    // private addLayerBeforeLayer(newLayer, layer){
    //     if (newLayer._isLayerInDOM == true) return;
    //     if (layer == null || newLayer == null) return;
    //     this.layer.insertBefore(newLayer, layer);
    //     newLayer._isLayerInDOM = true;
    // }

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
                
        for(let index = 0; index < this.subviews.length; index++)
        {
            const v = this.subviews[index];
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
        //ev.preventDefault(); // Prevent selection
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
            //if (gr.delaysTouchesBegan == true) continue;
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

        // Group animations by view to handle multiple properties per view
        let viewAnimations = {};

        for (let index = 0; index < MUIView.animationsChanges.length; index++){
            let anim = MUIView.animationsChanges[index];
            let view = anim["View"];
            let key = anim["Key"];
            let value = anim["EndValue"];

            if (!viewAnimations[view.layerID]) {
                viewAnimations[view.layerID] = {
                    view: view,
                    properties: [],
                    values: {}
                };
            }

            viewAnimations[view.layerID].properties.push(key);
            viewAnimations[view.layerID].values[key] = value;
        }

        // Apply animations to each view
        for (let viewID in viewAnimations) {
            let viewAnim = viewAnimations[viewID];
            let view = viewAnim.view;

            console.log("Setting up animation for view:", view.layerID);
            console.log("Properties to animate:", viewAnim.properties);
            console.log("Values:", viewAnim.values);

            // Set up transition for all properties at once
            let transitionProperties = viewAnim.properties.join(", ");
            let transitionCSS = transitionProperties + " " + duration + "s";
            view.layer.style.transition = transitionCSS;

            console.log("Applied transition CSS:", transitionCSS);

            // Add tracking before applying changes
            MUIView.addTrackingAnimationView(view);

            // Use requestAnimationFrame to ensure proper timing
            requestAnimationFrame(() => {
                console.log("Applying changes in next animation frame");

                // Apply all property changes in the next frame
                for (let prop of viewAnim.properties) {
                    let value = viewAnim.values[prop];

                    // Check current value before applying
                    let currentValue = getComputedStyle(view.layer)[prop];
                    console.log("Property:", prop, "current:", currentValue, "→ new:", value);

                    // Check if there's actually a change
                    if (currentValue === value) {
                        console.warn("No change detected for", prop, "- transition may not fire");
                    }

                    switch(prop){
                        case "opacity":
                            view.layer.style.opacity = value;
                            break;
                        case "left":
                        case "x":
                            view.layer.style.left = value;
                            break;
                        case "top":
                        case "y":
                            view.layer.style.top = value;
                            break;
                        case "width":
                            view.layer.style.width = value;
                            break;
                        case "height":
                            view.layer.style.height = value;
                            break;
                        default:
                            console.warn("Unknown animation property:", prop);
                            break;
                    }

                    // Verify the change was applied
                    let newComputedValue = getComputedStyle(view.layer)[prop];
                    console.log("After applying:", prop, "computed value:", newComputedValue);
                }

                console.log("Final computed style transition:", getComputedStyle(view.layer).transition);
            });
        }

        MUIView.animationsChanges = null;

        // Fallback timeout in case transition events don't fire
        if (MUIView.animationsViews && MUIView.animationsViews.length > 0) {
            console.log("Setting up fallback timeout for", duration * 1000 + 100, "ms");
            setTimeout(() => {
                if (MUIView.animationsViews && MUIView.animationsViews.length > 0) {
                    console.warn("Animation events didn't fire, using fallback completion");
                    // Force completion
                    MUIView.animationsViews = [];
                    if (MUIView.animationTarget != null && MUIView.animationCompletion != null) {
                        MUIView.animationCompletion.call(MUIView.animationTarget);
                    }
                    MUIView.animationTarget = null;
                    MUIView.animationCompletion = null;
                }
            }, duration * 1000 + 100); // Add 100ms buffer
        }
    }

    private static addTrackingAnimationView(view:MUIView){
        // let index = MUIView.animationsViews.indexOf(view);
        // if (index > -1) return;
        console.log("Adding animation tracking for view:", view.layerID);
        MUIView.animationsViews.addObject(view);
        view.layer.animationParams = {"View" : view};

        // Listen for multiple transition end events for cross-browser compatibility
        view.layer.addEventListener("transitionend", MUIView.animationDidFinish);
        view.layer.addEventListener("webkitTransitionEnd", MUIView.animationDidFinish);
        view.layer.addEventListener("oTransitionEnd", MUIView.animationDidFinish);
        view.layer.addEventListener("MSTransitionEnd", MUIView.animationDidFinish);

        // Add a test listener to see if ANY transition events fire
        const testListener = (e) => {
            console.log("🔥 TRANSITION EVENT DETECTED:", e.type, "property:", e.propertyName, "target:", e.target);
        };
        view.layer.addEventListener("transitionstart", testListener);
        view.layer.addEventListener("transitionrun", testListener);
        view.layer.addEventListener("transitionend", testListener);
        view.layer.addEventListener("webkitTransitionEnd", testListener);

        console.log("Event listeners added for view:", view.layerID);
    }

    private static removeTrackingAnimationView(view:MUIView){
        // let index = MUIView.animationsViews.indexOf(view);
        // if (index == -1) return;
        MUIView.animationsViews.removeObject(view);

        // Remove all transition end event listeners for cross-browser compatibility
        view.layer.removeEventListener("transitionend", MUIView.animationDidFinish);
        view.layer.removeEventListener("webkitTransitionEnd", MUIView.animationDidFinish);
        view.layer.removeEventListener("oTransitionEnd", MUIView.animationDidFinish);
        view.layer.removeEventListener("MSTransitionEnd", MUIView.animationDidFinish);

        // Reset animation flags and timeout
        if (view.layer.animationParams) {
            if (view.layer.animationTimeout) {
                clearTimeout(view.layer.animationTimeout);
                delete view.layer.animationTimeout;
            }
            delete view.layer.animationHandled;
            delete view.layer.animationParams;
        }

        view.layer.style.transition = "none";
        view.setNeedsDisplay();
    }

    private static animationDidFinish(event){
        console.log("Animation event fired:", event.type, event.propertyName);

        // Prevent multiple calls for the same transition from different event types
        if (!event.target || !event.target.animationParams) {
            console.log("No animation params found");
            return;
        }

        let view = event.target.animationParams["View"];
        if (!view) {
            console.log("No view found in animation params");
            return;
        }

        console.log("Animation finished for view:", view.layerID, "property:", event.propertyName);

        // For multiple properties transitioning, we only want to handle this once
        // Use a timeout to ensure all transition events have fired
        if (event.target.animationTimeout) {
            clearTimeout(event.target.animationTimeout);
        }

        event.target.animationTimeout = setTimeout(() => {
            console.log("Processing animation completion for view:", view.layerID);

            // Check if this view is still being tracked (use containsObject instead of indexOfObject)
            if (!MUIView.animationsViews || !MUIView.animationsViews.containsObject(view)) {
                console.log("View no longer tracked");
                return;
            }

            MUIView.removeTrackingAnimationView(view);
            console.log("Remaining animated views:", MUIView.animationsViews ? MUIView.animationsViews.length : 0);

            if (MUIView.animationsViews && MUIView.animationsViews.length > 0) return;

            // All animations finished, call completion
            console.log("All animations finished, calling completion");
            MUIView.animationsChanges = null;
            MUIView.animationsViews = null;
            if (MUIView.animationTarget != null && MUIView.animationCompletion != null) {
                MUIView.animationCompletion.call(MUIView.animationTarget);
            }
            MUIView.animationTarget = null;
            MUIView.animationCompletion = null;
        }, 10); // Small delay to collect all transition events
    }

}


