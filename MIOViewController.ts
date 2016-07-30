/**
 * Created by godshadow on 11/3/16.
 */

    /// <reference path="MIOObject.ts" />
    /// <reference path="MIOString.ts" />
    /// <reference path="MIOView.ts" />
    /// <reference path="MIOBundle.ts" />

declare var MIOCoreResourceParser;

class MIOViewController extends MIOObject
{
    layerID = null;
    view = null;
    parent = null;

    private _onViewLoadedObject = null;
    private _onViewLoadedTarget = null;
    private _onViewLoadedAction = null;

    private _viewIsLoaded = false;
    private _layerIsReady = false;

    protected _childViewControllers = [];
    navigationController = null;

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

  /*  _addLayerToDOM(target?, completion?)
    {
        if (target == null && completion == null)
            return;

        if (this.view.layer != null){

            this.view.layout(); // Insert into DOM if it's not there
            this.localizeSubLayers(this.view.layer.childNodes);
            this.loadView();

            if (this.childViewControllers.length > 0)
            {
                var max = this.childViewControllers.length;
                this._addSubLayerToDOM(0, max, target, completion);
            }
            else
            {
                if (completion != null)
                    completion.call(target);
            }
        }
        else
        {
            this._targetDOM = target;
            this._completionDOM = completion;
            this._needToCreateDOM = true;
        }
    }

    _addSubLayerToDOM(index, max, target, completion)
    {
        if (index == max)
        {
            if (completion != null)
                completion.call(target);

            return;
        }

        var vc = this.childViewControllers[index];
        vc._addLayerToDOM(this, function () {

            index++;
            this._addSubLayerToDOM(index, max, target, completion);
        });
    }

    _removeLayerFromDOM()
    {
        this.view._removeLayerFromDOM();
    }*/

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

    addChildViewController(vc)
    {
        vc.parent = this;
        this.view.addSubview(vc.view);
        this._childViewControllers.push(vc);
    }

    removeChildViewController(vc)
    {
        var index = this._childViewControllers.indexOf(vc);
        if (index != -1)
            this._childViewControllers.slice(index, 1);

        vc.removeFromSuperview();
    }

    _showViewController(newVC, oldVC?)
    {
        this.view.addSubview(newVC.view);

        if (newVC.viewLoaded())
        {
            newVC.viewWillAppear();
            if (oldVC != null) {
                oldVC.viewWillDisappear();
                oldVC.view.setHidden(true);
                oldVC.viewDidDisappear();
            }
            newVC.view.setHidden(false);
            newVC.view.layout();
            newVC.viewDidAppear();
        }
        else
        {
            var item = {"new_vc" : newVC};
            if (oldVC != null)
                item["old_vc"] = oldVC;
            newVC.setOnViewLoaded(item, this, function(object){

                var newVC = object["new_vc"];
                var oldVC = object["old_vc"];

                newVC.viewWillAppear();
                if (oldVC != null) {
                    oldVC.viewWillDisappear();
                    oldVC.view.setHidden(true);
                    oldVC.viewDidDisappear();
                }
                newVC.view.setHidden(false);
                newVC.view.layout();
                newVC.viewDidAppear();
            });
        }
    }

    presentViewController(vc)
    {
        vc.parent = this;
        this.viewWillDisappear();
        vc.viewWillAppear();
        this.view.addSubview(vc.view);
        this.viewDidDisappear();
        vc.viewDidAppear();
    }

    dismissViewController()
    {
        if (this.parent != null)
        {
            this.viewWillDisappear();
            this.parent.viewWillAppear();
            this.parent.view.removeFromSuperview();
            this.viewDidDisappear();
            this.parent.viewDidAppear();

            this.parent = null;
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
}

