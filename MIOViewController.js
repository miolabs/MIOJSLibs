/**
 * Created by godshadow on 11/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOObject.ts" />
/// <reference path="MIOString.ts" />
/// <reference path="MIOView.ts" />
/// <reference path="MIOBundle.ts" />
var MIOViewController = (function (_super) {
    __extends(MIOViewController, _super);
    function MIOViewController(layerID) {
        _super.call(this);
        this.layerID = null;
        this.view = null;
        this.parent = null;
        this._onViewLoadedObject = null;
        this._onViewLoadedTarget = null;
        this._onViewLoadedAction = null;
        this._viewIsLoaded = false;
        this._layerIsReady = false;
        this._childViewControllers = [];
        this.navigationController = null;
        this.layerID = layerID;
    }
    MIOViewController.prototype.init = function () {
        _super.prototype.init.call(this);
        this.view = new MIOView(this.layerID);
        this.view.init();
        this._layerIsReady = true;
    };
    MIOViewController.prototype.initWithLayer = function (layer, options) {
        _super.prototype.init.call(this);
        this.view = new MIOView(this.layerID);
        this.view.initWithLayer(layer, options);
        this._layerIsReady = true;
    };
    MIOViewController.prototype.initWithView = function (view) {
        _super.prototype.init.call(this);
        this.view = view;
        this._layerIsReady = true;
    };
    MIOViewController.prototype.initWithResource = function (url) {
        _super.prototype.init.call(this);
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
    };
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
    MIOViewController.prototype.localizeSubLayers = function (layers) {
        if (layers.length == 0)
            return;
        for (var index = 0; index < layers.length; index++) {
            var layer = layers[index];
            if (layer.tagName != "DIV")
                continue;
            var key = layer.getAttribute("data-localize-key");
            if (key != null)
                layer.innerHTML = MIOLocalizeString(key, key);
            this.localizeSubLayers(layer.childNodes);
        }
    };
    MIOViewController.prototype.localizeLayerIDWithKey = function (layerID, key) {
        var layer = MIOLayerSearchElementByID(this.view.layer, layerID);
        layer.innerHTML = MIOLocalizeString(key, key);
    };
    MIOViewController.prototype.loadView = function () {
        this.viewDidLoad();
    };
    MIOViewController.prototype._loadChildControllers = function () {
        var count = this._childViewControllers.length;
        if (count > 0)
            this._loadChildViewController(0, count);
        else
            this._setViewLoaded(true);
    };
    MIOViewController.prototype._loadChildViewController = function (index, max) {
        if (index < max) {
            var vc = this._childViewControllers[index];
            vc.onLoadView(this, function () {
                var newIndex = index + 1;
                this._loadChildViewController(newIndex, max);
            });
        }
        else {
            this._setViewLoaded(true);
        }
    };
    MIOViewController.prototype._setViewLoaded = function (value) {
        this.willChangeValue("viewLoaded");
        this._viewIsLoaded = value;
        this.didChangeValue("viewLoaded");
        if (value == true && this._onViewLoadedAction != null)
            this._onViewLoadedAction.call(this._onViewLoadedTarget);
        this._onViewLoadedTarget = null;
        this._onViewLoadedAction = null;
    };
    MIOViewController.prototype.onLoadView = function (target, action) {
        this._onViewLoadedTarget = target;
        this._onViewLoadedAction = action;
        if (this._viewIsLoaded == true) {
            action.call(target);
        }
        else if (this._layerIsReady == true) {
            this.loadView();
            this._loadChildControllers();
        }
    };
    Object.defineProperty(MIOViewController.prototype, "viewIsLoaded", {
        get: function () {
            return this._viewIsLoaded;
        },
        enumerable: true,
        configurable: true
    });
    MIOViewController.prototype.setOutlet = function (elementID, className, options) {
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
    };
    MIOViewController.prototype.addChildViewController = function (vc) {
        vc.parent = this;
        this.view.addSubview(vc.view);
        this._childViewControllers.push(vc);
    };
    MIOViewController.prototype.removeChildViewController = function (vc) {
        var index = this._childViewControllers.indexOf(vc);
        if (index != -1)
            this._childViewControllers.slice(index, 1);
        vc.removeFromSuperview();
    };
    MIOViewController.prototype._showViewController = function (newVC, oldVC) {
        this.view.addSubview(newVC.view);
        if (newVC.viewLoaded()) {
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
        else {
            var item = { "new_vc": newVC };
            if (oldVC != null)
                item["old_vc"] = oldVC;
            newVC.setOnViewLoaded(item, this, function (object) {
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
    };
    MIOViewController.prototype.presentViewController = function (vc) {
        vc.parent = this;
        this.viewWillDisappear();
        vc.viewWillAppear();
        this.view.addSubview(vc.view);
        this.viewDidDisappear();
        vc.viewDidAppear();
    };
    MIOViewController.prototype.dismissViewController = function () {
        if (this.parent != null) {
            this.viewWillDisappear();
            this.parent.viewWillAppear();
            this.parent.view.removeFromSuperview();
            this.viewDidDisappear();
            this.parent.viewDidAppear();
            this.parent = null;
        }
    };
    MIOViewController.prototype.viewDidLoad = function () { };
    MIOViewController.prototype.viewWillAppear = function () { };
    MIOViewController.prototype._childControllersWillAppear = function () {
        for (var index = 0; index < this._childViewControllers.length; index++)
            for (var index = 0; index < this._childViewControllers.length; index++) {
                var vc = this._childViewControllers[index];
                vc.viewWillAppear();
            }
    };
    MIOViewController.prototype.viewDidAppear = function () { };
    MIOViewController.prototype._childControllersDidAppear = function () {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewDidAppear();
        }
    };
    MIOViewController.prototype.viewWillDisappear = function () { };
    MIOViewController.prototype._childControllersWillDisappear = function () {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewWillDisappear();
        }
    };
    MIOViewController.prototype.viewDidDisappear = function () { };
    MIOViewController.prototype._childControllersDidDisappear = function () {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewDidDisappear();
        }
    };
    MIOViewController.prototype.contentHeight = function () {
        return this.view.getHeight();
    };
    return MIOViewController;
}(MIOObject));
//# sourceMappingURL=MIOViewController.js.map