/**
 * Created by godshadow on 11/3/16.
 */

    /// <reference path="MIOObject.ts" />
    /// <reference path="MIOString.ts" />
    /// <reference path="MIOView.ts" />
    /// <reference path="MIOBundle.ts" />
    /// <reference path="MIOCoreTypes.ts" />
    /// <reference path="MIOViewController_Animation.ts" />
    /// <reference path="MIOViewController_PopoverPresentationController.ts" />


declare var MIOHTMLParser;

class MIOViewController extends MIOObject
{
    layerID = null;
    prefixID = null;

    view = null;
    parent = null;

    private _onViewLoadedTarget = null;
    private _onViewLoadedAction = null;

    private _onLoadLayerTarget = null;
    private _onLoadLayerAction = null;

    private _viewIsLoaded = false;
    private _layerIsReady = false;

    private _childViewControllers = [];
    navigationController = null;

    private _popoverPresentationController = null;

    presentationStyle = MIOPresentationStyle.CurrentContext;
    presentationType = MIOPresentationType.Modal;

    protected _contentSize = new MIOSize(320, 200);
    protected _preferredContentSize = new MIOSize(320, 200);

    constructor(layerID, prefixID?)
    {
        super();
        this.layerID = layerID;
        this.prefixID = prefixID;
    }

    init()
    {
        super.init();

        this.view = new MIOView(this.layerID);
        this.view.init();
        this._layerIsReady = true;
    }

    initWithLayer(layer, options?)
    {
        super.init();

        this.view = new MIOView(this.layerID);
        this.view.initWithLayer(layer, options);
        this._layerIsReady = true;
    }

    initWithView(view)
    {
        super.init();

        this.view = view;
        this._layerIsReady = true;
    }

    initWithResource(url)
    {
        super.init();

        this.view = new MIOView(this.layerID);
        this.view.init();

        var mainBundle = MIOBundle.mainBundle();
        mainBundle.loadLayoutFromURL(url, this.layerID, this, function (data) {

            //var result = MIOHTMLParser(data, this.layerID);
            var result = data;
            var cssFiles = result.styles;
            var baseURL = url.substring(0, url.lastIndexOf('/')) + "/";
            for (var index = 0; index < cssFiles.length; index++) {

                var cssurl  = baseURL + cssFiles[index];
                console.log("Adding CSS: " + cssurl);
                MIOCoreLoadStyle(cssurl);
            }

            var domParser = new DOMParser();
            var items = domParser.parseFromString(result.layout, "text/html");
            var layer = items.getElementById(this.layerID);

            this.localizeSubLayers(layer.childNodes);

            this.view.addSubLayer(layer);
            this.view.awakeFromHTML();
            this._didLayerDownloaded();
        });
    }

    localizeSubLayers(layers)
    {
        if (layers.length == 0)
            return;

        for (var index = 0; index < layers.length; index++)
        {
            var layer = layers[index];

            if (layer.tagName != "DIV") continue;

            var key = layer.getAttribute("data-localize-key");
            if (key != null)
                layer.innerHTML = MIOLocalizeString(key, key);

            this.localizeSubLayers(layer.childNodes);
        }
    }

    localizeLayerIDWithKey(layerID, key)
    {
        var layer = MIOLayerSearchElementByID(this.view.layer, layerID);
        layer.innerHTML = MIOLocalizeString(key, key);
    }

    loadView()
    {
        this.view.layer.style.overflow = "hidden";
    }

    _didLayerDownloaded()
    {
        this._layerIsReady = true;

        if (this._onLoadLayerTarget != null && this._onViewLoadedAction != null)
        {
            this._onLoadLayerAction.call(this._onLoadLayerTarget);
            this._onLoadLayerTarget = null;
            this._onLoadLayerAction = null;
        }

        if (this._onViewLoadedAction != null && this._onViewLoadedTarget != null)
        {
            this.loadView();
            this.viewDidLoad();
            this._loadChildControllers();
        }
    }

    protected _loadChildControllers()
    {
        var count = this._childViewControllers.length;

        if (count > 0)
            this._loadChildViewController(0, count);
        else
            this._setViewLoaded(true);
    }

    protected _loadChildViewController(index, max)
    {
        if (index < max) {
            var vc = this._childViewControllers[index];
            vc.onLoadView(this, function () {

                var newIndex = index + 1;
                this._loadChildViewController(newIndex, max);
            });
        }
        else
        {
            this._setViewLoaded(true);
        }
    }

    protected _setViewLoaded(value)
    {
        this.willChangeValue("viewLoaded");
        this._viewIsLoaded = value;
        this.didChangeValue("viewLoaded");

        if (value == true && this._onViewLoadedAction != null) {
            this._onViewLoadedAction.call(this._onViewLoadedTarget);
        }

        this._onViewLoadedTarget = null;
        this._onViewLoadedAction = null;
    }

    onLoadView(target, action)
    {
        this._onViewLoadedTarget = target;
        this._onViewLoadedAction = action;

        if (this._viewIsLoaded == true) {
            action.call(target);
        }
        else if (this._layerIsReady == true)
        {
            this.loadView();
            this.viewDidLoad();
            this._loadChildControllers();
        }
    }

    onLoadLayer(target, action)
    {
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

    setOutlet(elementID, className?, options?)
    {
        //var layer = MIOLayerSearchElementByID(this.view.layer, elementID);
        var layer = document.getElementById(elementID);
        if (className == null)
            className = layer.getAttribute("data-class");

        if (className == null) {
            var view = new MIOView();
            view.initWithLayer(layer);
            this.view._linkViewToSubview(view);
            return view;
        }

        var c = MIOClassFromString(className);
        c.initWithLayer(layer, options);
        this.view._linkViewToSubview(c);

        if (c instanceof  MIOView)
            c.awakeFromHTML();

        if (c instanceof MIOViewController)
            this.addChildViewController(c);

        return c;
    }

    get childViewControllers()
    {
        return this._childViewControllers;
    }

    addChildViewController(vc)
    {
        vc.parent = this;
        this._childViewControllers.push(vc);
        //vc.willMoveToParentViewController(this);
    }

    removeChildViewController(vc)
    {
        var index = this._childViewControllers.indexOf(vc);
        if (index != -1) {
            this._childViewControllers.splice(index, 1);
            vc.parent = null;
        }
    }

    // removeFromParentViewController()
    // {
    //     this.parent.removeChildViewController(this);
    //     this.parent = null;
    //     this.view.removeFromSuperview();
    //     //this.didMoveToParentViewController(null);
    // }

    presentViewController(vc, animate)
    {
        vc.presentationType = MIOPresentationType.Modal;

        var frame = FrameWithStyleForViewControllerInView(this.view, vc);
        vc.view.setFrame(frame);

        if (vc.presentationStyle == MIOPresentationStyle.ModalPresentationPopover)
        {
            MIOWebApplication.sharedInstance().showPopOverControllerFromRect(vc, frame);
        }
        else
        {
            this.addChildViewController(vc);
            this.showViewController(vc, true);
        }
    }

    showViewController(vc, animate)
    {
        this.view.addSubview(vc.view);

        var type = AnimationTypeForViewController(this, false);
        this.transitionFromViewControllerToViewController(this, vc, 0.25, type, null, null, false);

            /*vc.onLoadView(this, function () {

                if (vc.presentationStyle == MIOPresentationStyle.CurrentContext
                    || vc.presentationStyle == MIOPresentationStyle.FullScreen)
                {
                    this.viewWillDisappear();
                    this._childControllersWillDisappear();
                }

                vc.viewWillAppear();
                vc._childControllersWillAppear();

                vc.view.layout();

                if (animate)
                {
                    var newVC = vc;
                    var oldVC = this;

                    newVC.view.layer.style.animationDuration = "0.25s";
                    AddAnimationClassesForType(newVC, false);
                    newVC.view.layer.addEventListener("animationend", function(e) {

                        RemoveAnimationClassesForType(newVC, false);
                        newVC.view.layer.removeEventListener("animationend", null);

                        newVC.viewDidAppear();
                        newVC._childControllersDidAppear();

                        if (newVC.presentationStyle == MIOPresentationStyle.CurrentContext
                            || newVC.presentationStyle == MIOPresentationStyle.FullScreen)
                        {
                            oldVC.viewDidDisappear();
                            oldVC._childControllersDidDisappear();
                        }
                    });
                }
                else
                {
                    vc.viewDidAppear();
                    vc._childControllersDidAppear();

                    if (vc.presentationStyle == MIOPresentationStyle.CurrentContext
                        || vc.presentationStyle == MIOPresentationStyle.FullScreen)
                    {
                        this.viewDidDisappear();
                        this._childControllersDidDisappear();
                    }
                }
            });*/
    }

    dismissViewController(animate)
    {
        var type = AnimationTypeForViewController(this, true);
        this.transitionFromViewControllerToViewController(this, this.parent, 0.25, type, this, function () {

            this.view.removeFromSuperview();

        }, true);

/*        if (this.presentationStyle == MIOPresentationStyle.CurrentContext
            || this.presentationStyle == MIOPresentationStyle.FullScreen)
        {
            this.parent.viewWillAppear();
            this.parent._childControllersWillAppear();
            this.parent.view.layout();
        }

        this.viewWillDisappear();
        this._childControllersWillDisappear();

        if (animate)
        {
            var newVC = this.parent;
            var oldVC = this;

            oldVC.view.layer.style.animationDuration = "0.25s";
            AddAnimationClassesForType(oldVC, true);
            oldVC.view.layer.addEventListener("animationend", function(e) {

                RemoveAnimationClassesForType(oldVC, true);
                oldVC.view.layer.removeEventListener("animationend", null);

                oldVC.viewDidDisappear();
                oldVC._childControllersDidDisappear();

                if (oldVC.presentationStyle == MIOPresentationStyle.CurrentContext
                    || oldVC.presentationStyle == MIOPresentationStyle.FullScreen)
                {
                    newVC.viewDidAppear();
                    newVC._childControllersDidAppear();
                }

                oldVC.view.removeFromSuperview();
            });
        }
        else
        {
            this.viewDidDisappear();
            this._childControllersDidDisappear();

            if (this.presentationStyle == MIOPresentationStyle.CurrentContext
                || this.presentationStyle == MIOPresentationStyle.FullScreen)
            {
                this.parent.viewDidAppear();
                this.parent._childControllersDidAppear();
            }

            this.view.removeFromSuperview();
        }*/
    }

    transitionFromViewControllerToViewController(fromVC, toVC, duration, animationType, target?, completion?, reverse?)
    {
        toVC.onLoadView(this, function () {

            var presentationStyle = reverse ? fromVC.presentationStyle : toVC.presentationStyle;

            if (fromVC.presentationStyle == MIOPresentationStyle.CurrentContext
                || fromVC.presentationStyle == MIOPresentationStyle.FullScreen)
            {
                fromVC.viewWillDisappear();
                fromVC._childControllersWillDisappear();

                toVC.viewWillAppear();
                toVC._childControllersWillAppear();

                toVC.view.layout();
            }
            else
            {
                if (reverse == false)
                {
                    toVC.viewWillAppear();
                    toVC._childControllersWillAppear();

                    toVC.view.layout();
                }
                else
                {
                    fromVC.viewWillDisappear();
                    fromVC._childControllersWillDisappear();
                }
            }

            if (duration > 0)
            {
                var vc = reverse == true ? fromVC : toVC;
                vc.view.layer.style.animationDuration = duration + "s";
                AddAnimationClasses(vc, ClassListForAnimationType(animationType));
                vc.view.layer.animationParams = {};
                vc.view.layer.animationParams["type"] = animationType;
                vc.view.layer.animationParams["toVC"] = toVC;
                vc.view.layer.animationParams["fromVC"] = fromVC;
                if (target != null)
                    vc.view.layer.animationParams["target"] = target;
                if (completion != null)
                    vc.view.layer.animationParams["completion"] = completion;
                vc.view.layer.animationParams["instance"] = this;
                vc.view.layer.animationParams["reverse"] = reverse;
                vc.view.layer.addEventListener("animationend", this._animationDidFinish);
            }
            else
            {
                if (fromVC.presentationStyle == MIOPresentationStyle.CurrentContext
                    || fromVC.presentationStyle == MIOPresentationStyle.FullScreen)
                {
                    toVC.viewDidAppear();
                    toVC._childControllersDidAppear();

                    fromVC.viewDidDisappear();
                    fromVC._childControllersDidDisappear();
                }
                else
                {
                    if (reverse == false)
                    {
                        toVC.viewDidAppear();
                        toVC._childControllersDidAppear();
                    }
                    else
                    {
                        fromVC.viewDidDisappear();
                        fromVC._childControllersDidDisappear();
                    }
                }

                if (target != null && completion != null)
                    completion.call(target);
            }
        });
    }

    private _animationDidFinish(event)
    {
        var type = event.target.animationParams["type"];
        var toVC = event.target.animationParams["toVC"];
        var fromVC = event.target.animationParams["fromVC"];
        var target = event.target.animationParams["target"];
        var completion = event.target.animationParams["completion"];
        var instance = event.target.animationParams["instance"];
        var reverse = event.target.animationParams["reverse"];

        if (reverse == true) {
            RemoveAnimationClasses(fromVC, ClassListForAnimationType(type));
            toVC.view.layer.removeEventListener("animationend", instance._animationDidFinish);
        }else {
            RemoveAnimationClasses(toVC, ClassListForAnimationType(type));
            fromVC.view.layer.removeEventListener("animationend", instance._animationDidFinish);
        }

        if (fromVC.presentationStyle == MIOPresentationStyle.CurrentContext
            || fromVC.presentationStyle == MIOPresentationStyle.FullScreen)
        {
            toVC.viewDidAppear();
            toVC._childControllersDidAppear();

            fromVC.viewDidDisappear();
            fromVC._childControllersDidDisappear();
        }
        else
        {
            if (reverse == false)
            {
                toVC.viewDidAppear();
                toVC._childControllersDidAppear();
            }
            else
            {
                fromVC.viewDidDisappear();
                fromVC._childControllersDidDisappear();
            }
        }

        if (target != null && completion != null)
            completion.call(target);
    }

    popoverPresentationController()
    {
        if (this._popoverPresentationController == null)
        {
            this._popoverPresentationController = new MIOPopoverPresentationController(this.layerID + "_popovervc");
            this._popoverPresentationController.initWithRootViewController(this);
        }

        return this._popoverPresentationController;
    }

    viewDidLoad(){}

    viewWillAppear(){}
    protected _childControllersWillAppear()
    {
        for (var index = 0; index < this._childViewControllers.length; index++)

        for (var index = 0; index < this._childViewControllers.length; index++)
        {
            var vc = this._childViewControllers[index];
            vc.viewWillAppear();
        }
    }
    viewDidAppear(){}
    protected _childControllersDidAppear()
    {
        for (var index = 0; index < this._childViewControllers.length; index++)
        {
            var vc = this._childViewControllers[index];
            vc.viewDidAppear();
        }
    }

    viewWillDisappear(){}
    protected _childControllersWillDisappear()
    {
        for (var index = 0; index < this._childViewControllers.length; index++)
        {
            var vc = this._childViewControllers[index];
            vc.viewWillDisappear();
        }
    }

    viewDidDisappear(){}
    protected _childControllersDidDisappear()
    {
        for (var index = 0; index < this._childViewControllers.length; index++)
        {
            var vc = this._childViewControllers[index];
            vc.viewDidDisappear();
        }
    }

    contentHeight()
    {
        return this.view.getHeight();
    }

    public set contentSize(size)
    {
        this.willChangeValue("contentSize");
        this._contentSize = size;
        this.didChangeValue("contentSize");
    }

    public get contentSize()
    {
        return this._contentSize;
    }

    public get preferredContentSize()
    {
        return this._preferredContentSize;
    }

}

