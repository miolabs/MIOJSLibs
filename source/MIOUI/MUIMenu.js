/**
 * Created by godshadow on 5/5/16.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="MUIView.ts" />
/// <reference path="MUIWebApplication.ts" />
var MUIMenuItem = (function (_super) {
    __extends(MUIMenuItem, _super);
    function MUIMenuItem(layerID) {
        var _this = _super.call(this, layerID == null ? MUIViewGetNextLayerID("mio_menu_item") : layerID) || this;
        _this.checked = false;
        _this.title = null;
        _this._titleLayer = null;
        _this.target = null;
        _this.action = null;
        return _this;
    }
    /*    public static itemWithLayer(layer)
        {
            var layerID = layer.getAttribute("id");
            var mi = new MIOMenuItem(layerID);
            mi.initWithLayer(layer);
            mi.title = layer.innerHTML;
    
            return mi;
        }
    
        initWithLayer(layer, options?)
        {
            super.initWithLayer(layer, options);
    
            this.layer.classList.add("menu_item");
    
            var instance = this;
            this.layer.onclick = function()
            {
                if (instance.parent != null) {
                    var index = instance.parent.items.indexOf(instance);
                    instance.parent.action.call(instance.parent.target, instance, index);
                }
            }
        }*/
    MUIMenuItem.itemWithTitle = function (title) {
        var mi = new MUIMenuItem();
        mi.initWithTitle(title);
        return mi;
    };
    MUIMenuItem.prototype.initWithTitle = function (title) {
        this.init();
        this._setupLayer();
        this.layer.style.width = "100%";
        this.layer.style.height = "";
        this._titleLayer = document.createElement("span");
        this._titleLayer.classList.add("menu_item");
        this._titleLayer.style.color = "inherit";
        this._titleLayer.innerHTML = title;
        this.layer.appendChild(this._titleLayer);
        this.title = title;
    };
    MUIMenuItem.prototype._setupLayer = function () {
        var instance = this;
        this.layer.onmouseenter = function (e) {
            e.stopPropagation();
            instance.layer.classList.add("menu_item_on_hover");
        };
        this.layer.onmouseleave = function (e) {
            e.stopPropagation();
            instance.layer.classList.remove("menu_item_on_hover");
        };
        this.layer.onclick = function (e) {
            e.stopPropagation();
            if (instance.action != null && instance.target != null) {
                instance.layer.classList.remove("menu_item_on_hover");
                instance.action.call(instance.target, instance);
            }
        };
    };
    MUIMenuItem.prototype.getWidth = function () {
        //return this.layer.style.innerWidth;
        return this._titleLayer.getBoundingClientRect().width;
    };
    MUIMenuItem.prototype.getHeight = function () {
        return this.layer.getBoundingClientRect().height;
    };
    return MUIMenuItem;
}(MUIView));
var MUIMenu = (function (_super) {
    __extends(MUIMenu, _super);
    function MUIMenu(layerID) {
        var _this = _super.call(this, layerID == null ? MUIViewGetNextLayerID("mio_menu") : layerID) || this;
        _this.items = [];
        _this._isVisible = false;
        _this._updateWidth = true;
        _this.target = null;
        _this.action = null;
        _this._menuLayer = null;
        return _this;
    }
    MUIMenu.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setupLayer();
    };
    /*  initWithLayer(layer, options?)
      {
          super.initWithLayer(layer, options);
  
          // Check if we have a menu
          if (this.layer.childNodes.length > 0)
          {
              for (var index = 0; index < this.layer.childNodes.length; index++)
              {
                  var layer = this.layer.childNodes[index];
                  if (layer.tagName == "DIV")
                  {
                      var item = MIOMenuItem.itemWithLayer(layer);
                      item.parent = this;
  
                      this._linkViewToSubview(item);
                      this._addMenuItem(item);
                  }
              }
          }
  
          this._setupLayer();
          this.setAlpha(0);
      }*/
    MUIMenu.prototype._setupLayer = function () {
        this.layer.classList.add("menu");
        this.layer.style.zIndex = 100;
    };
    MUIMenu.prototype._addMenuItem = function (menuItem) {
        this.items.push(menuItem);
    };
    MUIMenu.prototype.addMenuItem = function (menuItem) {
        menuItem.action = this._menuItemDidClick;
        menuItem.target = this;
        this.items.push(menuItem);
        this.addSubview(menuItem);
        this._updateWidth = true;
    };
    MUIMenu.prototype.removeMenuItem = function (menuItem) {
        //TODO: Implement this!!!
    };
    MUIMenu.prototype._menuItemDidClick = function (menuItem) {
        if (this.action != null && this.target != null) {
            var index = this.items.indexOf(menuItem);
            this.action.call(this.target, this, index);
        }
        this.hide();
    };
    MUIMenu.prototype.showFromControl = function (control) {
        this._isVisible = true;
        MUIWebApplication.sharedInstance().showMenuFromControl(control, this);
    };
    MUIMenu.prototype.hide = function () {
        this._isVisible = false;
        MUIWebApplication.sharedInstance().hideMenu();
    };
    Object.defineProperty(MUIMenu.prototype, "isVisible", {
        get: function () {
            return this._isVisible;
        },
        enumerable: true,
        configurable: true
    });
    MUIMenu.prototype.layout = function () {
        if (this._updateWidth == true) {
            var width = 0;
            var y = 5;
            for (var index = 0; index < this.items.length; index++) {
                var item = this.items[index];
                item.setX(0);
                item.setY(y);
                var w = item.getWidth();
                if (w > width)
                    width = w;
                y += item.getHeight();
            }
        }
        if (width < 40)
            width = 40;
        this.setWidth(width + 10);
        this.setHeight(y + 5);
    };
    return MUIMenu;
}(MUIView));
