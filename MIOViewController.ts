/**
 * Created by godshadow on 11/3/16.
 */

    /// <reference path="MIOObject.ts" />
    /// <reference path="MIOString.ts" />
    /// <reference path="MIOView.ts" />
    /// <reference path="MIOBundle.ts" />
    /// <reference path="MIOCoreTypes.ts" />

declare var MIOCoreResourceParser;

enum MIOPresentationStyle
{
    CurrentContext,
    PartialCover,
    PageSheet,
    FormSheet,
    FullScreen
}

enum MIOPresentationType
{
    Sheet,
    Modal,
    Navigation
}

enum MIOAnimationType
{
    BeginSheet,
    EndSheet,
    Push,
    Pop
}

class MIOViewController extends MIOObject
{
    layerID = null;
    view = null;
    parent = null;

    private _onViewLoadedTarget = null;
    private _onViewLoadedAction = null;

    private _viewIsLoaded = false;
    private _layerIsReady = false;

    private _childViewControllers = [];
    navigationController = null;

    presentationStyle = MIOPresentationStyle.CurrentContext;
    presentationType = MIOPresentationType.Modal;

    contentSize = new MIOSize(320, 200);

    constructor(layerID)
    {
        super();
        this.layerID = layerID;
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
        mainBundle.loadLayoutFromURL(url, this.layerID, this, function (layout) {

            //var layer = new MIOCoreResourceParser(layout, this.layerID);

            console.log(this.layerID);

            var parser = new DOMParser();
            var items = parser.parseFromString(layout, "text/html");
            var layer = items.getElementById(this.layerID);

            this.localizeSubLayers(layer.childNodes);

            this.view.addSubLayersFromLayer(layer);

            this.loadView();
            this._loadChildControllers();
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
        this.viewDidLoad();
    }

    protected _loadChildControllers()
    {
        var count = this._childViewControllers.length;

        if (count > 0)
            this._loadChildViewController(0, count);
        else
            this._setViewLoaded(true);
    }

    _loadChildViewController(index, max)
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

        if (value == true && this._onViewLoadedAction != null)
            this._onViewLoadedAction.call(this._onViewLoadedTarget);

        this._onViewLoadedTarget = null;
        this._onViewLoadedAction = null;
    }

    onLoadView(target, action)
    {
        this._onViewLoadedTarget = target;
        this._onViewLoadedAction = action;

        if (this._viewIsLoaded == true)
        {
            action.call(target);
        }
        else if (this._layerIsReady == true)
        {
            this.loadView();
            this._loadChildControllers();
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
        if (index != -1)
            this._childViewControllers.slice(index, 1);
    }

    removeFromParentViewController()
    {
        this.parent.removeChildViewController(this);
        this.parent = null;
        this.view.removeFromSuperview();
        //this.didMoveToParentViewController(null);
    }

    willMoveToParentViewController(parent)
    {

    }

    didMoveToParentViewController(parent)
    {

    }

    transitionFromViewControllerToViewController(fromVC, toVC, duration, animationStyle, target, completion)
    {


    }

    presentViewController(vc, animate)
    {
        vc.presentationType = MIOPresentationType.Modal;

        var frame = this._frameWithStyleForViewController(vc);
        vc.view.setFrame(frame);

        this.addChildViewController(vc);
        this.showViewController(vc, true);
    }

    showViewController(vc, animate)
    {
        this.view.addSubview(vc.view);

        vc.onLoadView(this, function () {

            if (vc.presentationStyle != MIOPresentationStyle.PartialCover)
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
                newVC._addAnimationClassesForType(newVC.presentationType, false);
                newVC.view.layer.addEventListener("animationend", function(e) {

                    newVC._removeAnimationClassesForType(newVC.presentationType, false);
                    //vc.view.layer.removeEventListener("animationend");

                    newVC.viewDidAppear();
                    newVC._childControllersDidAppear();

                    if (newVC.presentationStyle != MIOPresentationStyle.PartialCover)
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

                if (vc.presentationStyle != MIOPresentationStyle.PartialCover)
                {
                    this.viewDidDisappear();
                    this._childControllersDidDisappear();
                }
            }
        });
    }

    dismissViewController(animate)
    {
        if (this.presentationStyle != MIOPresentationStyle.PartialCover)
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
            oldVC._addAnimationClassesForType(newVC.presentationType, true);
            oldVC.view.layer.addEventListener("animationend", function(e) {

                oldVC._removeAnimationClassesForType(oldVC.presentationType, true);
                //vc.view.layer.removeEventListener("animationend");

                oldVC.viewDidDisappear();
                oldVC._childControllersDidDisappear();

                if (oldVC.presentationStyle != MIOPresentationStyle.PartialCover)
                {
                    newVC.viewDidAppear();
                    newVC._childControllersDidAppear();
                }

                oldVC.removeFromParentViewController();
            });
        }
        else
        {
            this.viewDidDisappear();
            this._childControllersDidDisappear();

            if (this.presentationStyle != MIOPresentationStyle.PartialCover)
            {
                this.parent.viewDidAppear();
                this.parent._childControllersDidAppear();
            }

            this.removeFromParentViewController();
        }
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

    // ANIMATION TYPES
    private _classListForAnimationType(type)
    {
        var array = [];
        array.push("animated");

        switch (type)
        {
            case MIOAnimationType.BeginSheet:
                array.push("slideInDown");
                break;

            case MIOAnimationType.EndSheet:
                array.push("slideOutUp");
                break;

            case MIOAnimationType.Push:
                array.push("slideInRight");
                break;

            case MIOAnimationType.Pop:
                array.push("slideOutLeft");
                break;
        }

        return array;
    }

    private _animationClassesForPresentationType(type, reverse)
    {
        var clasess = null;

        switch (type)
        {
            case MIOPresentationType.Sheet:
                clasess = this._classListForAnimationType(reverse == false ? MIOAnimationType.BeginSheet : MIOAnimationType.EndSheet);
                break;

            case MIOPresentationType.Modal:
                clasess = this._classListForAnimationType(reverse == false ? MIOAnimationType.BeginSheet : MIOAnimationType.EndSheet);
                break;

            case MIOPresentationType.Navigation:
                clasess = this._classListForAnimationType(reverse == false ? MIOAnimationType.Push : MIOAnimationType.Pop);
                break;
        }

        return clasess;
    }

    private _addAnimationClassesForType(type, reverse)
    {
        var classes = this._animationClassesForPresentationType(type, reverse);
        for (var index = 0; index < classes.length; index++)
            this.view.layer.classList.add(classes[index]);
    }

    private _removeAnimationClassesForType(type, reverse)
    {
        var classes = this._animationClassesForPresentationType(type, reverse);
        for (var index = 0; index < classes.length; index++)
            this.view.layer.classList.remove(classes[index]);
    }

    _frameWithStyleForViewController(vc)
    {
        var w = 0;
        var h = 0;
        var x = 0;
        var y = 0;

        if (vc.presentationStyle == MIOPresentationStyle.PageSheet)
        {
            w = vc.contentSize.width;
            h = vc.contentSize.height;
            x = (this.view.getWidth() - w) / 2;
            y = 0;
        }
        else if (vc.presentationStyle == MIOPresentationStyle.FormSheet)
        {
            w = this.view.getWidth() * 0.75; // 75% of the view
            h = this.view.getHeight() * 0.90; // 90% of the view
            x = (this.view.getWidth() - w) / 2;
            y = (this.view.getHeight() - h) / 2;
        }
        else
        {
            w = this.view.getWidth();
            h = this.view.getHeight();
        }
        return MIOFrame.frameWithRect(x, y, w, h);
    }
}

