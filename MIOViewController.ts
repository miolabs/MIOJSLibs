/**
 * Created by godshadow on 11/3/16.
 */

    /// <reference path="MIOView.ts" />
    /// <reference path="MIOURLConnection.ts" />

function MIOViewControllerFromElementID(view, elementID)
{
    var v = MIOViewFromElementID(view, elementID);
    if (v == null)
        return null;

    var vc = new MIOViewController();
    vc.initWithView(v);
    view._linkViewToSubview(v);

    return vc;
}

class MIOViewController extends MIOObject
{
    layerID = null;
    view = null;

    private _onViewLoadedObject = null;
    private _onViewLoadedTarget = null;
    private _onViewLoadedAction = null;

    private _viewLoaded = false;

    childViewControllers = [];
    navigationController = null;

    constructor(layerID?)
    {
        super();
        this.layerID = layerID;
    }

    init()
    {
        super.init();

        this.view = new MIOView(this.layerID);
        this.view.init();
        this.loadView();
    }

    initWithLayer(layer, options?)
    {
        this.view = new MIOView();
        this.view.initWithLayer(layer, options);
    }

    initWithView(view)
    {
        this.view = view;
        this.loadView();
    }

    initWithResource(url)
    {
        this.view = new MIOView();
        MIOCoreDownloadFile(this, url, function(data){

            var parser = new DOMParser();
            var html = parser.parseFromString(data, "text/html");

            //var styles = html.styleSheets;

            //if (css != null)
            //MIOCoreLoadStyle(css);

            var layer = html.getElementById(this.layerID);

            this.localizeSubLayers(layer.childNodes);

            this.view.initWithLayer(layer);
            this.loadView();
            this.setViewLoaded(true);
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

    setViewLoaded(value)
    {
        this.willChangeValue("viewLoaded");
        this._viewLoaded = value;
        this.didChangeValue("viewLoaded");

        if (value == true && this._onViewLoadedAction != null)
            this._onViewLoadedAction.call(this._onViewLoadedTarget, this._onViewLoadedObject);
    }

    setOnViewLoaded(object, target, action)
    {
        this._onViewLoadedObject = object;
        this._onViewLoadedTarget = target;
        this._onViewLoadedAction = action;
    }


    viewLoaded()
    {
        return this._viewLoaded;
    }

    setOutlet(elementID, className?, options?)
    {
        var layer = MIOLayerSearchElementByID(this.view.layer, elementID);
        if (className == null)
            className = layer.getAttribute("data-class");

        if (className == null) {
            var view = new MIOView();
            view.initWithLayer(layer);
            return view;
        }

        var c = MIOClassFromString(className);
        c.initWithLayer(layer, options);

        return c;
    }

    addChildViewController(vc)
    {
        this.childViewControllers.push(vc);
    }

    removeChildViewController(vc)
    {
        var index = this.childViewControllers.indexOf(vc);
        if (index != -1)
            this.childViewControllers.slice(index, 1);

        vc.removeFromSuperview();
    }

    presentViewController(vc)
    {
        this.view.addSubview(vc.view);

    }

    viewDidLoad(){}
    viewWillAppear()
    {
        for (var index = 0; index < this.childViewControllers.length; index++)
        {
            var vc = this.childViewControllers[index];
            vc.viewWillAppear();
        }
    }
    viewDidAppear()
    {
        for (var index = 0; index < this.childViewControllers.length; index++)
        {
            var vc = this.childViewControllers[index];
            vc.viewDidAppear();
        }
    }

    viewWillDisappear()
    {
        for (var index = 0; index < this.childViewControllers.length; index++)
        {
            var vc = this.childViewControllers[index];
            vc.viewWillDisappear();
        }
    }
    viewDidDisappear()
    {
        for (var index = 0; index < this.childViewControllers.length; index++)
        {
            var vc = this.childViewControllers[index];
            vc.viewDidDisappear();
        }
    }

    contentHeight()
    {
        return this.view.getHeight();
    }
}

