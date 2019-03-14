import { MIOObject, MIOSize, MIOBundle } from "../MIOFoundation";
import { MUIView, MUILayerSearchElementByID } from "./MUIView";
import { MUINavigationItem, MUINavItemSearchInLayer } from "./MUINavigationItem";
import { MUINavigationController } from "./MUINavigationController";
import { MUIPresentationController, MUIModalPresentationStyle, MUIModalTransitionStyle } from "./MUIViewController_PresentationController";
import { MUIPopoverPresentationController } from "./MUIViewController_PopoverPresentationController";
import { MUICoreLayerIDFromObject, MUICoreLayerAddStyle } from "./MIOUI_CoreLayer";
import { _MIUShowViewController, _MUIHideViewController } from "./MIOUI_Core";
import { MUIWindow } from "./MUIWindow";
import { MIOLocalizeString } from "../MIOCore";
import { MUISplitViewController } from "./MUISplitViewController";
import { MIOCoreIsPhone } from "../MIOCore/platform";

/**
 * Created by godshadow on 11/3/16.
 */

export class MUIViewController extends MIOObject
{
    layerID:string = null;

    view:MUIView = null;

    private _htmlResourcePath = null;

    private _onViewLoadedTarget = null;
    private _onViewLoadedAction = null;

    private _onLoadLayerTarget = null;
    private _onLoadLayerAction = null;

    private _viewIsLoaded = false;
    private _layerIsReady = false;

    private _childViewControllers = [];
    parentViewController:MUIViewController = null;

    presentingViewController:MUIViewController = null;
    presentedViewController:MUIView = null;
    navigationController:MUINavigationController = null;
    navigationItem:MUINavigationItem = null;
    splitViewController:MUISplitViewController = null;
    tabBarController = null;

    modalPresentationStyle = MIOCoreIsPhone() == true ? MUIModalPresentationStyle.FullScreen : MUIModalPresentationStyle.PageSheet;
    modalTransitionStyle = MUIModalTransitionStyle.CoverVertical;
    transitioningDelegate = null;

    protected _contentSize = new MIOSize(320, 200);
    protected _preferredContentSize = null;

    _outlets = {};

    constructor(layerID?){
        super();
        this.layerID = layerID ? layerID : MUICoreLayerIDFromObject(this);
    }

    init(){
        super.init();        
        this.loadView();        
    }

    initWithLayer(layer, owner, options?){
        super.init();

        this.view = new MUIView(this.layerID);
        this.view.initWithLayer(layer, owner, options);
        
        // Search for navigation item
        this.navigationItem = MUINavItemSearchInLayer(layer);
        
        this.loadView();        
    }

    initWithResource(path){
        if (path == null) throw new Error("MIOViewController:initWithResource can't be null");

        super.init();        

        this._htmlResourcePath = path;
        this.loadView();
    }

    localizeSubLayers(layers){
        if (layers.length == 0)
            return;

        for (let index = 0; index < layers.length; index++){
            let layer = layers[index];

            if (layer.tagName != "DIV") continue;

            var key = layer.getAttribute("data-localize-key");
            if (key != null)
                layer.innerHTML = MIOLocalizeString(key, key);

            this.localizeSubLayers(layer.childNodes);
        }
    }

    localizeLayerIDWithKey(layerID, key){
        let layer = MUILayerSearchElementByID(this.view.layer, layerID);
        layer.innerHTML = MIOLocalizeString(key, key);
    }

    loadView(){
        if (this.view != null) {
            this._didLoadView();
            return;
        }

        this.view = new MUIView(this.layerID);
        
        if (this._htmlResourcePath == null) {
            this.view.init();            
            MUICoreLayerAddStyle(this.view.layer, "page");
            this._didLoadView();
            return;
        }
        
        let mainBundle = MIOBundle.mainBundle();
        mainBundle.loadHTMLNamed(this._htmlResourcePath, this.layerID, this, function (layer) {            
            
            // Search for navigation item
            this.navigationItem = MUINavItemSearchInLayer(layer);

            this.view.initWithLayer(layer);
            this.view.awakeFromHTML();
            this._didLoadView();
        });        
    }

    _didLoadView(){
        this._layerIsReady = true;        
        if (MIOCoreIsPhone() == true) MUICoreLayerAddStyle(this.view.layer, "phone");
        
        if (this._onLoadLayerTarget != null && this._onViewLoadedAction != null){
            this._onLoadLayerAction.call(this._onLoadLayerTarget);
            this._onLoadLayerTarget = null;
            this._onLoadLayerAction = null;
        }

        if (this._onViewLoadedAction != null && this._onViewLoadedTarget != null){
            this.viewDidLoad();
            this._loadChildControllers();
        }
    }

    protected _loadChildControllers(){
        let count = this._childViewControllers.length;

        if (count > 0)
            this._loadChildViewController(0, count);
        else
            this._setViewLoaded(true);
    }

    protected _loadChildViewController(index, max){
        if (index < max) {
            let vc = this._childViewControllers[index];
            vc.onLoadView(this, function () {

                let newIndex = index + 1;
                this._loadChildViewController(newIndex, max);
            });
        }
        else
        {
            this._setViewLoaded(true);
        }
    }

    protected _setViewLoaded(value){
        this.willChangeValue("viewLoaded");
        this._viewIsLoaded = value;
        this.didChangeValue("viewLoaded");

        if (value == true && this._onViewLoadedAction != null) {
            this._onViewLoadedAction.call(this._onViewLoadedTarget);
        }

        this._onViewLoadedTarget = null;
        this._onViewLoadedAction = null;
        this.view.setNeedsDisplay();
    }

    onLoadView(target, action){
        this._onViewLoadedTarget = target;
        this._onViewLoadedAction = action;

        if (this._viewIsLoaded == true) {
            action.call(target);
            //this.view.setNeedsDisplay();
        }
        else if (this._layerIsReady == true)
        {
            this.viewDidLoad();            
            this._loadChildControllers();
            //this.view.setNeedsDisplay();
        }
    }

    onLoadLayer(target, action){
        if (this._layerIsReady == true)
        {
            action.call(target);
        }
        else
        {
            this._onLoadLayerTarget = action;
            this._onLoadLayerAction= target;
        }
    }

    get viewIsLoaded()
    {
        return this._viewIsLoaded;
    }

    get childViewControllers()
    {
        return this._childViewControllers;
    }

    addChildViewController(vc)
    {
        vc.parentViewController = this;
        this._childViewControllers.push(vc);
        //vc.willMoveToParentViewController(this);
    }

    removeChildViewController(vc)
    {
        var index = this._childViewControllers.indexOf(vc);
        if (index != -1) {
            this._childViewControllers.splice(index, 1);
            vc.parentViewController = null;
        }
    }

    // removeFromParentViewController()
    // {
    //     this.parent.removeChildViewController(this);
    //     this.parent = null;
    //     this.view.removeFromSuperview();
    //     //this.didMoveToParentViewController(null);
    // }

    private _presentationController:MUIPresentationController = null;
    get isPresented(){
        if (this._presentationController != null)
            return this._presentationController._isPresented;
    }

    get presentationController():MUIPresentationController {
        // if (this._presentationController == null && this.parentViewController != null)
        //     return this.parentViewController.presentationController;

        return this._presentationController;
    }       
    
    private _popoverPresentationController:MUIPopoverPresentationController = null;
    get popoverPresentationController():MUIPopoverPresentationController{
        if (this._popoverPresentationController == null){
            this._popoverPresentationController = new MUIPopoverPresentationController();
            this._popoverPresentationController.init();
            this._popoverPresentationController.presentedViewController = this;
            this._presentationController = this._popoverPresentationController;
        }        
        
        return this._popoverPresentationController;
    }

    showViewController(vc, animated){
        vc.onLoadView(this, function () {

            this.view.addSubview(vc.view);
            this.addChildViewController(vc);

            _MIUShowViewController(this, vc, this, animated);
        });
    }

    presentViewController(vc:MUIViewController, animated:boolean){           
        
        let pc = vc.presentationController as MUIPresentationController;
        if (pc == null) {
            pc = new MUIPresentationController();
            pc.init();
            pc.presentedViewController = vc;
            pc.presentingViewController = this;
            vc._presentationController = pc;
        }
        
        if (pc.presentingViewController == null) {
            pc.presentingViewController = this;
        }
        
        if (pc._isPresented == true){
            throw new Error("You try to present a view controller that is already presented"); 
        }
        
        // if (vc.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext){            
        //     vc.modalPresentationStyle = MIOCoreIsPhone() == true ? MUIModalPresentationStyle.FullScreen : MUIModalPresentationStyle.PageSheet;
        // }
        
        // if (vc.modalPresentationStyle != MUIModalPresentationStyle.FullScreen 
        //     && vc.modalPresentationStyle != MUIModalPresentationStyle.FormSheet
        //     && vc.modalPresentationStyle != MUIModalPresentationStyle.PageSheet
        //     && vc.modalPresentationStyle != MUIModalPresentationStyle.Popover
        //     && vc.modalPresentationStyle != MUIModalPresentationStyle.Custom)
        //     vc.modalPresentationStyle = MUIModalPresentationStyle.PageSheet;

        vc.onLoadView(this, function () {

            if (vc.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext){
                this.view.addSubview(vc.presentationController.presentedView);
                this.addChildViewController(vc);
                _MIUShowViewController(this, vc, null, animated, this, function () {
                });    
            }
            else{
                // It's a window instead of a view
                let w:MUIWindow = pc.window;
                if (w == null)
                {
                    w = new MUIWindow();
                    w.init();
                    w.layer.style.background = "";
                    w.rootViewController = vc;
                    w.addSubview(pc.presentedView);
                    pc.window = w;                                        
                }
                w.setHidden(false);

                _MIUShowViewController(this, vc, null, animated, this, function () {
                    w.makeKey();
                });    
            }
        });
    }

    dismissViewController(animate){
        let pc = this._presentationController;
        let vc = this as MUIViewController;
        while(pc == null) {
            vc = vc.parentViewController;
            pc = vc._presentationController;
        }
        let toVC = pc.presentingViewController;
        let fromVC = pc.presentedViewController;
        let fromView = pc.presentedView;

        _MUIHideViewController(fromVC, toVC, null, this, function () {

            if (fromVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext){
                toVC.removeChildViewController(fromVC);
                let pc1 = fromVC.presentationController;
                let view = pc1.presentedView;
                view.removeFromSuperview();
            }
            else{
                // It's a window instead of a view
                let pc1 = fromVC.presentationController;
                let w = pc1.window as MUIWindow;
                w.setHidden(true);
            }
        });
    }
 
    transitionFromViewControllerToViewController(fromVC, toVC, duration, animationType, target?, completion?)
    {
        //TODO
    }

    viewDidLoad(){}

    viewWillAppear(animated?)
    {
        for (var index = 0; index < this._childViewControllers.length; index++)
        {
            var vc = this._childViewControllers[index];
            vc.viewWillAppear(animated);
        }
        
        this.view.setViewIsVisible(true);
    }

    viewDidAppear(animated?)
    {
        //this.view.setNeedsDisplay();
        
        for (var index = 0; index < this._childViewControllers.length; index++)
        {
            var vc = this._childViewControllers[index];
            vc.viewDidAppear(animated);
        }
    }

    viewWillDisappear(animated?)
    {
        for (var index = 0; index < this._childViewControllers.length; index++)
        {
            var vc = this._childViewControllers[index];
            vc.viewWillDisappear(animated);
        }
        
        this.view.setViewIsVisible(false);
    }

    viewDidDisappear(animated?)
    {
        for (var index = 0; index < this._childViewControllers.length; index++)
        {
            var vc = this._childViewControllers[index];
            vc.viewDidDisappear(animated);
        }
    }

    contentHeight()
    {
        return this.view.getHeight();
    }

    setContentSize(size)
    {
        this.willChangeValue("contentSize");
        this._contentSize = size;
        this.didChangeValue("contentSize");
    }

    public set contentSize(size)
    {
        this.setContentSize(size);
    }

    public get contentSize()
    {
        return this._contentSize;
    }

    public set preferredContentSize(size){
        this.setPreferredContentSize(size);
    }

    public get preferredContentSize(){
        return this._preferredContentSize;
    }

    setPreferredContentSize(size){
        this.willChangeValue("preferredContentSize");
        this._preferredContentSize = size;
        this.didChangeValue("preferredContentSize");
    }
}

