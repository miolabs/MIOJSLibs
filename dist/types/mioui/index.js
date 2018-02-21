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
var MUIAnimationType;
(function (MUIAnimationType) {
    MUIAnimationType[MUIAnimationType["None"] = 0] = "None";
    MUIAnimationType[MUIAnimationType["BeginSheet"] = 1] = "BeginSheet";
    MUIAnimationType[MUIAnimationType["EndSheet"] = 2] = "EndSheet";
    MUIAnimationType[MUIAnimationType["Push"] = 3] = "Push";
    MUIAnimationType[MUIAnimationType["Pop"] = 4] = "Pop";
    MUIAnimationType[MUIAnimationType["FlipLeft"] = 5] = "FlipLeft";
    MUIAnimationType[MUIAnimationType["FlipRight"] = 6] = "FlipRight";
    MUIAnimationType[MUIAnimationType["FadeIn"] = 7] = "FadeIn";
    MUIAnimationType[MUIAnimationType["FadeOut"] = 8] = "FadeOut";
    MUIAnimationType[MUIAnimationType["LightSpeedIn"] = 9] = "LightSpeedIn";
    MUIAnimationType[MUIAnimationType["LightSpeedOut"] = 10] = "LightSpeedOut";
    MUIAnimationType[MUIAnimationType["Hinge"] = 11] = "Hinge";
    MUIAnimationType[MUIAnimationType["SlideInUp"] = 12] = "SlideInUp";
    MUIAnimationType[MUIAnimationType["SlideOutDown"] = 13] = "SlideOutDown";
    MUIAnimationType[MUIAnimationType["HorizontalOutFlip"] = 14] = "HorizontalOutFlip";
    MUIAnimationType[MUIAnimationType["HorizontalInFlip"] = 15] = "HorizontalInFlip";
})(MUIAnimationType || (MUIAnimationType = {}));
function MUIClassListForAnimationType(type) {
    var array = [];
    array.push("animated");
    switch (type) {
        case MUIAnimationType.BeginSheet:
            array.push("slideInDown");
            break;
        case MUIAnimationType.EndSheet:
            array.push("slideOutUp");
            break;
        case MUIAnimationType.Push:
            array.push("slideInRight");
            break;
        case MUIAnimationType.Pop:
            array.push("slideOutRight");
            break;
        case MUIAnimationType.FadeIn:
            array.push("fadeIn");
            break;
        case MUIAnimationType.FadeOut:
            array.push("fadeOut");
            break;
        case MUIAnimationType.LightSpeedOut:
            array.push("lightSpeedOut");
            break;
        case MUIAnimationType.Hinge:
            array.push("hinge");
            break;
        case MUIAnimationType.SlideInUp:
            array.push("slideInUp");
            break;
        case MUIAnimationType.SlideOutDown:
            array.push("slideOutDown");
            break;
        case MUIAnimationType.HorizontalOutFlip:
            array.push("flipOutY");
            break;
        case MUIAnimationType.HorizontalInFlip:
            array.push("flipInY");
            break;
    }
    return array;
}
function _MUIAddAnimations(layer, animations) {
    for (var index = 0; index < animations.length; index++)
        layer.classList.add(animations[index]);
}
function _MUIRemoveAnimations(layer, animations) {
    for (var index = 0; index < animations.length; index++)
        layer.classList.remove(animations[index]);
}
function _MUIAnimationStart(layer, animationController, animationContext, target, completion) {
    if (animationController == null) {
        if (target != null && completion != null)
            completion.call(target);
        return;
    }
    var duration = animationController.transitionDuration(animationContext);
    var animations = animationController.animations(animationContext);
    animationController.animateTransition(animationContext);
    if (duration == 0 || animations == null) {
        animationController.animationEnded(true);
        if (target != null && completion != null)
            completion.call(target);
        return;
    }
    layer.style.animationDuration = duration + "s";
    _MUIAddAnimations(layer, animations);
    layer.animationParams = {};
    layer.animationParams["animationController"] = animationController;
    layer.animationParams["animations"] = animations;
    if (target != null)
        layer.animationParams["target"] = target;
    if (completion != null)
        layer.animationParams["completion"] = completion;
    layer.addEventListener("animationend", _MUIAnimationDidFinish);
}
function _MUIAnimationDidFinish(event) {
    var animationController = event.target.animationParams["animationController"];
    var animations = event.target.animationParams["animations"];
    var target = event.target.animationParams["target"];
    var completion = event.target.animationParams["completion"];
    var layer = event.target;
    _MUIRemoveAnimations(layer, animations);
    layer.removeEventListener("animationend", _MUIAnimationDidFinish);
    animationController.animationEnded(true);
    if (target != null && completion != null)
        completion.call(target);
}
function MUILayerSearchElementByID(layer, elementID) {
    if (layer.tagName != "DIV" && layer.tagName != "INPUT")
        return null;
    if (layer.getAttribute("data-outlet") == elementID)
        return layer;
    if (layer.getAttribute("id") == elementID)
        return layer;
    var elementFound = null;
    for (var count = 0; count < layer.childNodes.length; count++) {
        var l = layer.childNodes[count];
        elementFound = MUILayerSearchElementByID(l, elementID);
        if (elementFound != null)
            return elementFound;
    }
    return null;
}
function MUILayerGetFirstElementWithTag(layer, tag) {
    var foundLayer = null;
    if (layer.childNodes.length > 0) {
        var index = 0;
        var foundLayer = layer.childNodes[index];
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
var MUIView = (function (_super) {
    __extends(MUIView, _super);
    function MUIView(layerID) {
        var _this = _super.call(this) || this;
        _this.layerID = null;
        _this.layer = null;
        _this.layerOptions = null;
        _this.hidden = false;
        _this.alpha = 1;
        _this.parent = null;
        _this.tag = null;
        _this._viewIsVisible = false;
        _this._needDisplay = true;
        _this._isLayerInDOM = false;
        _this._subviews = [];
        _this._window = null;
        _this._outlets = {};
        _this.layerID = layerID ? layerID : MUICoreLayerIDFromObject(_this);
        return _this;
    }
    Object.defineProperty(MUIView.prototype, "subviews", {
        get: function () {
            return this._subviews;
        },
        enumerable: true,
        configurable: true
    });
    MUIView.prototype.init = function () {
        this.layer = MUICoreLayerCreate(this.layerID);
        this.layer.style.position = "absolute";
        this.layer.style.top = "0px";
        this.layer.style.left = "0px";
        this.layer.style.width = "100%";
        this.layer.style.height = "100%";
    };
    MUIView.prototype.initWithFrame = function (frame) {
        this.layer = MUICoreLayerCreate(this.layerID);
        this.layer.style.position = "absolute";
        this.layer.style.left = frame.origin.x + "px";
        this.layer.style.top = frame.origin.y + "px";
        this.layer.style.width = frame.size.width + "px";
        this.layer.style.height = frame.size.height + "px";
    };
    MUIView.prototype.initWithLayer = function (layer, owner, options) {
        this.layer = layer;
        this.layerOptions = options;
        var layerID = this.layer.getAttribute("id");
        if (layerID != null)
            this.layerID = layerID;
        this._addLayerToDOM();
    };
    MUIView.prototype.copy = function () {
        var objLayer = this.layer.cloneNode(true);
        var className = this.className;
        var obj = MIOClassFromString(className);
        obj.initWithLayer(objLayer);
        return obj;
    };
    MUIView.prototype.awakeFromHTML = function () { };
    MUIView.prototype.setParent = function (view) {
        this.willChangeValue("parent");
        this.parent = view;
        this.didChangeValue("parent");
    };
    MUIView.prototype.addSubLayer = function (layer) {
        this.layer.innerHTML = layer.innerHTML;
    };
    MUIView.prototype._linkViewToSubview = function (view) {
        if ((view instanceof MUIView) == false)
            throw ("_linkViewToSubview: Trying to add an object that is not a view");
        this.subviews.push(view);
    };
    MUIView.prototype.addSubview = function (view, index) {
        if ((view instanceof MUIView) == false)
            throw ("addSubview: Trying to add an object that is not a view");
        view.setParent(this);
        if (index == null)
            this.subviews.push(view);
        else
            this.subviews.splice(index, 0, view);
        view._addLayerToDOM(index);
        view.setNeedsDisplay();
    };
    MUIView.prototype._addLayerToDOM = function (index) {
        if (this._isLayerInDOM == true)
            return;
        if (this.layer == null || this.parent == null)
            return;
        if (index == null)
            this.parent.layer.appendChild(this.layer);
        else
            this.parent.layer.insertBefore(this.layer, this.parent.layer.children[0]);
        this._isLayerInDOM = true;
    };
    MUIView.prototype.removeFromSuperview = function () {
        var subviews = this.parent._subviews;
        var index = subviews.indexOf(this);
        subviews.splice(index, 1);
        if (this._isLayerInDOM == false)
            return;
        this.parent.layer.removeChild(this.layer);
        this._isLayerInDOM = false;
    };
    MUIView.prototype._removeLayerFromDOM = function () {
        if (this._isLayerInDOM == false)
            return;
        this.layer.removeChild(this.layer);
        this._isLayerInDOM = false;
    };
    MUIView.prototype._removeAllSubviews = function () {
        var node = this.layer;
        while (this.layer.hasChildNodes()) {
            if (node.hasChildNodes()) {
                node = node.lastChild;
            }
            else {
                node = node.parentNode;
                node.removeChild(node.lastChild);
            }
        }
    };
    MUIView.prototype.setViewIsVisible = function (value) {
        this._viewIsVisible = true;
        for (var index = 0; index < this.subviews.length; index++) {
            var v = this.subviews[index];
            v.setViewIsVisible(value);
        }
    };
    MUIView.prototype.layoutSubviews = function () {
        for (var index = 0; index < this.subviews.length; index++) {
            var v = this.subviews[index];
            if ((v instanceof MUIView) == false)
                throw ("layout: Trying to layout an object that is not a view");
            v.setNeedsDisplay();
        }
    };
    MUIView.prototype.setNeedsDisplay = function () {
        this._needDisplay = true;
        if (this._viewIsVisible == false)
            return;
        if (this.hidden == true)
            return;
        this._needDisplay = false;
        this.layoutSubviews();
        for (var index = 0; index < this.subviews.length; index++) {
            var v = this.subviews[index];
            if (!(v instanceof MUIView)) {
                console.log("ERROR: trying to call setNeedsDisplay: in object that it's not a view");
            }
            else
                v.setNeedsDisplay();
        }
    };
    MUIView.prototype.layerWithItemID = function (itemID) {
        return MUILayerSearchElementByID(this.layer, itemID);
    };
    MUIView.prototype.setHidden = function (hidden) {
        this.hidden = hidden;
        if (this.layer == null)
            return;
        if (hidden)
            this.layer.style.display = "none";
        else
            this.layer.style.display = "";
    };
    MUIView.prototype.setBackgroundColor = function (color) {
        this.layer.style.backgroundColor = "#" + color;
    };
    MUIView.prototype.setBackgroundRGBColor = function (r, g, b, a) {
        if (a == null) {
            var value = "rgb(" + r + ", " + g + ", " + b + ")";
            this.layer.style.backgroundColor = value;
        }
        else {
            var value = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
            this.layer.style.backgroundColor = value;
        }
    };
    MUIView.prototype.getBackgroundColor = function () {
        var cs = document.defaultView.getComputedStyle(this.layer, null);
        var bg = cs.getPropertyValue('background-color');
        return bg;
    };
    MUIView.prototype.setAlpha = function (alpha, animate, duration) {
        if (animate == true || duration > 0) {
            this.layer.style.transition = "opacity " + duration + "s";
        }
        this.alpha = alpha;
        this.layer.style.opacity = alpha;
    };
    MUIView.prototype.setX = function (x, animate, duration) {
        if (animate == true || duration > 0) {
            this.layer.style.transition = "left " + duration + "s";
        }
        this.layer.style.left = x + "px";
    };
    MUIView.prototype.getX = function () {
        var x = this._getIntValueFromCSSProperty("left");
        return x;
    };
    MUIView.prototype.setY = function (y) {
        this.layer.style.top = y + "px";
    };
    MUIView.prototype.getY = function () {
        var y = this._getIntValueFromCSSProperty("top");
        return y;
    };
    MUIView.prototype.setWidth = function (w) {
        this.layer.style.width = w + "px";
    };
    MUIView.prototype.getWidth = function () {
        var w1 = this.layer.clientWidth;
        var w2 = this._getIntValueFromCSSProperty("width");
        var w = Math.max(w1, w2);
        if (isNaN(w))
            w = 0;
        return w;
    };
    MUIView.prototype.setHeight = function (h) {
        this.willChangeValue("height");
        this.layer.style.height = h + "px";
        this.didChangeValue("height");
    };
    MUIView.prototype.getHeight = function () {
        var h1 = this.layer.clientHeight;
        var h2 = this._getIntValueFromCSSProperty("height");
        var h = Math.max(h1, h2);
        return h;
    };
    MUIView.prototype.setFrameComponents = function (x, y, w, h) {
        this.setX(x);
        this.setY(y);
        this.setWidth(w);
        this.setHeight(h);
    };
    MUIView.prototype.setFrame = function (frame) {
        this.willChangeValue("frame");
        this.setFrameComponents(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
        this.didChangeValue("frame");
    };
    Object.defineProperty(MUIView.prototype, "frame", {
        get: function () {
            return MIORect.rectWithValues(this.getX(), this.getY(), this.getWidth(), this.getHeight());
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUIView.prototype, "bounds", {
        get: function () {
            return MIORect.rectWithValues(0, 0, this.getWidth(), this.getHeight());
        },
        enumerable: true,
        configurable: true
    });
    MUIView.prototype._getValueFromCSSProperty = function (property) {
        var v = window.getComputedStyle(this.layer, null).getPropertyValue(property);
        return v;
    };
    MUIView.prototype._getIntValueFromCSSProperty = function (property) {
        var v = this._getValueFromCSSProperty(property);
        var r = v.hasSuffix("px");
        if (r == true)
            v = v.substring(0, v.length - 2);
        else {
            var r2 = v.hasSuffix("%");
            if (r2 == true)
                v = v.substring(0, v.length - 1);
        }
        return parseInt(v);
    };
    return MUIView;
}(MIOObject));
var _MUICoreLayerIDCount = 0;
function MUICoreLayerIDFromObject(object) {
    var classname = object.constructor.name.substring(3);
    return MUICoreLayerIDFromClassname(classname);
}
function MUICoreLayerIDFromClassname(classname) {
    var digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    var random = "";
    for (var count = 0; count < 4; count++) {
        var randomNumber = Math.floor(Math.random() * 16);
        var randomDigit = digits[randomNumber];
        random += randomDigit;
    }
    var layerID = classname.toLowerCase() + "_" + random;
    _MUICoreLayerIDCount++;
    return layerID;
}
function MUICoreLayerCreate(layerID) {
    var layer = document.createElement("DIV");
    if (layerID != null)
        layer.setAttribute("id", layerID);
    layer.style.position = "absolute";
    return layer;
}
function MUICoreLayerCreateWithStyle(style, layerID) {
    var layer = MUICoreLayerCreate(layerID);
    MUICoreLayerAddStyle(layer, style);
    return layer;
}
function MUICoreLayerAddStyle(layer, style) {
    layer.classList.add(style);
}
function MUICoreLayerRemoveStyle(layer, style) {
    layer.classList.remove(style);
}
var MUIModalPresentationStyle;
(function (MUIModalPresentationStyle) {
    MUIModalPresentationStyle[MUIModalPresentationStyle["FullScreen"] = 0] = "FullScreen";
    MUIModalPresentationStyle[MUIModalPresentationStyle["PageSheet"] = 1] = "PageSheet";
    MUIModalPresentationStyle[MUIModalPresentationStyle["FormSheet"] = 2] = "FormSheet";
    MUIModalPresentationStyle[MUIModalPresentationStyle["CurrentContext"] = 3] = "CurrentContext";
    MUIModalPresentationStyle[MUIModalPresentationStyle["Custom"] = 4] = "Custom";
    MUIModalPresentationStyle[MUIModalPresentationStyle["OverFullScreen"] = 5] = "OverFullScreen";
    MUIModalPresentationStyle[MUIModalPresentationStyle["OverCurrentContext"] = 6] = "OverCurrentContext";
    MUIModalPresentationStyle[MUIModalPresentationStyle["Popover"] = 7] = "Popover";
    MUIModalPresentationStyle[MUIModalPresentationStyle["None"] = 8] = "None";
})(MUIModalPresentationStyle || (MUIModalPresentationStyle = {}));
var MUIModalTransitionStyle;
(function (MUIModalTransitionStyle) {
    MUIModalTransitionStyle[MUIModalTransitionStyle["CoverVertical"] = 0] = "CoverVertical";
    MUIModalTransitionStyle[MUIModalTransitionStyle["FlipHorizontal"] = 1] = "FlipHorizontal";
    MUIModalTransitionStyle[MUIModalTransitionStyle["CrossDisolve"] = 2] = "CrossDisolve";
})(MUIModalTransitionStyle || (MUIModalTransitionStyle = {}));
var MUIPresentationController = (function (_super) {
    __extends(MUIPresentationController, _super);
    function MUIPresentationController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.presentationStyle = MUIModalPresentationStyle.PageSheet;
        _this.shouldPresentInFullscreen = false;
        _this._presentedViewController = null;
        _this.presentingViewController = null;
        _this.presentedView = null;
        _this._transitioningDelegate = null;
        _this._window = null;
        _this.isPresented = false;
        return _this;
    }
    MUIPresentationController.prototype.initWithPresentedViewControllerAndPresentingViewController = function (presentedViewController, presentingViewController) {
        _super.prototype.init.call(this);
        this.presentedViewController = presentedViewController;
        this.presentingViewController = presentingViewController;
    };
    MUIPresentationController.prototype.setPresentedViewController = function (vc) {
        this._presentedViewController = vc;
        this.presentedView = vc.view;
    };
    Object.defineProperty(MUIPresentationController.prototype, "presentedViewController", {
        get: function () {
            return this._presentedViewController;
        },
        set: function (vc) {
            this.setPresentedViewController(vc);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUIPresentationController.prototype, "transitioningDelegate", {
        get: function () {
            if (this._transitioningDelegate == null) {
                this._transitioningDelegate = new MIOModalTransitioningDelegate();
                this._transitioningDelegate.init();
            }
            return this._transitioningDelegate;
        },
        enumerable: true,
        configurable: true
    });
    MUIPresentationController.prototype.presentationTransitionWillBegin = function () {
        var toVC = this.presentedViewController;
        var view = this.presentedView;
        this._calculateFrame();
        if (toVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet || MIOCoreIsPhone() == true) {
            view.layer.classList.add("modal_window");
        }
    };
    MUIPresentationController.prototype._calculateFrame = function () {
        var fromVC = this.presentingViewController;
        var toVC = this.presentedViewController;
        var view = this.presentedView;
        if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen || MIOCoreIsPhone() == true) {
            view.layer.style.left = "0px";
            view.layer.style.top = "0px";
            view.layer.style.width = "100%";
            view.layer.style.height = "100%";
        }
        else if (toVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext) {
            var w = fromVC.view.getWidth();
            var h = fromVC.view.getHeight();
            view.setFrame(MIORect.rectWithValues(0, 0, w, h));
        }
        else if (toVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet && MIOCoreIsPhone() == false) {
            var ws = MUIWindowSize();
            var size = toVC.preferredContentSize;
            if (size == null)
                size = new MIOSize(320, 200);
            var w = toVC.preferredContentSize.width;
            var h = toVC.preferredContentSize.height;
            var x = (ws.width - w) / 2;
            view.setFrame(MIORect.rectWithValues(0, 0, w, h));
            this.window.setFrame(MIORect.rectWithValues(x, 0, w, h));
            view.layer.classList.add("modal_background");
        }
        else if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FormSheet) {
            var ws = MUIWindowSize();
            var size = toVC.preferredContentSize;
            if (size == null)
                size = new MIOSize(320, 200);
            var w = size.width;
            var h = size.height;
            var x = (ws.width - w) / 2;
            var y = (ws.height - h) / 2;
            view.setFrame(MIORect.rectWithValues(0, 0, w, h));
            this.window.setFrame(MIORect.rectWithValues(x, y, w, h));
            view.layer.classList.add("modal_background");
        }
        else {
            var w = toVC.preferredContentSize.width;
            var h = toVC.preferredContentSize.height;
            view.setFrame(MIORect.rectWithValues(0, 0, w, h));
        }
    };
    MUIPresentationController.prototype.presentationTransitionDidEnd = function (completed) {
        this.isPresented = true;
    };
    MUIPresentationController.prototype.dismissalTransitionWillBegin = function () {
    };
    MUIPresentationController.prototype.dismissalTransitionDidEnd = function (completed) {
        this.isPresented = false;
    };
    Object.defineProperty(MUIPresentationController.prototype, "window", {
        get: function () {
            return this._window;
        },
        set: function (window) {
            var vc = this.presentedViewController;
            this._window = window;
            if (MIOCoreIsMobile() == false && vc.modalPresentationStyle != MUIModalPresentationStyle.CurrentContext) {
                vc.addObserver(this, "preferredContentSize");
            }
        },
        enumerable: true,
        configurable: true
    });
    MUIPresentationController.prototype.observeValueForKeyPath = function (key, type, object) {
        if (key == "preferredContentSize" && type == "did") {
            var vc = this.presentedView;
            vc.layer.style.transition = "left 0.25s, width 0.25s, height 0.25s";
            this._calculateFrame();
        }
    };
    return MUIPresentationController;
}(MIOObject));
var MIOModalTransitioningDelegate = (function (_super) {
    __extends(MIOModalTransitioningDelegate, _super);
    function MIOModalTransitioningDelegate() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.modalTransitionStyle = null;
        _this._presentAnimationController = null;
        _this._dissmissAnimationController = null;
        return _this;
    }
    MIOModalTransitioningDelegate.prototype.animationControllerForPresentedController = function (presentedViewController, presentingViewController, sourceController) {
        if (this._presentAnimationController == null) {
            this._presentAnimationController = new MIOModalPresentAnimationController();
            this._presentAnimationController.init();
        }
        return this._presentAnimationController;
    };
    MIOModalTransitioningDelegate.prototype.animationControllerForDismissedController = function (dismissedController) {
        if (this._dissmissAnimationController == null) {
            this._dissmissAnimationController = new MIOModalDismissAnimationController();
            this._dissmissAnimationController.init();
        }
        return this._dissmissAnimationController;
    };
    return MIOModalTransitioningDelegate;
}(MIOObject));
var MIOAnimationController = (function (_super) {
    __extends(MIOAnimationController, _super);
    function MIOAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0;
    };
    MIOAnimationController.prototype.animateTransition = function (transitionContext) {
    };
    MIOAnimationController.prototype.animationEnded = function (transitionCompleted) {
    };
    MIOAnimationController.prototype.animations = function (transitionContext) {
        return null;
    };
    return MIOAnimationController;
}(MIOObject));
var MIOModalPresentAnimationController = (function (_super) {
    __extends(MIOModalPresentAnimationController, _super);
    function MIOModalPresentAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOModalPresentAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.15;
    };
    MIOModalPresentAnimationController.prototype.animateTransition = function (transitionContext) {
    };
    MIOModalPresentAnimationController.prototype.animationEnded = function (transitionCompleted) {
    };
    MIOModalPresentAnimationController.prototype.animations = function (transitionContext) {
        var animations = null;
        var toVC = transitionContext.presentedViewController;
        if (toVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet
            || toVC.modalPresentationStyle == MUIModalPresentationStyle.FormSheet) {
            if (MIOCoreIsPhone() == true)
                animations = MUIClassListForAnimationType(MUIAnimationType.SlideInUp);
            else
                animations = MUIClassListForAnimationType(MUIAnimationType.BeginSheet);
        }
        return animations;
    };
    return MIOModalPresentAnimationController;
}(MIOObject));
var MIOModalDismissAnimationController = (function (_super) {
    __extends(MIOModalDismissAnimationController, _super);
    function MIOModalDismissAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOModalDismissAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.15;
    };
    MIOModalDismissAnimationController.prototype.animateTransition = function (transitionContext) {
    };
    MIOModalDismissAnimationController.prototype.animationEnded = function (transitionCompleted) {
    };
    MIOModalDismissAnimationController.prototype.animations = function (transitionContext) {
        var animations = null;
        var fromVC = transitionContext.presentingViewController;
        if (fromVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet
            || fromVC.modalPresentationStyle == MUIModalPresentationStyle.FormSheet) {
            if (MIOCoreIsPhone() == true)
                animations = MUIClassListForAnimationType(MUIAnimationType.SlideOutDown);
            else
                animations = MUIClassListForAnimationType(MUIAnimationType.EndSheet);
        }
        return animations;
    };
    return MIOModalDismissAnimationController;
}(MIOObject));
var MUIPopoverArrowDirection;
(function (MUIPopoverArrowDirection) {
    MUIPopoverArrowDirection[MUIPopoverArrowDirection["Any"] = 0] = "Any";
    MUIPopoverArrowDirection[MUIPopoverArrowDirection["Up"] = 1] = "Up";
    MUIPopoverArrowDirection[MUIPopoverArrowDirection["Down"] = 2] = "Down";
    MUIPopoverArrowDirection[MUIPopoverArrowDirection["Left"] = 3] = "Left";
    MUIPopoverArrowDirection[MUIPopoverArrowDirection["Right"] = 4] = "Right";
})(MUIPopoverArrowDirection || (MUIPopoverArrowDirection = {}));
var MUIPopoverPresentationController = (function (_super) {
    __extends(MUIPopoverPresentationController, _super);
    function MUIPopoverPresentationController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.permittedArrowDirections = MUIPopoverArrowDirection.Any;
        _this.sourceView = null;
        _this.sourceRect = MIORect.Zero();
        _this.delegate = null;
        _this._contentSize = null;
        _this._canvasLayer = null;
        _this._contentView = null;
        return _this;
    }
    Object.defineProperty(MUIPopoverPresentationController.prototype, "transitioningDelegate", {
        get: function () {
            if (this._transitioningDelegate == null) {
                this._transitioningDelegate = new MIOModalPopOverTransitioningDelegate();
                this._transitioningDelegate.init();
            }
            return this._transitioningDelegate;
        },
        enumerable: true,
        configurable: true
    });
    MUIPopoverPresentationController.prototype.presentationTransitionWillBegin = function () {
        var vc = this.presentedViewController;
        var view = this.presentedView;
        this._calculateFrame();
        this.presentedView.layer.classList.add("popover_window");
    };
    MUIPopoverPresentationController.prototype._calculateFrame = function () {
        var vc = this.presentedViewController;
        var view = this.presentedView;
        var w = vc.preferredContentSize.width;
        var h = vc.preferredContentSize.height;
        var v = vc.popoverPresentationController.sourceView;
        var f = vc.popoverPresentationController.sourceRect;
        var xShift = false;
        var y = v.layer.getBoundingClientRect().top + f.size.height + 10;
        if ((y + h) > window.innerHeight)
            y = v.layer.getBoundingClientRect().top - h - 10;
        if (y < 0) {
            xShift = true;
            y = (window.innerHeight - h) / 2;
        }
        var x = 0;
        if (xShift == false) {
            x = v.layer.getBoundingClientRect().left + 10;
            if ((x + w) > window.innerWidth)
                x = v.layer.getBoundingClientRect().left + f.size.width - w + 10;
        }
        else {
            x = v.layer.getBoundingClientRect().left + f.size.width + 10;
            if ((x + w) > window.innerWidth)
                x = v.layer.getBoundingClientRect().left - w - 10;
        }
        view.setFrame(MIORect.rectWithValues(0, 0, w, h));
        this.window.setFrame(MIORect.rectWithValues(x, y, w, h));
    };
    MUIPopoverPresentationController.prototype._drawRoundRect = function (x, y, width, height, radius) {
        var ctx = this._canvasLayer.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        var color = 'rgba(208, 208, 219, 1)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
    };
    return MUIPopoverPresentationController;
}(MUIPresentationController));
var MIOModalPopOverTransitioningDelegate = (function (_super) {
    __extends(MIOModalPopOverTransitioningDelegate, _super);
    function MIOModalPopOverTransitioningDelegate() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.modalTransitionStyle = null;
        _this._showAnimationController = null;
        _this._dissmissAnimationController = null;
        return _this;
    }
    MIOModalPopOverTransitioningDelegate.prototype.animationControllerForPresentedController = function (presentedViewController, presentingViewController, sourceController) {
        if (this._showAnimationController == null) {
            this._showAnimationController = new MIOPopOverPresentAnimationController();
            this._showAnimationController.init();
        }
        return this._showAnimationController;
    };
    MIOModalPopOverTransitioningDelegate.prototype.animationControllerForDismissedController = function (dismissedController) {
        if (this._dissmissAnimationController == null) {
            this._dissmissAnimationController = new MIOPopOverDismissAnimationController();
            this._dissmissAnimationController.init();
        }
        return this._dissmissAnimationController;
    };
    return MIOModalPopOverTransitioningDelegate;
}(MIOObject));
var MIOPopOverPresentAnimationController = (function (_super) {
    __extends(MIOPopOverPresentAnimationController, _super);
    function MIOPopOverPresentAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOPopOverPresentAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.25;
    };
    MIOPopOverPresentAnimationController.prototype.animateTransition = function (transitionContext) {
    };
    MIOPopOverPresentAnimationController.prototype.animationEnded = function (transitionCompleted) {
    };
    MIOPopOverPresentAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.FadeIn);
        return animations;
    };
    return MIOPopOverPresentAnimationController;
}(MIOObject));
var MIOPopOverDismissAnimationController = (function (_super) {
    __extends(MIOPopOverDismissAnimationController, _super);
    function MIOPopOverDismissAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOPopOverDismissAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.25;
    };
    MIOPopOverDismissAnimationController.prototype.animateTransition = function (transitionContext) {
    };
    MIOPopOverDismissAnimationController.prototype.animationEnded = function (transitionCompleted) {
    };
    MIOPopOverDismissAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.FadeOut);
        return animations;
    };
    return MIOPopOverDismissAnimationController;
}(MIOObject));
var MUIWindow = (function (_super) {
    __extends(MUIWindow, _super);
    function MUIWindow() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.rootViewController = null;
        _this._resizeWindow = false;
        return _this;
    }
    MUIWindow.prototype.initWithRootViewController = function (vc) {
        this.init();
        this.rootViewController = vc;
        this.addSubview(vc.view);
    };
    MUIWindow.prototype.makeKey = function () {
        MUIWebApplication.sharedInstance().makeKeyWindow(this);
    };
    MUIWindow.prototype.makeKeyAndVisible = function () {
        this.makeKey();
        this.setHidden(false);
    };
    MUIWindow.prototype.layoutSubviews = function () {
        if (this.rootViewController != null)
            this.rootViewController.view.layoutSubviews();
        else
            _super.prototype.layoutSubviews.call(this);
    };
    MUIWindow.prototype.addSubview = function (view) {
        view._window = this;
        _super.prototype.addSubview.call(this, view);
    };
    MUIWindow.prototype._addLayerToDOM = function () {
        if (this._isLayerInDOM == true)
            return;
        if (this.layer == null)
            return;
        document.body.appendChild(this.layer);
        this._isLayerInDOM = true;
    };
    MUIWindow.prototype.removeFromSuperview = function () {
        this._removeLayerFromDOM();
    };
    MUIWindow.prototype._removeLayerFromDOM = function () {
        if (this._isLayerInDOM == false)
            return;
        document.body.removeChild(this.layer);
        this._isLayerInDOM = false;
    };
    MUIWindow.prototype.setHidden = function (hidden) {
        if (hidden == false) {
            this._addLayerToDOM();
        }
        else {
            this._removeLayerFromDOM();
        }
    };
    MUIWindow.prototype._eventHappendOutsideWindow = function () {
        this._dismissRootViewController();
    };
    MUIWindow.prototype._becameKeyWindow = function () {
    };
    MUIWindow.prototype._resignKeyWindow = function () {
        this._dismissRootViewController();
    };
    MUIWindow.prototype._dismissRootViewController = function () {
        if (this.rootViewController.isPresented == true) {
            var pc = this.rootViewController.presentationController;
            if (pc instanceof MUIPopoverPresentationController)
                this.rootViewController.dismissViewController(true);
        }
    };
    return MUIWindow;
}(MUIView));
var MUIViewController = (function (_super) {
    __extends(MUIViewController, _super);
    function MUIViewController(layerID) {
        var _this = _super.call(this) || this;
        _this.layerID = null;
        _this.view = null;
        _this._htmlResourcePath = null;
        _this._onViewLoadedTarget = null;
        _this._onViewLoadedAction = null;
        _this._onLoadLayerTarget = null;
        _this._onLoadLayerAction = null;
        _this._viewIsLoaded = false;
        _this._layerIsReady = false;
        _this._childViewControllers = [];
        _this.parentViewController = null;
        _this.presentingViewController = null;
        _this.presentedViewController = null;
        _this.navigationController = null;
        _this.splitViewController = null;
        _this.tabBarController = null;
        _this._presentationController = null;
        _this._popoverPresentationController = null;
        _this.modalPresentationStyle = MUIModalPresentationStyle.CurrentContext;
        _this.modalTransitionStyle = MUIModalTransitionStyle.CoverVertical;
        _this.transitioningDelegate = null;
        _this._contentSize = new MIOSize(320, 200);
        _this._preferredContentSize = null;
        _this._outlets = {};
        _this.layerID = layerID ? layerID : MUICoreLayerIDFromObject(_this);
        return _this;
    }
    MUIViewController.prototype.init = function () {
        _super.prototype.init.call(this);
        this.loadView();
    };
    MUIViewController.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.init.call(this);
        this.view = new MUIView(this.layerID);
        this.view.initWithLayer(layer, owner, options);
        this.loadView();
    };
    MUIViewController.prototype.initWithResource = function (path) {
        if (path == null)
            throw ("MIOViewController:initWithResource can't be null");
        _super.prototype.init.call(this);
        this._htmlResourcePath = path;
        this.loadView();
    };
    MUIViewController.prototype.localizeSubLayers = function (layers) {
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
    MUIViewController.prototype.localizeLayerIDWithKey = function (layerID, key) {
        var layer = MUILayerSearchElementByID(this.view.layer, layerID);
        layer.innerHTML = MIOLocalizeString(key, key);
    };
    MUIViewController.prototype.loadView = function () {
        if (this.view != null) {
            this._didLoadView();
            return;
        }
        this.view = new MUIView(this.layerID);
        if (this._htmlResourcePath == null) {
            this.view.init();
            this._didLoadView();
            return;
        }
        var mainBundle = MIOBundle.mainBundle();
        mainBundle.loadHTMLNamed(this._htmlResourcePath, this.layerID, this, function (layer) {
            this.view.initWithLayer(layer);
            this.view.awakeFromHTML();
            this._didLoadView();
        });
    };
    MUIViewController.prototype._didLoadView = function () {
        this._layerIsReady = true;
        if (this._onLoadLayerTarget != null && this._onViewLoadedAction != null) {
            this._onLoadLayerAction.call(this._onLoadLayerTarget);
            this._onLoadLayerTarget = null;
            this._onLoadLayerAction = null;
        }
        if (this._onViewLoadedAction != null && this._onViewLoadedTarget != null) {
            this.viewDidLoad();
            this._loadChildControllers();
        }
    };
    MUIViewController.prototype._loadChildControllers = function () {
        var count = this._childViewControllers.length;
        if (count > 0)
            this._loadChildViewController(0, count);
        else
            this._setViewLoaded(true);
    };
    MUIViewController.prototype._loadChildViewController = function (index, max) {
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
    MUIViewController.prototype._setViewLoaded = function (value) {
        this.willChangeValue("viewLoaded");
        this._viewIsLoaded = value;
        this.didChangeValue("viewLoaded");
        if (value == true && this._onViewLoadedAction != null) {
            this._onViewLoadedAction.call(this._onViewLoadedTarget);
        }
        this._onViewLoadedTarget = null;
        this._onViewLoadedAction = null;
        this.view.setNeedsDisplay();
    };
    MUIViewController.prototype.onLoadView = function (target, action) {
        this._onViewLoadedTarget = target;
        this._onViewLoadedAction = action;
        if (this._viewIsLoaded == true) {
            action.call(target);
        }
        else if (this._layerIsReady == true) {
            this.viewDidLoad();
            this._loadChildControllers();
        }
    };
    MUIViewController.prototype.onLoadLayer = function (target, action) {
        if (this._layerIsReady == true) {
            action.call(target);
        }
        else {
            this._onLoadLayerTarget = action;
            this._onLoadLayerAction = target;
        }
    };
    Object.defineProperty(MUIViewController.prototype, "viewIsLoaded", {
        get: function () {
            return this._viewIsLoaded;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUIViewController.prototype, "childViewControllers", {
        get: function () {
            return this._childViewControllers;
        },
        enumerable: true,
        configurable: true
    });
    MUIViewController.prototype.addChildViewController = function (vc) {
        vc.parentViewController = this;
        this._childViewControllers.push(vc);
    };
    MUIViewController.prototype.removeChildViewController = function (vc) {
        var index = this._childViewControllers.indexOf(vc);
        if (index != -1) {
            this._childViewControllers.splice(index, 1);
            vc.parentViewController = null;
        }
    };
    Object.defineProperty(MUIViewController.prototype, "isPresented", {
        get: function () {
            if (this._presentationController != null)
                return this._presentationController.isPresented;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUIViewController.prototype, "presentationController", {
        get: function () {
            if (this._presentationController == null && this.parentViewController != null)
                return this.parentViewController.presentationController;
            return this._presentationController;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUIViewController.prototype, "popoverPresentationController", {
        get: function () {
            if (this._popoverPresentationController == null) {
                this._popoverPresentationController = new MUIPopoverPresentationController();
                this._popoverPresentationController.init();
                this._popoverPresentationController.presentedViewController = this;
            }
            this._presentationController = this._popoverPresentationController;
            return this._popoverPresentationController;
        },
        enumerable: true,
        configurable: true
    });
    MUIViewController.prototype.showViewController = function (vc, animate) {
        vc.onLoadView(this, function () {
            this.view.addSubview(vc.view);
            this.addChildViewController(vc);
            _MIUShowViewController(this, vc, this, false);
        });
    };
    MUIViewController.prototype.presentViewController = function (vc, animate) {
        var pc = vc.presentationController;
        if (pc == null) {
            pc = new MUIPresentationController();
            pc.init();
            pc.presentedViewController = vc;
            pc.presentingViewController = this;
            vc._presentationController = pc;
        }
        else if (pc.isPresented == true) {
            throw ("You try to present a view controller that is already presented");
        }
        if (vc.modalPresentationStyle != MUIModalPresentationStyle.FullScreen
            && vc.modalPresentationStyle != MUIModalPresentationStyle.FormSheet
            && vc.modalPresentationStyle != MUIModalPresentationStyle.PageSheet)
            vc.modalPresentationStyle = MUIModalPresentationStyle.PageSheet;
        vc.onLoadView(this, function () {
            if (vc.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext) {
                this.view.addSubview(vc.presentationController.presentedView);
                this.addChildViewController(vc);
            }
            else {
                var w = pc.window;
                if (w == null) {
                    w = new MUIWindow();
                    w.init();
                    w.layer.style.background = "";
                    w.rootViewController = vc;
                    w.addSubview(pc.presentedView);
                    pc.window = w;
                }
                w.setHidden(false);
            }
            _MIUShowViewController(this, vc, null, this, function () {
                w.makeKey();
            });
        });
    };
    MUIViewController.prototype.dismissViewController = function (animate) {
        var pc = this.presentationController;
        var toVC = pc.presentingViewController;
        var fromVC = pc.presentedViewController;
        var fromView = pc.presentedView;
        _MUIHideViewController(fromVC, toVC, null, this, function () {
            if (fromVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext) {
                toVC.removeChildViewController(fromVC);
                var pc = fromVC.presentationController;
                var view = pc.presentedView;
                view.removeFromSuperview();
            }
            else {
                var pc = fromVC.presentationController;
                var w = pc.window;
                w.setHidden(true);
            }
        });
    };
    MUIViewController.prototype.transitionFromViewControllerToViewController = function (fromVC, toVC, duration, animationType, target, completion) {
    };
    MUIViewController.prototype.viewDidLoad = function () { };
    MUIViewController.prototype.viewWillAppear = function (animated) {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewWillAppear(animated);
        }
        this.view.setViewIsVisible(true);
    };
    MUIViewController.prototype.viewDidAppear = function (animated) {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewDidAppear(animated);
        }
    };
    MUIViewController.prototype.viewWillDisappear = function (animated) {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewWillDisappear(animated);
        }
        this.view.setViewIsVisible(false);
    };
    MUIViewController.prototype.viewDidDisappear = function (animated) {
        for (var index = 0; index < this._childViewControllers.length; index++) {
            var vc = this._childViewControllers[index];
            vc.viewDidDisappear(animated);
        }
    };
    MUIViewController.prototype.contentHeight = function () {
        return this.view.getHeight();
    };
    MUIViewController.prototype.setContentSize = function (size) {
        this.willChangeValue("contentSize");
        this._contentSize = size;
        this.didChangeValue("contentSize");
    };
    Object.defineProperty(MUIViewController.prototype, "contentSize", {
        get: function () {
            return this._contentSize;
        },
        set: function (size) {
            this.setContentSize(size);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUIViewController.prototype, "preferredContentSize", {
        get: function () {
            return this._preferredContentSize;
        },
        set: function (size) {
            this.willChangeValue("preferredContentSize");
            this._preferredContentSize = size;
            this.didChangeValue("preferredContentSize");
        },
        enumerable: true,
        configurable: true
    });
    return MUIViewController;
}(MIOObject));
function MUIOutletRegister(owner, layerID, c) {
    owner._outlets[layerID] = c;
}
function MUIOutletQuery(owner, layerID) {
    return owner._outlets[layerID];
}
function MUIOutlet(owner, elementID, className, options) {
    var c = MUIOutletQuery(owner, elementID);
    if (c != null)
        return c;
    var layer = null;
    if (owner instanceof MUIView)
        layer = MUILayerSearchElementByID(owner.layer, elementID);
    else if (owner instanceof MUIViewController)
        layer = MUILayerSearchElementByID(owner.view.layer, elementID);
    if (layer == null)
        throw ("DIV identifier specified is not valid (" + elementID + ")");
    if (className == null)
        className = layer.getAttribute("data-class");
    if (className == null)
        className = "MUIView";
    var c = MIOClassFromString(className);
    c.initWithLayer(layer, owner, options);
    MUIOutletRegister(owner, elementID, c);
    if (owner instanceof MUIView)
        owner._linkViewToSubview(c);
    else if (owner instanceof MUIViewController) {
        if (c instanceof MUIView)
            owner.view._linkViewToSubview(c);
        else if (c instanceof MUIViewController)
            owner.addChildViewController(c);
        else
            throw ("MUIOutlet: Wrong type");
    }
    if (c instanceof MUIView)
        c.awakeFromHTML();
    return c;
}
function MUIWindowSize() {
    var w = document.body.clientWidth;
    var h = window.innerHeight;
    return new MIOSize(w, h);
}
function _MIUShowViewController(fromVC, toVC, sourceVC, target, completion) {
    toVC.viewWillAppear();
    if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
        || toVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext) {
        fromVC.viewWillDisappear();
    }
    var view = null;
    var pc = null;
    if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
        || toVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet
        || toVC.modalPresentationStyle == MUIModalPresentationStyle.FormSheet
        || toVC.modalPresentationStyle == MUIModalPresentationStyle.Custom
        || toVC.modalPresentationStyle == MUIModalPresentationStyle.Popover) {
        pc = toVC.presentationController;
        view = pc.presentedView;
    }
    else
        view = toVC.view;
    var animationContext = {};
    animationContext["presentingViewController"] = fromVC;
    animationContext["presentedViewController"] = toVC;
    animationContext["presentedView"] = view;
    if (pc != null)
        pc.presentationTransitionWillBegin();
    var ac = null;
    if (toVC.transitioningDelegate != null) {
        ac = toVC.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }
    else if (sourceVC != null && sourceVC.transitioningDelegate != null) {
        ac = sourceVC.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }
    else if (pc != null) {
        ac = pc.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }
    var layer = view.layer;
    _MUIAnimationStart(layer, ac, animationContext, this, function () {
        toVC.viewDidAppear();
        if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
            || toVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext) {
            fromVC.viewDidDisappear();
        }
        if (pc != null)
            pc.presentationTransitionDidEnd(true);
        if (target != null && completion != null)
            completion.call(target);
    });
}
function _MUIHideViewController(fromVC, toVC, sourceVC, target, completion) {
    if (fromVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
        || fromVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext
        || MIOCoreIsPhone() == true) {
        toVC.viewWillAppear();
    }
    fromVC.viewWillDisappear();
    var view = null;
    var pc = null;
    if (fromVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
        || fromVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet
        || fromVC.modalPresentationStyle == MUIModalPresentationStyle.FormSheet
        || fromVC.modalPresentationStyle == MUIModalPresentationStyle.Custom
        || fromVC.modalPresentationStyle == MUIModalPresentationStyle.Popover) {
        pc = fromVC.presentationController;
        view = pc.presentedView;
    }
    else
        view = fromVC.view;
    var ac = null;
    if (fromVC.transitioningDelegate != null) {
        ac = fromVC.transitioningDelegate.animationControllerForDismissedController(fromVC);
    }
    else if (sourceVC != null && sourceVC.transitioningDelegate != null) {
        ac = sourceVC.transitioningDelegate.animationControllerForDismissedController(fromVC);
    }
    else if (pc != null) {
        ac = pc.transitioningDelegate.animationControllerForDismissedController(fromVC);
    }
    var animationContext = {};
    animationContext["presentingViewController"] = fromVC;
    animationContext["presentedViewController"] = toVC;
    animationContext["presentedView"] = view;
    var layer = view.layer;
    if (pc != null)
        pc.dismissalTransitionWillBegin();
    _MUIAnimationStart(layer, ac, animationContext, this, function () {
        if (fromVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
            || fromVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext) {
            toVC.viewDidAppear();
        }
        fromVC.viewDidDisappear();
        if (pc != null)
            pc.dismissalTransitionDidEnd(true);
        if (target != null && completion != null)
            completion.call(target);
    });
}
function _MUITransitionFromViewControllerToViewController(fromVC, toVC, sourceVC, target, completion) {
    toVC.viewWillAppear();
    fromVC.viewWillDisappear();
    var ac = null;
    if (toVC.transitioningDelegate != null) {
        ac = toVC.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }
    else if (sourceVC != null && sourceVC.transitioningDelegate != null) {
        ac = sourceVC.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }
    var animationContext = {};
    animationContext["presentingViewController"] = fromVC;
    animationContext["presentedViewController"] = toVC;
    animationContext["presentedView"] = toVC;
    var layer = toVC.view.layer;
    _MUIAnimationStart(layer, ac, animationContext, this, function () {
        toVC.viewDidAppear();
        fromVC.viewDidDisappear();
        if (target != null && completion != null)
            completion.call(target);
    });
}
var MUIControl = (function (_super) {
    __extends(MUIControl, _super);
    function MUIControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.enabled = true;
        _this.mouseOverTarget = null;
        _this.mouseOverAction = null;
        _this.mouseOutTarget = null;
        _this.mouseOutAction = null;
        return _this;
    }
    MUIControl.prototype.setEnabled = function (enabled) {
        this.enabled = enabled;
        if (enabled == true)
            this.layer.style.opacity = "1.0";
        else
            this.layer.style.opacity = "0.10";
    };
    MUIControl.prototype.setOnMouseOverAction = function (target, action) {
        this.mouseOverTarget = target;
        this.mouseOverAction = action;
        var instance = this;
        this.layer.onmouseover = function () {
            if (instance.enabled)
                instance.mouseOverAction.call(target);
        };
    };
    MUIControl.prototype.setOnMouseOutAction = function (target, action) {
        this.mouseOutTarget = target;
        this.mouseOutAction = action;
        var instance = this;
        this.layer.onmouseout = function () {
            if (instance.enabled)
                instance.mouseOutAction.call(target);
        };
    };
    return MUIControl;
}(MUIView));
var MUIButtonType;
(function (MUIButtonType) {
    MUIButtonType[MUIButtonType["MomentaryPushIn"] = 0] = "MomentaryPushIn";
    MUIButtonType[MUIButtonType["PushOnPushOff"] = 1] = "PushOnPushOff";
    MUIButtonType[MUIButtonType["PushIn"] = 2] = "PushIn";
})(MUIButtonType || (MUIButtonType = {}));
var MUIButton = (function (_super) {
    __extends(MUIButton, _super);
    function MUIButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._statusStyle = null;
        _this._titleStatusStyle = null;
        _this._titleLayer = null;
        _this._imageStatusStyle = null;
        _this._imageLayer = null;
        _this.target = null;
        _this.action = null;
        _this._selected = false;
        _this.type = MUIButtonType.MomentaryPushIn;
        return _this;
    }
    MUIButton.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        var opts = options != null ? options : {};
        var type = this.layer.getAttribute("data-type");
        if (type == "MomentaryPushIn")
            this.type = MUIButtonType.MomentaryPushIn;
        else if (type == "PushOnPushOff")
            this.type = MUIButtonType.PushOnPushOff;
        else if (type == "PushIn")
            this.type = MUIButtonType.PushIn;
        this._statusStyle = this.layer.getAttribute("data-status-style-prefix");
        if (this._statusStyle == null && opts["status-style-prefix"] != null)
            this._statusStyle = opts["status-style-prefix"] + "_status";
        this._titleLayer = MUILayerGetFirstElementWithTag(this.layer, "SPAN");
        if (this._titleLayer == null) {
            this._titleLayer = document.createElement("span");
            this.layer.appendChild(this._titleLayer);
        }
        if (this._titleLayer != null) {
            this._titleStatusStyle = this._titleLayer.getAttribute("data-status-style-prefix");
            if (this._titleStatusStyle == null && opts["status-style-prefix"] != null)
                this._titleStatusStyle = opts["status-style-prefix"] + "_title_status";
        }
        var key = this.layer.getAttribute("data-title");
        if (key != null)
            this.setTitle(MIOLocalizeString(key, key));
        this._imageLayer = MUILayerGetFirstElementWithTag(this.layer, "DIV");
        if (this._imageLayer != null) {
            this._imageStatusStyle = this._imageLayer.getAttribute("data-status-style-prefix");
            if (this._imageStatusStyle == null && opts["status-style-prefix"] != null)
                this._imageStatusStyle = opts["status-style-prefix"] + "_image_status";
        }
        var status = this.layer.getAttribute("data-status");
        if (status == "selected")
            this.setSelected(true);
        this.layer.addEventListener("click", function (e) {
            e.stopPropagation();
        });
        var instance = this;
        this.layer.addEventListener("mousedown", function (e) {
            e.stopPropagation();
            if (instance.enabled) {
                if (instance.type == MUIButtonType.PushOnPushOff)
                    instance.setSelected(!instance._selected);
                else
                    instance.setSelected(true);
            }
        });
        this.layer.addEventListener("mouseup", function (e) {
            e.stopPropagation();
            if (instance.enabled) {
                if (instance.type == MUIButtonType.MomentaryPushIn)
                    instance.setSelected(false);
                if (instance.action != null && instance.target != null)
                    instance.action.call(instance.target, instance);
            }
        });
    };
    MUIButton.prototype.initWithAction = function (target, action) {
        _super.prototype.init.call(this);
        this.setAction(target, action);
    };
    MUIButton.prototype.setAction = function (target, action) {
        this.target = target;
        this.action = action;
    };
    MUIButton.prototype.setTitle = function (title) {
        this._titleLayer.innerHTML = title;
    };
    Object.defineProperty(MUIButton.prototype, "title", {
        get: function () {
            return this._titleLayer.innerHTML;
        },
        set: function (title) {
            this.setTitle(title);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUIButton.prototype, "selected", {
        get: function () {
            return this._selected;
        },
        enumerable: true,
        configurable: true
    });
    MUIButton.prototype.setSelected = function (value) {
        if (this._selected == value)
            return;
        if (value == true) {
            if (this._statusStyle != null) {
                this.layer.classList.remove(this._statusStyle + "_off");
                this.layer.classList.add(this._statusStyle + "_on");
            }
            if (this._imageLayer != null && this._imageStatusStyle != null) {
                this._imageLayer.classList.remove(this._imageStatusStyle + "_off");
                this._imageLayer.classList.add(this._imageStatusStyle + "_on");
            }
            if (this._titleLayer != null && this._titleStatusStyle != null) {
                this._titleLayer.classList.remove(this._titleStatusStyle + "_off");
                this._titleLayer.classList.add(this._titleStatusStyle + "_on");
            }
            if (this._statusStyle == null && this._titleStatusStyle == null && this._imageStatusStyle == null)
                this.setAlpha(0.35);
        }
        else {
            if (this._statusStyle != null) {
                this.layer.classList.remove(this._statusStyle + "_on");
                this.layer.classList.add(this._statusStyle + "_off");
            }
            if (this._imageLayer != null && this._imageStatusStyle != null) {
                this._imageLayer.classList.remove(this._imageStatusStyle + "_on");
                this._imageLayer.classList.add(this._imageStatusStyle + "_off");
            }
            if (this._titleLayer != null && this._titleStatusStyle != null) {
                this._titleLayer.classList.remove(this._titleStatusStyle + "_on");
                this._titleLayer.classList.add(this._titleStatusStyle + "_off");
            }
            if (this._statusStyle == null && this._titleStatusStyle == null && this._imageStatusStyle == null)
                this.setAlpha(1);
        }
        this._selected = value;
    };
    return MUIButton;
}(MUIControl));
var MUITabBarItem = (function (_super) {
    __extends(MUITabBarItem, _super);
    function MUITabBarItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MUITabBarItem;
}(MUIButton));
var MUITabBar = (function (_super) {
    __extends(MUITabBar, _super);
    function MUITabBar() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.items = [];
        _this.selectedTabBarItemIndex = -1;
        _this._itemsByIdentifier = {};
        return _this;
    }
    MUITabBar.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        var opts = {};
        var sp = layer.getAttribute("data-status-style-prefix");
        if (sp != null)
            opts["status-style-prefix"] = sp;
        for (var index = 0; index < this.layer.childNodes.length; index++) {
            var tabItemLayer = this.layer.childNodes[index];
            if (tabItemLayer.tagName == "DIV") {
                var ti = new MUITabBarItem();
                ti.initWithLayer(tabItemLayer, owner, opts);
                ti.type = MUIButtonType.PushIn;
                this._addTabBarItem(ti);
                MUIOutletRegister(owner, ti.layerID, ti);
            }
        }
        if (this.items.length > 0)
            this.selectTabBarItemAtIndex(0);
    };
    MUITabBar.prototype._addTabBarItem = function (item) {
        this.items.push(item);
        var instance = this;
        item.layer.onclick = function () {
            instance.selectTabBarItem.call(instance, item);
        };
    };
    MUITabBar.prototype.addTabBarItem = function (item) {
        this._addTabBarItem(item);
        this.addSubview(item);
    };
    MUITabBar.prototype.selectTabBarItem = function (item) {
        var index = this.items.indexOf(item);
        if (index == this.selectedTabBarItemIndex)
            return;
        if (this.selectedTabBarItemIndex > -1) {
            var lastItem = this.items[this.selectedTabBarItemIndex];
            lastItem.setSelected(false);
        }
        item.setSelected(true);
        this.willChangeValue("selectedTabBarItemIndex");
        this.selectedTabBarItemIndex = index;
        this.didChangeValue("selectedTabBarItemIndex");
    };
    MUITabBar.prototype.selectTabBarItemAtIndex = function (index) {
        var item = this.items[index];
        this.selectTabBarItem(item);
    };
    MUITabBar.prototype.layout = function () {
        var len = this.items.length;
        var width = this.getWidth();
        var w = width / len;
        var x = 0;
        for (var index = 0; index < this.items.length; index++) {
            var item = this.items[index];
            if (item.hidden == true)
                continue;
            item.setFrame(MIORect.rectWithValues(x, 0, w, this.getHeight()));
            x += w;
        }
    };
    return MUITabBar;
}(MUIView));
var MUIImageView = (function (_super) {
    __extends(MUIImageView, _super);
    function MUIImageView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._imageLayer = null;
        return _this;
    }
    MUIImageView.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        this._imageLayer = MUILayerGetFirstElementWithTag(this.layer, "IMG");
        if (this._imageLayer == null) {
            this._imageLayer = document.createElement("img");
            this._imageLayer.style.width = "100%";
            this._imageLayer.style.height = "100%";
            this.layer.appendChild(this._imageLayer);
        }
    };
    MUIImageView.prototype.setImage = function (imageURL) {
        this._imageLayer.setAttribute("src", imageURL);
    };
    return MUIImageView;
}(MUIView));
var MUILabel = (function (_super) {
    __extends(MUILabel, _super);
    function MUILabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._textLayer = null;
        _this.autoAdjustFontSize = "none";
        _this.autoAdjustFontSizeValue = 4;
        return _this;
    }
    MUILabel.prototype.init = function () {
        _super.prototype.init.call(this);
        this.layer.style.background = "";
        this._setupLayer();
    };
    MUILabel.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        this._textLayer = MUILayerGetFirstElementWithTag(this.layer, "SPAN");
        this._setupLayer();
    };
    MUILabel.prototype._setupLayer = function () {
        if (this._textLayer == null) {
            this.layer.innerHTML = "";
            this._textLayer = document.createElement("span");
            this._textLayer.style.top = "3px";
            this._textLayer.style.left = "3px";
            this._textLayer.style.right = "3px";
            this._textLayer.style.bottom = "3px";
            this.layer.appendChild(this._textLayer);
        }
    };
    MUILabel.prototype.setText = function (text) {
        this.text = text;
    };
    Object.defineProperty(MUILabel.prototype, "text", {
        set: function (text) {
            this._textLayer.innerHTML = text != null ? text : "";
        },
        enumerable: true,
        configurable: true
    });
    MUILabel.prototype.setTextAlignment = function (alignment) {
        this.layer.style.textAlign = alignment;
    };
    MUILabel.prototype.setHightlighted = function (value) {
        if (value == true) {
            this._textLayer.classList.add("label_highlighted_color");
        }
        else {
            this._textLayer.classList.remove("label_highlighted_color");
        }
    };
    MUILabel.prototype.setTextRGBColor = function (r, g, b) {
        var value = "rgb(" + r + ", " + g + ", " + b + ")";
        this._textLayer.style.color = value;
    };
    MUILabel.prototype.setFontSize = function (size) {
        this._textLayer.style.fontSize = size + "px";
    };
    MUILabel.prototype.setFontStyle = function (style) {
        this._textLayer.style.fontWeight = style;
    };
    MUILabel.prototype.setFontFamily = function (fontFamily) {
        this._textLayer.style.fontFamily = fontFamily;
    };
    return MUILabel;
}(MUIView));
var MUITextFieldType;
(function (MUITextFieldType) {
    MUITextFieldType[MUITextFieldType["NormalType"] = 0] = "NormalType";
    MUITextFieldType[MUITextFieldType["PasswordType"] = 1] = "PasswordType";
    MUITextFieldType[MUITextFieldType["SearchType"] = 2] = "SearchType";
})(MUITextFieldType || (MUITextFieldType = {}));
var MUITextField = (function (_super) {
    __extends(MUITextField, _super);
    function MUITextField() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.placeHolder = null;
        _this._inputLayer = null;
        _this.type = MUITextFieldType.NormalType;
        _this.textChangeTarget = null;
        _this.textChangeAction = null;
        _this._textChangeFn = null;
        _this.enterPressTarget = null;
        _this.enterPressAction = null;
        _this.keyPressTarget = null;
        _this.keyPressAction = null;
        _this.formatter = null;
        _this.didEditingAction = null;
        _this.didEditingTarget = null;
        return _this;
    }
    MUITextField.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setupLayer();
    };
    MUITextField.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        this._inputLayer = MUILayerGetFirstElementWithTag(this.layer, "INPUT");
        this._setupLayer();
    };
    MUITextField.prototype._setupLayer = function () {
        if (this._inputLayer == null) {
            this._inputLayer = document.createElement("input");
            if (this.type == MUITextFieldType.SearchType) {
                this._inputLayer.style.marginLeft = "10px";
                this._inputLayer.style.marginRight = "10px";
            }
            else {
                this._inputLayer.style.marginLeft = "5px";
                this._inputLayer.style.marginRight = "5px";
            }
            this._inputLayer.style.border = "0px";
            this._inputLayer.style.backgroundColor = "transparent";
            this._inputLayer.style.width = "100%";
            this._inputLayer.style.height = "100%";
            this._inputLayer.style.color = "inherit";
            this._inputLayer.style.fontSize = "inherit";
            this._inputLayer.style.fontFamily = "inherit";
            this._inputLayer.style.outline = "none";
            this.layer.appendChild(this._inputLayer);
        }
        var placeholderKey = this.layer.getAttribute("data-placeholder");
        if (placeholderKey != null)
            this._inputLayer.setAttribute("placeholder", MIOLocalizeString(placeholderKey, placeholderKey));
        this._registerInputEvent();
    };
    MUITextField.prototype.layoutSubviews = function () {
        _super.prototype.layoutSubviews.call(this);
        var w = this.getWidth();
        var h = this.getHeight();
        this._inputLayer.style.marginLeft = "4px";
        this._inputLayer.style.width = (w - 8) + "px";
        this._inputLayer.style.marginTop = "4px";
        this._inputLayer.style.height = (h - 8) + "px";
    };
    MUITextField.prototype.setText = function (text) {
        this.text = text;
    };
    Object.defineProperty(MUITextField.prototype, "text", {
        get: function () {
            return this._inputLayer.value;
        },
        set: function (text) {
            var newValue = text != null ? text : "";
            this._inputLayer.value = newValue;
        },
        enumerable: true,
        configurable: true
    });
    MUITextField.prototype.setPlaceholderText = function (text) {
        this.placeHolder = text;
        this._inputLayer.setAttribute("placeholder", text);
    };
    MUITextField.prototype.setOnChangeText = function (target, action) {
        this.textChangeTarget = target;
        this.textChangeAction = action;
    };
    MUITextField.prototype._registerInputEvent = function () {
        var instance = this;
        this._textChangeFn = function () {
            if (instance.enabled)
                instance._textDidChange.call(instance);
        };
        this.layer.addEventListener("input", this._textChangeFn);
    };
    MUITextField.prototype._unregisterInputEvent = function () {
        this.layer.removeEventListener("input", this._textChangeFn);
    };
    MUITextField.prototype._textDidChange = function () {
        if (this.enabled == false)
            return;
        var value = this._inputLayer.value;
        if (this.formatter == null) {
            this._textDidChangeDelegate(value);
        }
        else {
            var result, newStr;
            _a = this.formatter.isPartialStringValid(value), result = _a[0], newStr = _a[1];
            this._unregisterInputEvent();
            this._inputLayer.value = newStr;
            this._registerInputEvent();
            if (result == true) {
                this._textDidChangeDelegate(value);
            }
        }
        var _a;
    };
    MUITextField.prototype._textDidChangeDelegate = function (value) {
        if (this.textChangeAction != null && this.textChangeTarget != null)
            this.textChangeAction.call(this.textChangeTarget, this, value);
    };
    MUITextField.prototype.setOnEnterPress = function (target, action) {
        this.enterPressTarget = target;
        this.enterPressAction = action;
        var instance = this;
        this.layer.onkeyup = function (e) {
            if (instance.enabled) {
                if (e.keyCode == 13)
                    instance.enterPressAction.call(target, instance, instance._inputLayer.value);
            }
        };
    };
    MUITextField.prototype.setOnKeyPress = function (target, action) {
        this.keyPressTarget = target;
        this.keyPressAction = action;
        var instance = this;
        this.layer.onkeydown = function (e) {
            if (instance.enabled) {
                instance.keyPressAction.call(target, instance, e.keyCode);
            }
        };
    };
    MUITextField.prototype.setOnDidEditing = function (target, action) {
        this.didEditingTarget = target;
        this.didEditingAction = action;
        var instance = this;
        this._inputLayer.onblur = function (e) {
            if (instance.enabled) {
                instance.didEditingAction.call(target, instance, instance.text);
            }
        };
    };
    MUITextField.prototype.setTextRGBColor = function (r, g, b) {
        var value = "rgb(" + r + ", " + g + ", " + b + ")";
        this._inputLayer.style.color = value;
    };
    Object.defineProperty(MUITextField.prototype, "textColor", {
        get: function () {
            var color = this._getValueFromCSSProperty("color");
            return color;
        },
        set: function (color) {
            this._inputLayer.style.color = color;
        },
        enumerable: true,
        configurable: true
    });
    MUITextField.prototype.becomeFirstResponder = function () {
        this._inputLayer.focus();
    };
    return MUITextField;
}(MUIControl));
var MUITextArea = (function (_super) {
    __extends(MUITextArea, _super);
    function MUITextArea() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.textareaLayer = null;
        _this.textChangeTarget = null;
        _this.textChangeAction = null;
        return _this;
    }
    MUITextArea.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        this.textareaLayer = document.createElement("textarea");
        this.textareaLayer.style.width = "98%";
        this.textareaLayer.style.height = "90%";
        this.textareaLayer.style.resize = "none";
        this.textareaLayer.style.borderStyle = "none";
        this.textareaLayer.style.borderColor = "transparent";
        this.textareaLayer.style.outline = "none";
        this.textareaLayer.overflow = "auto";
        this.layer.appendChild(this.textareaLayer);
    };
    Object.defineProperty(MUITextArea.prototype, "text", {
        get: function () {
            return this.textareaLayer.value;
        },
        set: function (text) {
            this.textareaLayer.value = text;
        },
        enumerable: true,
        configurable: true
    });
    MUITextArea.prototype.setText = function (text) {
        this.text = text;
    };
    MUITextArea.prototype.getText = function () {
        return this.text;
    };
    MUITextArea.prototype.setEditMode = function (value) {
        this.textareaLayer.disabled = !value;
    };
    MUITextArea.prototype.setOnChangeText = function (target, action) {
        this.textChangeTarget = target;
        this.textChangeAction = action;
        var instance = this;
        this.layer.oninput = function () {
            if (instance.enabled) {
                var value = instance.textareaLayer.value;
                instance.textChangeAction.call(target, instance, value);
            }
        };
    };
    return MUITextArea;
}(MUIControl));
var MUIScrollView = (function (_super) {
    __extends(MUIScrollView, _super);
    function MUIScrollView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.pagingEnabled = false;
        _this.delegate = null;
        _this.scrolling = false;
        _this._showsVerticalScrollIndicator = true;
        _this._scrollEnable = true;
        _this.scrollTimer = null;
        _this.lastOffsetY = 0;
        _this.contentView = null;
        return _this;
    }
    Object.defineProperty(MUIScrollView.prototype, "showsVerticalScrollIndicator", {
        get: function () { return this._showsVerticalScrollIndicator; },
        set: function (value) { this.setShowsVerticalScrollIndicator(value); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUIScrollView.prototype, "scrollEnable", {
        get: function () { return this._scrollEnable; },
        set: function (value) { this.setScrollEnable(value); },
        enumerable: true,
        configurable: true
    });
    MUIScrollView.prototype.init = function () {
        _super.prototype.init.call(this);
        this.setupLayer();
    };
    MUIScrollView.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        this.setupLayer();
    };
    MUIScrollView.prototype.setupLayer = function () {
        this.layer.style.overflow = "scroll";
        var contentLayer = MUICoreLayerCreate();
        contentLayer.style.width = "100%";
        contentLayer.style.height = "100%";
        contentLayer.style.overflow = "hidden";
        this.contentView = new MUIView();
        this.contentView.initWithLayer(contentLayer, this);
        _super.prototype.addSubview.call(this, this.contentView);
        var instance = this;
        this.contentView.layer.onscroll = function (e) {
            instance.scrollEventCallback.call(instance, e);
        };
        this.contentView.layer.onwheel = function (e) {
            instance.scrollEventCallback.call(instance, e);
        };
    };
    MUIScrollView.prototype.scrollEventCallback = function (event) {
        this.setNeedsDisplay();
        if (this.scrolling == false) {
            this.scrolling = true;
            this.didStartScroll();
        }
        if (this.scrollTimer != null)
            this.scrollTimer.invalidate();
        this.scrollTimer = MIOTimer.scheduledTimerWithTimeInterval(150, false, this, this.scrollEventStopCallback);
        var offsetY = this.contentOffset.y;
        var deltaY = 0;
        if (offsetY < this.lastOffsetY)
            deltaY = offsetY - this.lastOffsetY;
        else if (offsetY > this.lastOffsetY)
            deltaY = this.lastOffsetY + offsetY;
        this.didScroll(0, deltaY);
        this.lastOffsetY = this.contentOffset.y;
        if (this.delegate != null && typeof this.delegate.scrollViewDidScroll === "function")
            this.delegate.scrollViewDidScroll.call(this.delegate, this);
    };
    MUIScrollView.prototype.scrollEventStopCallback = function (timer) {
        this.scrolling = false;
        this.didStopScroll();
    };
    MUIScrollView.prototype.didStartScroll = function () {
    };
    MUIScrollView.prototype.didScroll = function (deltaX, deltaY) {
    };
    MUIScrollView.prototype.didStopScroll = function () {
    };
    MUIScrollView.prototype.setScrollEnable = function (value) {
        if (this._scrollEnable == value)
            return;
        this._scrollEnable = value;
        if (value == true) {
            this.contentView.layer.style.overflow = "scroll";
        }
        else {
            this.contentView.layer.style.overflow = "hidden";
        }
    };
    MUIScrollView.prototype.setShowsVerticalScrollIndicator = function (value) {
        if (value == this._showsVerticalScrollIndicator)
            return;
        this._showsVerticalScrollIndicator = value;
        if (value == false) {
            this.layer.style.paddingRight = "20px";
        }
        else {
            this.layer.style.paddingRight = "";
        }
    };
    Object.defineProperty(MUIScrollView.prototype, "contentOffset", {
        get: function () {
            var p = new MIOPoint(this.layer.scrollLeft, this.layer.scrollTop);
            return p;
        },
        set: function (point) {
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUIScrollView.prototype, "bounds", {
        get: function () {
            var p = this.contentOffset;
            return MIORect.rectWithValues(p.x, p.y, this.getWidth(), this.getHeight());
        },
        enumerable: true,
        configurable: true
    });
    MUIScrollView.prototype.addSubview = function (view, index) {
        this.contentView.addSubview(view, index);
    };
    Object.defineProperty(MUIScrollView.prototype, "contentSize", {
        set: function (size) {
            if (size.width > 0) {
                this.contentView.setWidth(size.width);
            }
            if (size.height > 0) {
                this.contentView.setHeight(size.height);
            }
        },
        enumerable: true,
        configurable: true
    });
    MUIScrollView.prototype.layoutSubviews = function () {
        this.contentView.layoutSubviews();
    };
    MUIScrollView.prototype.scrollToTop = function (animate) {
        this.layer.scrollTop = 0;
    };
    MUIScrollView.prototype.scrollToBottom = function (animate) {
        this.layer.scrollTop = this.layer.scrollHeight;
    };
    MUIScrollView.prototype.scrollToPoint = function (x, y, animate) {
        this.layer.scrollTop = y;
        this.lastOffsetY = y;
    };
    MUIScrollView.prototype.scrollRectToVisible = function (rect, animate) {
    };
    return MUIScrollView;
}(MUIView));
var MUITableViewCellStyle;
(function (MUITableViewCellStyle) {
    MUITableViewCellStyle[MUITableViewCellStyle["Custom"] = 0] = "Custom";
    MUITableViewCellStyle[MUITableViewCellStyle["Default"] = 1] = "Default";
})(MUITableViewCellStyle || (MUITableViewCellStyle = {}));
var MUITableViewCellAccessoryType;
(function (MUITableViewCellAccessoryType) {
    MUITableViewCellAccessoryType[MUITableViewCellAccessoryType["None"] = 0] = "None";
    MUITableViewCellAccessoryType[MUITableViewCellAccessoryType["DisclosureIndicator"] = 1] = "DisclosureIndicator";
    MUITableViewCellAccessoryType[MUITableViewCellAccessoryType["DetailDisclosureButton"] = 2] = "DetailDisclosureButton";
    MUITableViewCellAccessoryType[MUITableViewCellAccessoryType["Checkmark"] = 3] = "Checkmark";
})(MUITableViewCellAccessoryType || (MUITableViewCellAccessoryType = {}));
var MIOTableViewCellEditingStyle;
(function (MIOTableViewCellEditingStyle) {
    MIOTableViewCellEditingStyle[MIOTableViewCellEditingStyle["None"] = 0] = "None";
    MIOTableViewCellEditingStyle[MIOTableViewCellEditingStyle["Delete"] = 1] = "Delete";
    MIOTableViewCellEditingStyle[MIOTableViewCellEditingStyle["Insert"] = 2] = "Insert";
})(MIOTableViewCellEditingStyle || (MIOTableViewCellEditingStyle = {}));
var MUITableViewCellSeparatorStyle;
(function (MUITableViewCellSeparatorStyle) {
    MUITableViewCellSeparatorStyle[MUITableViewCellSeparatorStyle["None"] = 0] = "None";
    MUITableViewCellSeparatorStyle[MUITableViewCellSeparatorStyle["SingleLine"] = 1] = "SingleLine";
    MUITableViewCellSeparatorStyle[MUITableViewCellSeparatorStyle["SingleLineEtched"] = 2] = "SingleLineEtched";
})(MUITableViewCellSeparatorStyle || (MUITableViewCellSeparatorStyle = {}));
var MUITableViewCellSelectionStyle;
(function (MUITableViewCellSelectionStyle) {
    MUITableViewCellSelectionStyle[MUITableViewCellSelectionStyle["None"] = 0] = "None";
    MUITableViewCellSelectionStyle[MUITableViewCellSelectionStyle["Default"] = 1] = "Default";
})(MUITableViewCellSelectionStyle || (MUITableViewCellSelectionStyle = {}));
var MUITableViewCell = (function (_super) {
    __extends(MUITableViewCell, _super);
    function MUITableViewCell() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.reuseIdentifier = null;
        _this.nodeID = null;
        _this.contentView = null;
        _this.style = MUITableViewCellStyle.Custom;
        _this.textLabel = null;
        _this.accessoryType = MUITableViewCellAccessoryType.None;
        _this.accessoryView = null;
        _this.separatorStyle = MUITableViewCellSeparatorStyle.SingleLine;
        _this.selectionStyle = MUITableViewCellSelectionStyle.Default;
        _this._selected = false;
        _this._editing = false;
        _this.editingAccessoryType = MUITableViewCellAccessoryType.None;
        _this.editingAccesoryView = null;
        _this._target = null;
        _this._onClickFn = null;
        _this._onDblClickFn = null;
        _this._onAccessoryClickFn = null;
        _this._row = 0;
        _this._section = 0;
        return _this;
    }
    MUITableViewCell.prototype.initWithStyle = function (style) {
        _super.prototype.init.call(this);
        this.style = style;
        if (style == MUITableViewCellStyle.Default) {
            this.textLabel = new MUILabel();
            this.textLabel.init();
            this.textLabel.layer.style.top = "";
            this.textLabel.layer.style.left = "";
            this.textLabel.layer.style.width = "";
            this.textLabel.layer.style.height = "";
            this.textLabel.layer.classList.add("tableviewcell_default_textlabel");
            this.addSubview(this.textLabel);
            this.layer.style.height = "44px";
        }
        this._setupLayer();
    };
    MUITableViewCell.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        this._setupLayer();
    };
    MUITableViewCell.prototype._setupLayer = function () {
        this.layer.style.background = "";
        var instance = this;
        this.layer.classList.add("tableviewcell_deselected_color");
        this.layer.onclick = function (e) {
            if (instance._onClickFn != null) {
                e.stopPropagation();
                instance._onClickFn.call(instance._target, instance);
            }
        };
        this.layer.ondblclick = function (e) {
            if (instance._onDblClickFn != null) {
                e.stopPropagation();
                instance._onDblClickFn.call(instance._target, instance);
            }
        };
    };
    MUITableViewCell.prototype.setAccessoryType = function (type) {
        if (type == this.accessoryType)
            return;
        if (this.accessoryView == null) {
            if (this.style == MUITableViewCellStyle.Default)
                this.textLabel.layer.style.right = "25px";
            var layer = document.createElement("div");
            layer.style.position = "absolute";
            layer.style.top = "15px";
            layer.style.right = "5px";
            layer.style.width = "15px";
            layer.style.height = "15px";
            this.accessoryView = new MUIView("accessory_view");
            this.accessoryView.initWithLayer(layer);
            this.addSubview(this.accessoryView);
        }
        if (this.accessoryType == MUITableViewCellAccessoryType.Checkmark)
            this.accessoryView.layer.classList.remove("tableviewcell_accessory_checkmark");
        else if (this.accessoryType == MUITableViewCellAccessoryType.DisclosureIndicator)
            this.accessoryView.layer.classList.remove("tableviewcell_accessory_disclosure_indicator");
        else if (this.accessoryType == MUITableViewCellAccessoryType.DetailDisclosureButton)
            this.accessoryView.layer.classList.remove("tableviewcell_accessory_detail_disclosure_button");
        if (type == MUITableViewCellAccessoryType.Checkmark)
            this.accessoryView.layer.classList.add("tableviewcell_accessory_checkmark");
        else if (type == MUITableViewCellAccessoryType.DisclosureIndicator)
            this.accessoryView.layer.classList.add("tableviewcell_accessory_disclosure_indicator");
        else if (type == MUITableViewCellAccessoryType.DetailDisclosureButton)
            this.accessoryView.layer.classList.add("tableviewcell_accessory_detail_disclosure_button");
        this.accessoryType = type;
    };
    MUITableViewCell.prototype.setPaddingIndex = function (value) {
        var offset = (value + 1) * 10;
        if (this.style == MUITableViewCellStyle.Default)
            this.textLabel.setX(offset);
    };
    MUITableViewCell.prototype.setHeight = function (h) {
        _super.prototype.setHeight.call(this, h);
        var offsetY = (h - 15) / 2;
        if (this.accessoryView != null) {
            this.accessoryView.layer.style.top = offsetY + "px";
        }
    };
    MUITableViewCell.prototype.setSelected = function (value) {
        if (this._selected == value)
            return;
        this.willChangeValue("selected");
        this._selected = value;
        if (this.selectionStyle == MUITableViewCellSelectionStyle.Default) {
            if (value == true) {
                this.layer.classList.remove("tableviewcell_deselected_color");
                this.layer.classList.add("tableviewcell_selected_color");
            }
            else {
                this.layer.classList.remove("tableviewcell_selected_color");
                this.layer.classList.add("tableviewcell_deselected_color");
            }
            this._setHightlightedSubviews(value);
        }
        this.didChangeValue("selected");
    };
    Object.defineProperty(MUITableViewCell.prototype, "selected", {
        get: function () {
            return this._selected;
        },
        set: function (value) {
            this.setSelected(value);
        },
        enumerable: true,
        configurable: true
    });
    MUITableViewCell.prototype._setHightlightedSubviews = function (value) {
        for (var count = 0; count < this.subviews.length; count++) {
            var v = this.subviews[count];
            if (v instanceof MUILabel)
                v.setHightlighted(value);
        }
        if (this.accessoryView == null)
            return;
        if (value == true) {
            switch (this.accessoryType) {
                case MUITableViewCellAccessoryType.DisclosureIndicator:
                    this.accessoryView.layer.classList.remove("tableviewcell_accessory_disclosure_indicator");
                    this.accessoryView.layer.classList.add("tableviewcell_accessory_disclosure_indicator_highlighted");
                    break;
            }
        }
        else {
            switch (this.accessoryType) {
                case MUITableViewCellAccessoryType.DisclosureIndicator:
                    this.accessoryView.layer.classList.remove("tableviewcell_accessory_disclosure_indicator_highlighted");
                    this.accessoryView.layer.classList.add("tableviewcell_accessory_disclosure_indicator");
                    break;
            }
        }
    };
    MUITableViewCell.prototype.setEditing = function (editing, animated) {
        if (editing == this._editing)
            return;
        this._editing = editing;
        if (this.editingAccesoryView == null) {
            if (this.style == MUITableViewCellStyle.Default)
                this.textLabel.layer.style.left = "25px";
            var layer = document.createElement("div");
            layer.style.position = "absolute";
            var btn = new MUIView();
            btn.init();
            btn.layer.style.top = "";
            btn.layer.style.right = "";
            btn.layer.style.width = "";
            btn.layer.style.height = "100%";
            btn.layer.classList.add("tableviewcell_accessory_delete");
            var instance = this;
            btn.layer.onclick = function (e) {
                if (instance._onAccessoryClickFn != null) {
                    e.stopPropagation();
                    instance._onAccessoryClickFn.call(instance._target, instance);
                }
            };
            this.editingAccesoryView = btn;
            this.addSubview(this.editingAccesoryView);
        }
        else {
            this.editingAccesoryView.removeFromSuperview();
        }
    };
    Object.defineProperty(MUITableViewCell.prototype, "editing", {
        set: function (value) {
            this.setEditing(value, false);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUITableViewCell.prototype, "isEditing", {
        get: function () {
            return this._editing;
        },
        enumerable: true,
        configurable: true
    });
    return MUITableViewCell;
}(MUIView));
var MUITableViewSection = (function (_super) {
    __extends(MUITableViewSection, _super);
    function MUITableViewSection() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.header = null;
        _this.title = null;
        _this.rows = 0;
        _this.cells = [];
        return _this;
    }
    MUITableViewSection.headerWithTitle = function (title, height) {
        var header = new MUIView();
        header.init();
        header.setHeight(height);
        header.layer.style.background = "";
        header.layer.classList.add("tableview_header");
        var titleLabel = new MUILabel();
        titleLabel.init();
        titleLabel.layer.style.background = "";
        titleLabel.layer.classList.add("tableview_header_title");
        titleLabel.text = title;
        header.addSubview(titleLabel);
        return header;
    };
    return MUITableViewSection;
}(MIOObject));
var MUITableViewRowType;
(function (MUITableViewRowType) {
    MUITableViewRowType[MUITableViewRowType["Header"] = 0] = "Header";
    MUITableViewRowType[MUITableViewRowType["SectionHeader"] = 1] = "SectionHeader";
    MUITableViewRowType[MUITableViewRowType["Cell"] = 2] = "Cell";
    MUITableViewRowType[MUITableViewRowType["SectionFooter"] = 3] = "SectionFooter";
    MUITableViewRowType[MUITableViewRowType["Footer"] = 4] = "Footer";
})(MUITableViewRowType || (MUITableViewRowType = {}));
var MUITableViewRow = (function (_super) {
    __extends(MUITableViewRow, _super);
    function MUITableViewRow() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.view = null;
        _this.height = 0;
        return _this;
    }
    MUITableViewRow.prototype.initWithType = function (type) {
        this.type = type;
    };
    return MUITableViewRow;
}(MIOObject));
var MUITableViewCellNode = (function (_super) {
    __extends(MUITableViewCellNode, _super);
    function MUITableViewCellNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.identifier = null;
        _this.section = null;
        return _this;
    }
    return MUITableViewCellNode;
}(MIOObject));
var MUITableView = (function (_super) {
    __extends(MUITableView, _super);
    function MUITableView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataSource = null;
        _this.delegate = null;
        _this.headerView = null;
        _this.footerView = null;
        _this.headerHeight = 0;
        _this.footerHeight = 0;
        _this.sectionHeaderHeight = 23;
        _this.sectionFooterHeight = 23;
        _this.rowHeight = 0;
        _this.defaultRowHeight = 44;
        _this.allowsMultipleSelection = false;
        _this.selectedIndexPath = null;
        _this._indexPathsForSelectedRows = [];
        _this._cellPrototypesCount = 0;
        _this._cellPrototypesDownloadedCount = 0;
        _this._isDownloadingCells = false;
        _this._needReloadData = false;
        _this._cellPrototypes = {};
        _this.reusableCellsByID = {};
        _this.visibleCells = [];
        _this.cellNodesByID = {};
        _this.visibleRange = new MIORange(-1, -1);
        _this.sections = [];
        _this.rows = [];
        _this.rowsCount = 0;
        _this.contentHeight = 0;
        _this.lastContentOffsetY = -_this.defaultRowHeight;
        _this.firstVisibleHeader = null;
        _this.reloadLayoutSubviews = false;
        _this.lastIndexPath = null;
        return _this;
    }
    MUITableView.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var subLayer = this.layer.childNodes[index];
                if (subLayer.tagName != "DIV")
                    continue;
                if (subLayer.getAttribute("data-cell-identifier") != null) {
                    this._addCellPrototypeWithLayer(subLayer, owner);
                    subLayer.style.display = "none";
                }
                else if (subLayer.getAttribute("data-tableview-header") != null) {
                    this._addHeaderWithLayer(subLayer, owner);
                }
                else if (subLayer.getAttribute("data-tableview-footer") != null) {
                    this._addFooterWithLayer(subLayer, owner);
                }
            }
        }
    };
    MUITableView.prototype._addHeaderWithLayer = function (subLayer, owner) {
        this.headerView = new MUIView();
        this.headerView.initWithLayer(subLayer, owner);
    };
    MUITableView.prototype._addFooterWithLayer = function (subLayer, owner) {
        this.footerView = new MUIView();
        this.footerView.initWithLayer(subLayer, owner);
    };
    MUITableView.prototype._addCellPrototypeWithLayer = function (subLayer, owner) {
        var cellIdentifier = subLayer.getAttribute("data-cell-identifier");
        var cellClassname = subLayer.getAttribute("data-class");
        if (cellClassname == null)
            cellClassname = "MUITableViewCell";
        var item = {};
        item["class"] = cellClassname;
        item["layer"] = subLayer;
        var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        if (size != null)
            item["size"] = size;
        this._cellPrototypes[cellIdentifier] = item;
    };
    MUITableView.prototype.addCellPrototypeWithIdentifier = function (identifier, elementID, url, classname) {
        var item = {};
        this._isDownloadingCells = true;
        this._cellPrototypesCount++;
        item["url"] = url;
        item["id"] = elementID;
        if (classname != null)
            item["class"] = classname;
        this._cellPrototypes[identifier] = item;
        var mainBundle = MIOBundle.mainBundle();
        mainBundle.loadHTMLNamed(url, elementID, this, function (layer) {
            item["layer"] = layer;
            this._cellPrototypes[identifier] = item;
            this._cellPrototypesDownloadedCount++;
            if (this._cellPrototypesDownloadedCount == this._cellPrototypesCount) {
                this._isDownloadingCells = false;
                if (this._needReloadData)
                    this.reloadData();
            }
        });
    };
    MUITableView.prototype.dequeueReusableCellWithIdentifier = function (identifier) {
        var cell = null;
        var array = this.reusableCellsByID[identifier];
        if (array != null) {
            if (array.length > 0) {
                cell = array[0];
                array.splice(0, 1);
                return cell;
            }
        }
        var item = this._cellPrototypes[identifier];
        var className = item["class"];
        cell = MIOClassFromString(className);
        cell.nodeID = MIOUUID.uuid();
        cell.reuseIdentifier = identifier;
        var layer = item["layer"];
        if (layer != null) {
            var newLayer = layer.cloneNode(true);
            newLayer.style.display = "";
            var size = item["size"];
            cell.initWithLayer(newLayer);
            cell.awakeFromHTML();
        }
        else {
            var cells = item["cells"];
            if (cells == null) {
                cells = [];
                item["cells"] = cells;
            }
            cells.push(cell);
        }
        return cell;
    };
    MUITableView.prototype.setHeaderView = function (view) {
        this.headerView = view;
        this.addSubview(this.headerView);
    };
    MUITableView.prototype.reloadData = function () {
        for (var index = 0; index < this.rows.length; index++) {
            var row = this.rows[index];
            if (row.view != null) {
                switch (row.type) {
                    case MUITableViewRowType.Header:
                    case MUITableViewRowType.Footer:
                        break;
                    case MUITableViewRowType.Cell:
                        this.recycleCell(row.view);
                        row.view.removeFromSuperview();
                        break;
                    default:
                        row.view.removeFromSuperview();
                }
            }
        }
        this.rows = [];
        this.sections = [];
        this.rowsCount = 0;
        this.selectedIndexPath = null;
        this.visibleRange = new MIORange(-1, -1);
        this.lastContentOffsetY = 0;
        this.contentHeight = 0;
        if (this._isDownloadingCells == true) {
            this._needReloadData = true;
            return;
        }
        if (this.dataSource == null)
            return;
        var sections = this.dataSource.numberOfSections(this);
        for (var sectionIndex = 0; sectionIndex < sections; sectionIndex++) {
            var section = new MUITableViewSection();
            section.init();
            this.sections.push(section);
            var rows = this.dataSource.numberOfRowsInSection(this, sectionIndex);
            section.rows = rows;
            this.rowsCount += rows;
            this.contentHeight += rows * this.defaultRowHeight;
        }
        var size = new MIOSize(this.getWidth(), this.contentHeight);
        this.contentSize = size;
        this.scrollToTop();
        this.reloadLayoutSubviews = true;
        if (this.rowsCount > 0)
            this.setNeedsDisplay();
    };
    MUITableView.prototype.layoutSubviews = function () {
        if (this.reloadLayoutSubviews == true) {
            this.reloadLayoutSubviews = false;
            this.initialLayoutSubviews();
        }
        else {
            this.scrollLayoutSubviews();
        }
    };
    MUITableView.prototype.initialLayoutSubviews = function () {
        if (this.rowsCount == 0)
            return;
        var posY = this.addHeader();
        var maxY = this.getHeight() + (this.defaultRowHeight * 2);
        var exit = false;
        for (var sectionIndex = 0; sectionIndex < this.sections.length; sectionIndex++) {
            if (exit == true)
                break;
            var section = this.sections[sectionIndex];
            posY += this.addSectionHeader(section, posY, null);
            for (var cellIndex = 0; cellIndex < section.rows; cellIndex++) {
                var ip = MIOIndexPath.indexForRowInSection(cellIndex, sectionIndex);
                posY += this.addCell(ip, posY, null);
                this.lastIndexPath = ip;
                if (posY >= maxY) {
                    exit = true;
                    break;
                }
            }
        }
        if (posY < maxY) {
            posY += this.addFooter();
        }
        this.visibleRange = new MIORange(0, this.rows.length);
        var size = new MIOSize(this.getWidth(), this.contentHeight);
        this.contentSize = size;
        this.lastContentOffsetY = 0;
    };
    MUITableView.prototype.scrollLayoutSubviews = function () {
        if (this.rowsCount == 0)
            return;
        var scrollDown = false;
        var offsetY = 0;
        if (this.contentOffset.y == this.lastContentOffsetY)
            return;
        if (this.contentOffset.y > this.lastContentOffsetY) {
            offsetY = this.contentOffset.y - this.lastContentOffsetY;
            scrollDown = true;
        }
        else if (this.contentOffset.y < this.lastContentOffsetY) {
            offsetY = this.lastContentOffsetY - this.contentOffset.y;
            scrollDown = false;
        }
        if (offsetY < (this.defaultRowHeight / 2))
            return;
        this.lastContentOffsetY = this.contentOffset.y;
        if (scrollDown == true) {
            var start = this.visibleRange.location;
            var end = this.visibleRange.location + this.visibleRange.length - 1;
            var row = this.rows[end];
            var posY = row.view.getY() + row.height;
            var maxY = this.contentOffset.y + this.getHeight() + (this.defaultRowHeight * 2);
            var startSectionIndex = this.lastIndexPath.section;
            var startRowIndex = this.lastIndexPath.row + 1;
            var nextRow = end + 1;
            var h = 0;
            var exit = false;
            for (var sectionIndex = startSectionIndex; sectionIndex < this.sections.length; sectionIndex++) {
                if (exit == true)
                    break;
                var section = this.sections[sectionIndex];
                for (var cellIndex = startRowIndex; cellIndex < section.rows; cellIndex++) {
                    if (cellIndex == 0) {
                        h = this.addSectionHeader(section, posY, this.rows[nextRow]);
                        posY += h;
                        if (h > 0) {
                            nextRow++;
                            start++;
                        }
                    }
                    var ip = MIOIndexPath.indexForRowInSection(cellIndex, sectionIndex);
                    posY += this.addCell(ip, posY, this.rows[nextRow]);
                    nextRow++;
                    start++;
                    this.lastIndexPath = ip;
                    if (posY >= maxY) {
                        exit = true;
                        break;
                    }
                }
                startRowIndex = 0;
            }
            this.visibleRange = new MIORange(start, nextRow - start);
        }
        var size = new MIOSize(this.getWidth(), this.contentHeight);
        this.contentSize = size;
    };
    MUITableView.prototype.recycleCell = function (cell) {
        if (cell == null)
            return;
        var ip = this.indexPathForCell(cell);
        if (ip.row == -1)
            return;
        var section = this.sections[ip.section];
        section.cells[ip.row] = null;
        cell.selected = false;
        cell.removeObserver(this, "selected");
        var array = this.reusableCellsByID[cell.reuseIdentifier];
        if (array == null) {
            array = [];
            this.reusableCellsByID[cell.reuseIdentifier] = array;
        }
        array.push(cell);
        if (this.delegate != null) {
            if (typeof this.delegate.didEndDisplayingCellAtIndexPath === "function")
                this.delegate.didEndDisplayingCellAtIndexPath(this, cell, ip);
        }
    };
    MUITableView.prototype.indexPathForRowIndex = function (index, sectionIndex) {
        var section = this.sections[sectionIndex];
        if (index < section.rows) {
            return MIOIndexPath.indexForRowInSection(index, sectionIndex);
        }
        else {
            var nextIndex = index - section.rows;
            return this.indexPathForRowIndex(nextIndex, sectionIndex + 1);
        }
    };
    MUITableView.prototype.addRowsForNewVisibleRange = function (range, scrollDown) {
        var row;
        var start;
        var end;
        var posY = 0;
        if (this.visibleRange.location == -1) {
            start = range.location;
            end = range.length;
            posY = 0;
        }
        else if (scrollDown == true) {
            start = this.visibleRange.location + this.visibleRange.length - 1;
            end = range.location + range.length;
        }
        else {
            start = range.location;
            end = this.visibleRange.location;
            row = this.rows[end];
            posY = row.view.getY();
        }
        if (scrollDown == true) {
            row = this.rows[start];
            posY = row.view.getY();
            for (var index = start; index < end; index++) {
                row = this.rows[index];
                if (MIOLocationInRange(index, this.visibleRange) == true) {
                    posY += row.height;
                }
                else {
                    var ip = this.indexPathForRowIndex(index, 0);
                    posY += this.addCell(ip, posY, index);
                }
            }
        }
        else {
            for (var index = end; index >= start; index--) {
                if (MIOLocationInRange(index, this.visibleRange) == false) {
                    row = this.rows[index];
                    var h = row.height;
                    row = this.rows[index + 1];
                    posY = row.view.getY() - h;
                    var ip = this.indexPathForRowIndex(index, 0);
                    this.addCell(ip, posY, index, row.view);
                }
            }
        }
    };
    MUITableView.prototype.addRowWithType = function (type, view) {
        var row = new MUITableViewRow();
        row.initWithType(type);
        this.rows.push(row);
        row.view = view;
        return row;
    };
    MUITableView.prototype.addHeader = function () {
        var header = null;
        if (this.headerView != null)
            header = this.headerView;
        if (header == null)
            return 0;
        header.setX(0);
        header.setY(0);
        header.setWidth(this.getWidth());
        this.addSubview(header);
        var row = this.addRowWithType(MUITableViewRowType.Header, header);
        if (row.height == 0) {
            row.height = header.getHeight();
            this.contentHeight += row.height;
        }
        return row.height;
    };
    MUITableView.prototype.addSectionHeader = function (section, posY, row) {
        if (row != null && row.view != null)
            return row.height;
        var sectionIndex = this.sections.indexOf(section);
        if (typeof this.dataSource.viewForHeaderInSection === "function") {
            var view = this.dataSource.viewForHeaderInSection(this, sectionIndex);
            if (view == null)
                return 0;
            view.setX(0);
            view.setY(posY);
            section.header = view;
            this.addSubview(view);
            if (row == null) {
                row = this.addRowWithType(MUITableViewRowType.SectionHeader, section.header);
            }
            row.view = view;
            if (row.height == 0) {
                row.height = view.getHeight();
                ;
                this.contentHeight += row.height;
            }
            return row.height;
        }
        else if (typeof this.dataSource.titleForHeaderInSection === "function") {
            var title = this.dataSource.titleForHeaderInSection(this, sectionIndex);
            if (title == null)
                return null;
            var header = MUITableViewSection.headerWithTitle(title, this.sectionHeaderHeight);
            header.setX(0);
            header.setY(posY);
            section.header = header;
            this.addSubview(header);
            if (row == null) {
                row = this.addRowWithType(MUITableViewRowType.SectionHeader, section.header);
            }
            row.view = header;
            if (row.height == 0) {
                row.height = header.getHeight();
                ;
                this.contentHeight += row.height;
            }
            return row.height;
        }
        return 0;
    };
    MUITableView.prototype.addCell = function (indexPath, posY, row, previusCell) {
        if (row != null && row.view != null)
            return row.height;
        var r = row;
        if (r == null) {
            r = this.addRowWithType(MUITableViewRowType.Cell, cell);
        }
        var cell = this.dataSource.cellAtIndexPath(this, indexPath);
        var nodeID = cell.nodeID;
        var node = this.cellNodesByID[nodeID];
        if (node == null) {
            node = new MUITableViewCellNode();
            node.identifier = nodeID;
            this.cellNodesByID[nodeID] = node;
        }
        var section = this.sections[indexPath.section];
        node.section = section;
        section.cells[indexPath.row] = cell;
        cell.setX(0);
        cell.setY(posY);
        if (typeof this.delegate.willDisplayCellAtIndexPath === "function") {
            this.delegate.willDisplayCellAtIndexPath(this, cell, indexPath);
        }
        cell.addObserver(this, "selected");
        if (previusCell == null) {
            this.addSubview(cell);
        }
        else {
            var index = this.contentView.subviews.indexOf(previusCell);
            this.addSubview(cell, index);
        }
        r.view = cell;
        cell.setNeedsDisplay();
        cell._target = this;
        cell._onClickFn = this.cellOnClickFn;
        cell._onDblClickFn = this.cellOnDblClickFn;
        cell._onAccessoryClickFn = this.cellOnAccessoryClickFn;
        var h = this.rowHeight;
        if (typeof this.delegate.heightForRowAtIndexPath === "function") {
            h = this.delegate.heightForRowAtIndexPath(this, indexPath);
            if (r.height != h) {
                if (r.height == 0) {
                    this.contentHeight -= this.defaultRowHeight;
                    this.contentHeight += h;
                }
                else {
                    this.contentHeight -= r.height;
                    this.contentHeight += h;
                }
                r.height = h;
            }
        }
        if (h > 0) {
            cell.setHeight(h);
        }
        else {
            h = cell.getHeight();
            if (r.height == 0) {
                r.height = h;
                this.contentHeight -= this.defaultRowHeight;
                this.contentHeight += h;
            }
        }
        return r.height;
    };
    MUITableView.prototype.addSectionFooter = function (section, posY, rowIndex) {
        return 0;
    };
    MUITableView.prototype.addFooter = function () {
        return 0;
    };
    MUITableView.prototype.cellOnClickFn = function (cell) {
        var indexPath = this.indexPathForCell(cell);
        var canSelectCell = true;
        if (this.delegate != null) {
            if (typeof this.delegate.canSelectCellAtIndexPath === "function")
                canSelectCell = this.delegate.canSelectCellAtIndexPath(this, indexPath);
        }
        if (canSelectCell == false)
            return;
        if (MIOIndexPathEqual(this.selectedIndexPath, indexPath) == false) {
            if (this.allowsMultipleSelection == false) {
                if (this.selectedIndexPath != null)
                    this.deselectCellAtIndexPath(this.selectedIndexPath);
            }
            this.selectedIndexPath = indexPath;
            this._selectCell(cell);
            if (this.delegate != null && typeof this.delegate.didSelectCellAtIndexPath === "function") {
                this.delegate.didSelectCellAtIndexPath(this, indexPath);
            }
        }
    };
    MUITableView.prototype.cellOnDblClickFn = function (cell) {
        var indexPath = this.indexPathForCell(cell);
        var canSelectCell = true;
        if (this.delegate != null) {
            if (typeof this.delegate.canSelectCellAtIndexPath === "function")
                canSelectCell = this.delegate.canSelectCellAtIndexPath(this, indexPath);
        }
        if (canSelectCell == false)
            return;
        if (this.delegate != null) {
            if (typeof this.delegate.didMakeDoubleClick === "function")
                this.delegate.didMakeDoubleClick(this, indexPath);
        }
        if (MIOIndexPathEqual(this.selectedIndexPath, indexPath) == false) {
            if (this.allowsMultipleSelection == false) {
                if (this.selectedIndexPath != null)
                    this.deselectCellAtIndexPath(this.selectedIndexPath);
            }
            this.selectedIndexPath = indexPath;
            this._selectCell(cell);
        }
        if (this.delegate != null) {
            if (typeof this.delegate.didSelectCellAtIndexPath === "function")
                this.delegate.didSelectCellAtIndexPath(this, indexPath);
        }
    };
    MUITableView.prototype.cellOnAccessoryClickFn = function (cell) {
        var indexPath = this.indexPathForCell(cell);
        if (this.delegate != null) {
            if (typeof this.delegate.commitEditingStyleForRowAtIndexPath === "function")
                this.delegate.commitEditingStyleForRowAtIndexPath(this, MIOTableViewCellEditingStyle.Delete, indexPath);
        }
    };
    MUITableView.prototype.cellAtIndexPath = function (indexPath) {
        var s = this.sections[indexPath.section];
        var c = s.cells[indexPath.row];
        return c;
    };
    MUITableView.prototype.indexPathForCell = function (cell) {
        var node = this.cellNodesByID[cell.nodeID];
        if (node == null)
            return null;
        var section = node.section;
        var sectionIndex = this.sections.indexOf(section);
        var rowIndex = section.cells.indexOf(cell);
        return MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);
    };
    MUITableView.prototype._selectCell = function (cell) {
        cell.setSelected(true);
    };
    MUITableView.prototype.selectCellAtIndexPath = function (indexPath) {
        if (MIOIndexPathEqual(this.selectedIndexPath, indexPath) == true)
            return;
        this.selectedIndexPath = indexPath;
        var cell = this.sections[indexPath.section].cells[indexPath.row];
        if (cell != null) {
            this._selectCell(cell);
        }
    };
    MUITableView.prototype._deselectCell = function (cell) {
        cell.setSelected(false);
    };
    MUITableView.prototype.deselectCellAtIndexPath = function (indexPath) {
        if (MIOIndexPathEqual(this.selectedIndexPath, indexPath) == false)
            return;
        this.selectedIndexPath = null;
        var cell = this.sections[indexPath.section].cells[indexPath.row];
        this._deselectCell(cell);
    };
    MUITableView.prototype.selectNextIndexPath = function () {
        var sectionIndex = 0;
        var rowIndex = 0;
        if (this.selectedIndexPath != null) {
            sectionIndex = this.selectedIndexPath.section;
            rowIndex = this.selectedIndexPath.row;
            var ip = MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);
            this.deselectCellAtIndexPath(ip);
            rowIndex++;
        }
        if (this.sections.length == 0)
            return;
        var section = this.sections[sectionIndex];
        if (rowIndex < section.cells.length) {
            var ip = MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);
            this.selectCellAtIndexPath(ip);
        }
        else {
            rowIndex = 0;
            sectionIndex++;
            if (sectionIndex < this.sections.length) {
                var ip = MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);
                this.selectCellAtIndexPath(ip);
            }
        }
    };
    MUITableView.prototype.selectPrevIndexPath = function () {
        if (this.selectedIndexPath == null)
            return;
        var sectionIndex = this.selectedIndexPath.section;
        var rowIndex = this.selectedIndexPath.row - 1;
        if (rowIndex > -1) {
            var ip = MIOIndexPath.indexForRowInSection(rowIndex + 1, sectionIndex);
            this.deselectCellAtIndexPath(ip);
            var ip2 = MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);
            this.selectCellAtIndexPath(ip2);
        }
        else {
            sectionIndex--;
            if (sectionIndex > -1) {
                var ip = MIOIndexPath.indexForRowInSection(rowIndex + 1, sectionIndex + 1);
                this.deselectCellAtIndexPath(ip);
                var section = this.sections[sectionIndex];
                rowIndex = section.cells.length - 1;
                var ip2 = MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);
                this.selectCellAtIndexPath(ip2);
            }
        }
    };
    return MUITableView;
}(MUIScrollView));
function MIOEdgeInsetsMake(top, left, bottom, rigth) {
    var ei = new MUIEdgeInsets();
    ei.initWithValues(top, left, bottom, rigth);
    return ei;
}
var MUIEdgeInsets = (function (_super) {
    __extends(MUIEdgeInsets, _super);
    function MUIEdgeInsets() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.top = 0;
        _this.left = 0;
        _this.bottom = 0;
        _this.right = 0;
        return _this;
    }
    MUIEdgeInsets.Zero = function () {
        var ei = new MUIEdgeInsets();
        ei.init();
        return ei;
    };
    MUIEdgeInsets.prototype.initWithValues = function (top, left, bottom, right) {
        _super.prototype.init.call(this);
        this.top = top;
        this.left = left;
        this.bottom = bottom;
        this.right = right;
    };
    return MUIEdgeInsets;
}(MIOObject));
var MUICollectionViewLayout = (function (_super) {
    __extends(MUICollectionViewLayout, _super);
    function MUICollectionViewLayout() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.collectionView = null;
        _this.minimumLineSpacing = 0;
        _this.minimumInteritemSpacing = 0;
        _this.itemSize = new MIOSize(0, 0);
        _this.estimatedItemSize = new MIOSize(0, 0);
        _this.sectionInset = null;
        _this.headerReferenceSize = new MIOSize(0, 0);
        _this.footerReferenceSize = new MIOSize(0, 0);
        return _this;
    }
    MUICollectionViewLayout.prototype.init = function () {
        _super.prototype.init.call(this);
        this.sectionInset = new MUIEdgeInsets();
        this.sectionInset.init();
    };
    MUICollectionViewLayout.prototype.invalidateLayout = function () { };
    return MUICollectionViewLayout;
}(MIOObject));
var MUICollectionViewFlowLayout = (function (_super) {
    __extends(MUICollectionViewFlowLayout, _super);
    function MUICollectionViewFlowLayout() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MUICollectionViewFlowLayout.prototype.init = function () {
        _super.prototype.init.call(this);
        this.minimumLineSpacing = 10;
        this.minimumInteritemSpacing = 10;
        this.itemSize = new MIOSize(50, 50);
    };
    return MUICollectionViewFlowLayout;
}(MUICollectionViewLayout));
var MUICollectionViewCell = (function (_super) {
    __extends(MUICollectionViewCell, _super);
    function MUICollectionViewCell() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._target = null;
        _this._onClickFn = null;
        _this._index = null;
        _this._section = null;
        _this.selected = false;
        return _this;
    }
    MUICollectionViewCell.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        this._setupLayer();
    };
    MUICollectionViewCell.prototype._setupLayer = function () {
        var instance = this;
        this.layer.addEventListener("click", function (e) {
            e.stopPropagation();
            if (instance._onClickFn != null)
                instance._onClickFn.call(instance._target, instance);
        });
    };
    MUICollectionViewCell.prototype.setSelected = function (value) {
        this.willChangeValue("selected");
        this.selected = value;
        this.didChangeValue("selected");
    };
    return MUICollectionViewCell;
}(MUIView));
var MUICollectionViewSection = (function (_super) {
    __extends(MUICollectionViewSection, _super);
    function MUICollectionViewSection() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.header = null;
        _this.footer = null;
        _this.cells = [];
        return _this;
    }
    return MUICollectionViewSection;
}(MIOObject));
var MUICollectionView = (function (_super) {
    __extends(MUICollectionView, _super);
    function MUICollectionView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataSource = null;
        _this.delegate = null;
        _this._collectionViewLayout = null;
        _this._cellPrototypes = {};
        _this._supplementaryViews = {};
        _this._sections = [];
        _this.selectedCellIndex = -1;
        _this.selectedCellSection = -1;
        return _this;
    }
    Object.defineProperty(MUICollectionView.prototype, "collectionViewLayout", {
        get: function () {
            if (this._collectionViewLayout == null) {
                this._collectionViewLayout = new MUICollectionViewFlowLayout();
                this._collectionViewLayout.init();
            }
            return this._collectionViewLayout;
        },
        set: function (layout) {
            layout.collectionView = this;
            this._collectionViewLayout = layout;
            layout.invalidateLayout();
        },
        enumerable: true,
        configurable: true
    });
    MUICollectionView.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var subLayer = this.layer.childNodes[index];
                if (subLayer.tagName != "DIV")
                    continue;
                if (subLayer.getAttribute("data-cell-identifier") != null) {
                    this._addCellPrototypeWithLayer(subLayer);
                    subLayer.style.display = "none";
                }
                else if (subLayer.getAttribute("data-supplementary-view-identifier") != null) {
                    this._addSupplementaryViewPrototypeWithLayer(subLayer);
                    subLayer.style.display = "none";
                }
            }
        }
    };
    MUICollectionView.prototype._addCellPrototypeWithLayer = function (subLayer) {
        var cellIdentifier = subLayer.getAttribute("data-cell-identifier");
        var cellClassname = subLayer.getAttribute("data-class");
        if (cellClassname == null)
            cellClassname = "MIOCollectionViewCell";
        var item = {};
        item["class"] = cellClassname;
        item["layer"] = subLayer;
        var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        if (size != null)
            item["size"] = size;
        var bg = window.getComputedStyle(subLayer, null).getPropertyValue('background-color');
        if (bg != null)
            item["bg"] = bg;
        this._cellPrototypes[cellIdentifier] = item;
    };
    MUICollectionView.prototype._addSupplementaryViewPrototypeWithLayer = function (subLayer) {
        var viewIdentifier = subLayer.getAttribute("data-supplementary-view-identifier");
        var viewClassname = subLayer.getAttribute("data-class");
        if (viewClassname == null)
            viewClassname = "MIOView";
        var item = {};
        item["class"] = viewClassname;
        item["layer"] = subLayer;
        var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        if (size != null)
            item["size"] = size;
        var bg = window.getComputedStyle(subLayer, null).getPropertyValue('background-color');
        if (bg != null)
            item["bg"] = bg;
        this._supplementaryViews[viewIdentifier] = item;
    };
    MUICollectionView.prototype.registerClassForCellWithReuseIdentifier = function (cellClass, resource, identifier) {
    };
    MUICollectionView.prototype.registerClassForSupplementaryViewWithReuseIdentifier = function (viewClass, resource, identifier) {
    };
    MUICollectionView.prototype.dequeueReusableCellWithIdentifier = function (identifier) {
        var item = this._cellPrototypes[identifier];
        var className = item["class"];
        var cell = Object.create(window[className].prototype);
        cell.constructor.apply(cell);
        var layer = item["layer"];
        if (layer != null) {
            var newLayer = layer.cloneNode(true);
            newLayer.style.display = "";
            cell.initWithLayer(newLayer);
            cell.awakeFromHTML();
        }
        else {
            var cells = item["cells"];
            if (cells == null) {
                cells = [];
                item["cells"] = cells;
            }
            cells.push(cell);
        }
        return cell;
    };
    MUICollectionView.prototype.dequeueReusableSupplementaryViewWithReuseIdentifier = function (identifier) {
        var item = this._supplementaryViews[identifier];
        var className = item["class"];
        var view = Object.create(window[className].prototype);
        view.constructor.apply(view);
        var layer = item["layer"];
        if (layer != null) {
            var newLayer = layer.cloneNode(true);
            newLayer.style.display = "";
            view.initWithLayer(newLayer);
            view.awakeFromHTML();
        }
        else {
            var views = item["views"];
            if (views == null) {
                views = [];
                item["views"] = views;
            }
            views.push(view);
        }
        return view;
    };
    MUICollectionView.prototype.cellAtIndexPath = function (indexPath) {
        var s = this._sections[indexPath.section];
        var c = s.cells[indexPath.row];
        return c;
    };
    MUICollectionView.prototype.reloadData = function () {
        if (this.dataSource == null)
            return;
        for (var index = 0; index < this._sections.length; index++) {
            var sectionView = this._sections[index];
            if (sectionView.header != null)
                sectionView.header.removeFromSuperview();
            if (sectionView.footer != null)
                sectionView.footer.removeFromSuperview();
            for (var count = 0; count < sectionView.cells.length; count++) {
                var cell = sectionView.cells[count];
                cell.removeFromSuperview();
                if (this.delegate != null) {
                    if (typeof this.delegate.didEndDisplayingCellAtIndexPath === "function") {
                        var ip = MIOIndexPath.indexForRowInSection(count, index);
                        this.delegate.didEndDisplayingCellAtIndexPath(this, cell, ip);
                    }
                }
            }
        }
        this._sections = [];
        var sections = this.dataSource.numberOfSections(this);
        for (var sectionIndex = 0; sectionIndex < sections; sectionIndex++) {
            var section = new MUICollectionViewSection();
            section.init();
            this._sections.push(section);
            if (typeof this.dataSource.viewForSupplementaryViewAtIndex === "function") {
                var hv = this.dataSource.viewForSupplementaryViewAtIndex(this, "header", sectionIndex);
                section.header = hv;
                if (hv != null)
                    this.addSubview(hv);
            }
            var items = this.dataSource.numberOfItemsInSection(this, sectionIndex);
            for (var index = 0; index < items; index++) {
                var ip = MIOIndexPath.indexForRowInSection(index, sectionIndex);
                var cell_1 = this.dataSource.cellForItemAtIndexPath(this, ip);
                section.cells.push(cell_1);
                this.addSubview(cell_1);
                cell_1._target = this;
                cell_1._onClickFn = this.cellOnClickFn;
                cell_1._index = index;
                cell_1._section = sectionIndex;
            }
            if (typeof this.dataSource.viewForSupplementaryViewAtIndex === "function") {
                var fv = this.dataSource.viewForSupplementaryViewAtIndex(this, "footer", sectionIndex);
                section.footer = fv;
                if (fv != null)
                    this.addSubview(fv);
            }
        }
        this.collectionViewLayout.invalidateLayout();
        this.setNeedsDisplay();
    };
    MUICollectionView.prototype.cellOnClickFn = function (cell) {
        var index = cell._index;
        var section = cell._section;
        var canSelectCell = true;
        if (this.delegate != null) {
            if (typeof this.delegate.canSelectCellAtIndexPath === "function")
                canSelectCell = this.delegate.canSelectCellAtIndexPath(this, index, section);
        }
        if (canSelectCell == false)
            return;
        if (this.selectedCellIndex > -1 && this.selectedCellSection > -1) {
            var ip = MIOIndexPath.indexForRowInSection(this.selectedCellIndex, this.selectedCellSection);
            this.deselectCellAtIndexPath(ip);
        }
        this.selectedCellIndex = index;
        this.selectedCellSection = section;
        this._selectCell(cell);
        if (this.delegate != null) {
            if (typeof this.delegate.didSelectCellAtIndexPath === "function") {
                var ip = MIOIndexPath.indexForRowInSection(index, section);
                this.delegate.didSelectCellAtIndexPath(this, ip);
            }
        }
    };
    MUICollectionView.prototype._selectCell = function (cell) {
        cell.setSelected(true);
    };
    MUICollectionView.prototype.selectCellAtIndexPath = function (index, section) {
        this.selectedCellIndex = index;
        this.selectedCellSection = section;
        var cell = this._sections[section].cells[index];
        this._selectCell(cell);
    };
    MUICollectionView.prototype._deselectCell = function (cell) {
        cell.setSelected(false);
    };
    MUICollectionView.prototype.deselectCellAtIndexPath = function (indexPath) {
        this.selectedCellIndex = -1;
        this.selectedCellSection = -1;
        var cell = this._sections[indexPath.section].cells[indexPath.row];
        this._deselectCell(cell);
    };
    MUICollectionView.prototype.layoutSubviews = function () {
        if (this.hidden == true)
            return;
        if (this._sections == null)
            return;
        var x = 0;
        var y = 0;
        for (var count = 0; count < this._sections.length; count++) {
            var section = this._sections[count];
            x = this.collectionViewLayout.sectionInset.left;
            if (section.header != null) {
                section.header.setY(y);
                var offsetY = section.header.getHeight();
                if (offsetY <= 0)
                    offsetY = 23;
                y += offsetY + this.collectionViewLayout.headerReferenceSize.height;
            }
            var maxX = this.getWidth() - this.collectionViewLayout.sectionInset.right;
            for (var index = 0; index < section.cells.length; index++) {
                var cell = section.cells[index];
                if (this.delegate != null) {
                    if (typeof this.delegate.willDisplayCellAtIndexPath === "function")
                        this.delegate.willDisplayCellAtIndexPath(this, cell, index, count);
                }
                cell.setWidth(this.collectionViewLayout.itemSize.width);
                cell.setHeight(this.collectionViewLayout.itemSize.height);
                cell.setX(x);
                cell.setY(y);
                x += this.collectionViewLayout.itemSize.width + this.collectionViewLayout.minimumInteritemSpacing;
                if (x >= maxX) {
                    x = this.collectionViewLayout.sectionInset.left;
                    y += this.collectionViewLayout.itemSize.height;
                }
            }
            y += this.collectionViewLayout.minimumLineSpacing;
            if (section.footer != null) {
                section.footer.setY(y);
                var offsetY = section.footer.getHeight();
                if (offsetY <= 0)
                    offsetY = 23;
                y += offsetY + this.collectionViewLayout.footerReferenceSize.height;
            }
        }
    };
    return MUICollectionView;
}(MUIView));
var MUIWebView = (function (_super) {
    __extends(MUIWebView, _super);
    function MUIWebView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._iframeLayer = null;
        return _this;
    }
    MUIWebView.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setupLayer();
    };
    MUIWebView.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        this._iframeLayer = MUILayerGetFirstElementWithTag(this.layer, "IFRAME");
        this._setupLayer();
    };
    MUIWebView.prototype._setupLayer = function () {
        if (this._iframeLayer == null) {
            this._iframeLayer = document.createElement("iframe");
            this._iframeLayer.setAttribute("scrolling", "auto");
            this._iframeLayer.setAttribute("frameborder", "0");
            this._iframeLayer.setAttribute("width", "100%");
            this._iframeLayer.setAttribute("height", "100%");
            this.layer.appendChild(this._iframeLayer);
        }
    };
    MUIWebView.prototype.setURL = function (url) {
        this._iframeLayer.setAttribute("src", url);
    };
    MUIWebView.prototype.setHTML = function (html) {
        var iframe = this._iframeLayer.contentWindow || (this._iframeLayer.contentDocument.document || this._iframeLayer.contentDocument);
        iframe.document.open();
        iframe.document.write(html);
        iframe.document.close();
    };
    return MUIWebView;
}(MUIView));
var MUICheckButton = (function (_super) {
    __extends(MUICheckButton, _super);
    function MUICheckButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.target = null;
        _this.action = null;
        _this.on = false;
        return _this;
    }
    MUICheckButton.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        this.layer.classList.add("checkbox");
        this.layer.classList.add("off");
        var instance = this;
        this.layer.onclick = function () {
            if (instance.enabled) {
                instance.toggleValue.call(instance);
            }
        };
    };
    MUICheckButton.prototype.setOnChangeValue = function (target, action) {
        this.target = target;
        this.action = action;
    };
    MUICheckButton.prototype.setOn = function (on) {
        this.on = on;
        if (on == true) {
            this.layer.classList.remove("off");
            this.layer.classList.add("on");
        }
        else {
            this.layer.classList.remove("on");
            this.layer.classList.add("off");
        }
    };
    MUICheckButton.prototype.toggleValue = function () {
        this.setOn(!this.on);
        if (this.target != null && this.action != null)
            this.action.call(this.target, this, this.on);
    };
    return MUICheckButton;
}(MUIControl));
var MUISwitchButton = (function (_super) {
    __extends(MUISwitchButton, _super);
    function MUISwitchButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.target = null;
        _this.action = null;
        _this.on = false;
        _this._inputLayer = null;
        _this._labelLayer = null;
        return _this;
    }
    MUISwitchButton.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        this.layer.classList.add("switch_button");
        this._inputLayer = MUILayerGetFirstElementWithTag(this.layer, "INPUT");
        if (this._inputLayer == null) {
            this._inputLayer = document.createElement("input");
            this._inputLayer.setAttribute("type", "checkbox");
            this._inputLayer.setAttribute("id", this.layerID + "_input");
            this._inputLayer.classList.add("switch_button_input");
            layer.appendChild(this._inputLayer);
        }
        var instance = this;
        this.layer.onclick = function () {
            if (instance.enabled) {
                instance._toggleValue.call(instance);
            }
        };
    };
    MUISwitchButton.prototype.setOnChangeValue = function (target, action) {
        this.target = target;
        this.action = action;
    };
    MUISwitchButton.prototype.setOn = function (on) {
        if (on == this.on)
            return;
        this._inputLayer.checked = on;
        this.on = on;
    };
    MUISwitchButton.prototype._toggleValue = function () {
        this.on = !this.on;
        if (this.target != null && this.action != null)
            this.action.call(this.target, this, this.on);
    };
    return MUISwitchButton;
}(MUIControl));
var MUIWebApplication = (function () {
    function MUIWebApplication() {
        this.delegate = null;
        this.isMobile = false;
        this.defaultLanguage = null;
        this.currentLanguage = null;
        this.languages = null;
        this.ready = false;
        this.downloadCoreFileCount = 0;
        this._sheetViewController = null;
        this._sheetSize = null;
        this._popUpMenu = null;
        this._popUpMenuControl = null;
        this._popOverWindow = null;
        this._popOverWindowFirstClick = false;
        this._popOverViewController = null;
        this._windows = [];
        this._keyWindow = null;
        this._mainWindow = null;
        if (MUIWebApplication._sharedInstance != null) {
            throw new Error("MUIWebApplication: Instantiation failed: Use sharedInstance() instead of new.");
        }
    }
    MUIWebApplication.sharedInstance = function () {
        if (MUIWebApplication._sharedInstance == null) {
            MUIWebApplication._sharedInstance = new MUIWebApplication();
        }
        return MUIWebApplication._sharedInstance;
    };
    MUIWebApplication.prototype.run = function () {
        var languages = MIOCoreGetLanguages();
        if (languages == null) {
            this._run();
            return;
        }
        var lang = MIOCoreGetBrowserLanguage();
        var url = languages[lang];
        if (url == null) {
            this._run();
            return;
        }
        var request = MIOURLRequest.requestWithURL(MIOURL.urlWithString(url));
        var con = new MIOURLConnection();
        con.initWithRequestBlock(request, this, function (code, data) {
            if (code == 200) {
                _MIOLocalizedStrings = data;
            }
            this._run();
        });
    };
    MUIWebApplication.prototype._run = function () {
        this.delegate.didFinishLaunching();
        this.delegate.window.makeKeyAndVisible();
        this._mainWindow = this.delegate.window;
        this.delegate.window.rootViewController.onLoadView(this, function () {
            this.delegate.window.rootViewController.viewWillAppear(false);
            this.delegate.window.rootViewController.viewDidAppear(false);
            this.ready = true;
            MIOCoreEventRegisterObserverForType(MIOCoreEventType.Click, this, this._clickEvent);
            MIOCoreEventRegisterObserverForType(MIOCoreEventType.Resize, this, this._resizeEvent);
        });
    };
    MUIWebApplication.prototype.setLanguageURL = function (key, url) {
        if (this.languages == null)
            this.languages = {};
        this.languages[key] = url;
    };
    MUIWebApplication.prototype.setDefaultLanguage = function (key) {
        this.defaultLanguage = key;
    };
    MUIWebApplication.prototype.downloadLanguage = function (key, fn) {
        var url = this.languages[key];
        var conn = new MIOURLConnection();
        conn.initWithRequestBlock(MIOURLRequest.requestWithURL(url), this, function (error, data) {
            if (data != null) {
                var json = JSON.parse(data.replace(/(\r\n|\n|\r)/gm, ""));
                _MIOLocalizedStrings = json;
            }
            fn.call(this);
        });
    };
    MUIWebApplication.prototype.showModalViewContoller = function (vc) {
        var w = new MUIWindow();
        w.initWithRootViewController(vc);
        document.body.appendChild(vc.view.layer);
        this._windows.push(w);
    };
    MUIWebApplication.prototype.showMenuFromControl = function (control, menu) {
        if (this._popUpMenu != null) {
            if (menu.layerID != this._popUpMenu.layerID)
                this._popUpMenu.hide();
        }
        this._popUpMenuControl = control;
        this._popUpMenu = menu;
        this.delegate.window.addSubview(this._popUpMenu);
        var x = control.layer.getBoundingClientRect().left;
        var y = control.layer.getBoundingClientRect().top + control.layer.getBoundingClientRect().height;
        this._popUpMenu.setX(x);
        this._popUpMenu.setY(y);
        this._popUpMenu.layer.style.zIndex = 200;
        this._popUpMenu.layout();
    };
    MUIWebApplication.prototype.hideMenu = function () {
        if (this._popUpMenu != null) {
            this._popUpMenu.removeFromSuperview();
            this._popUpMenu = null;
        }
    };
    MUIWebApplication.prototype._resizeEvent = function (event) {
        this.delegate.window.layoutSubviews();
    };
    MUIWebApplication.prototype._clickEvent = function (event) {
        var target = event.coreEvent.target;
        var x = event.x;
        var y = event.y;
        if (this._popUpMenu != null) {
            var controlRect = this._popUpMenuControl.layer.getBoundingClientRect();
            if ((x > controlRect.left && x < controlRect.right)
                && (y > controlRect.top && y < controlRect.bottom)) {
            }
            else {
                this._popUpMenu.hide();
            }
        }
        if (this._keyWindow != null) {
            var controlRect = this._keyWindow.layer.getBoundingClientRect();
            if ((x > controlRect.left && x < controlRect.right)
                && (y > controlRect.top && y < controlRect.bottom)) {
            }
            else
                this._keyWindow._eventHappendOutsideWindow();
        }
    };
    MUIWebApplication.prototype.setPopOverViewController = function (vc) {
        if (this._popOverViewController != null)
            this._popOverViewController.dismissViewController(true);
        this._popOverViewController = vc;
    };
    MUIWebApplication.prototype.showPopOverControllerFromRect = function (vc, frame) {
        if (this._popOverWindow != null) {
            this.hidePopOverController();
        }
        if (this._popOverWindow == null) {
            this._popOverWindow = new MUIWindow("popover_window");
            this._popOverWindow.initWithRootViewController(vc.popoverPresentationController());
            this._popOverWindow.setFrame(vc.popoverPresentationController().frame);
        }
        this._popOverWindow.rootViewController.onLoadView(this, function () {
            this._popOverWindow.rootViewController.viewWillAppear(true);
            this._popOverWindow.rootViewController.viewDidAppear(true);
        });
        this._popOverWindowFirstClick = true;
    };
    MUIWebApplication.prototype.hidePopOverController = function () {
        this._popOverWindow.rootViewController.viewWillDisappear(true);
        this._popOverWindow.removeFromSuperview();
        this._popOverWindow.rootViewController.viewDidDisappear(true);
        this._popOverWindow = null;
    };
    MUIWebApplication.prototype.addWindow = function (window) {
        this._windows.push(window);
    };
    MUIWebApplication.prototype.makeKeyWindow = function (window) {
        if (this._keyWindow === window)
            return;
        if (this._keyWindow != null)
            this._keyWindow._resignKeyWindow();
        this.addWindow(window);
        this._keyWindow = window;
    };
    return MUIWebApplication;
}());
var MUIMenuItem = (function (_super) {
    __extends(MUIMenuItem, _super);
    function MUIMenuItem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.checked = false;
        _this.title = null;
        _this._titleLayer = null;
        _this.target = null;
        _this.action = null;
        return _this;
    }
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
        this.layer.ontouchend = function (e) {
            e.stopPropagation();
            if (instance.action != null && instance.target != null) {
                instance.layer.classList.remove("menu_item_on_hover");
                instance.action.call(instance.target, instance);
            }
        };
        this.layer.onmouseup = function (e) {
            e.stopPropagation();
            if (instance.action != null && instance.target != null) {
                instance.layer.classList.remove("menu_item_on_hover");
                instance.action.call(instance.target, instance);
            }
        };
    };
    MUIMenuItem.prototype.getWidth = function () {
        return this._titleLayer.getBoundingClientRect().width;
    };
    MUIMenuItem.prototype.getHeight = function () {
        return this.layer.getBoundingClientRect().height;
    };
    return MUIMenuItem;
}(MUIView));
var MUIMenu = (function (_super) {
    __extends(MUIMenu, _super);
    function MUIMenu() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
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
var MUIPopUpButton = (function (_super) {
    __extends(MUIPopUpButton, _super);
    function MUIPopUpButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._menu = null;
        _this._isVisible = false;
        return _this;
    }
    MUIPopUpButton.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        this.setAction(this, function () {
            if (this._menu == null)
                return;
            if (this._menu.isVisible == false) {
                this._menu.showFromControl(this);
            }
            else {
                this._menu.hide();
            }
        });
    };
    MUIPopUpButton.prototype.setMenuAction = function (target, action) {
        if (this._menu != null) {
            this._menu.target = target;
            this._menu.action = action;
        }
    };
    MUIPopUpButton.prototype.addMenuItemWithTitle = function (title) {
        if (this._menu == null) {
            this._menu = new MUIMenu();
            this._menu.init();
        }
        this._menu.addMenuItem(MUIMenuItem.itemWithTitle(title));
    };
    return MUIPopUpButton;
}(MUIButton));
var MUIComboBox = (function (_super) {
    __extends(MUIComboBox, _super);
    function MUIComboBox() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._selectLayer = null;
        _this.target = null;
        _this.action = null;
        return _this;
    }
    MUIComboBox.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setup_layers();
    };
    MUIComboBox.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        this._selectLayer = MUILayerGetFirstElementWithTag(this.layer, "SELECT");
        this._setup_layers();
    };
    MUIComboBox.prototype._setup_layers = function () {
        if (this._selectLayer == null) {
            this._selectLayer = document.createElement("select");
            this.layer.appendChild(this._selectLayer);
        }
    };
    MUIComboBox.prototype.setAllowMultipleSelection = function (value) {
        if (value == true)
            this._selectLayer.setAttribute("multiple", "multiple");
        else
            this._selectLayer.removeAttribute("multiple");
    };
    MUIComboBox.prototype.layoutSubviews = function () {
        _super.prototype.layoutSubviews.call(this);
        var w = this.getWidth();
        var h = this.getHeight();
        this._selectLayer.style.marginLeft = "8px";
        this._selectLayer.style.width = (w - 16) + "px";
        this._selectLayer.style.marginTop = "4px";
        this._selectLayer.style.height = (h - 8) + "px";
    };
    MUIComboBox.prototype.addItem = function (text, value) {
        var option = document.createElement("option");
        option.innerHTML = text;
        if (value != null)
            option.value = value;
        this._selectLayer.appendChild(option);
    };
    MUIComboBox.prototype.addItems = function (items) {
        for (var count = 0; count < items.length; count++) {
            var text = items[count];
            this.addItem(text);
        }
    };
    MUIComboBox.prototype.removeAllItems = function () {
        var node = this._selectLayer;
        while (this._selectLayer.hasChildNodes()) {
            if (node.hasChildNodes()) {
                node = node.lastChild;
            }
            else {
                node = node.parentNode;
                node.removeChild(node.lastChild);
            }
        }
    };
    MUIComboBox.prototype.getItemAtIndex = function (index) {
        if (this._selectLayer.childNodes.length == 0)
            return null;
        var option = this._selectLayer.childNodes[index];
        return option.innerHTML;
    };
    MUIComboBox.prototype.getSelectedItem = function () {
        return this._selectLayer.value;
    };
    MUIComboBox.prototype.getSelectedItemText = function () {
        for (var index = 0; index < this._selectLayer.childNodes.length; index++) {
            var option = this._selectLayer.childNodes[index];
            if (this._selectLayer.value == option.value)
                return option.innerHTML;
        }
    };
    MUIComboBox.prototype.selectItem = function (item) {
        this._selectLayer.value = item;
    };
    MUIComboBox.prototype.setOnChangeAction = function (target, action) {
        this.target = target;
        this.action = action;
        var instance = this;
        this._selectLayer.onchange = function () {
            if (instance.enabled)
                instance.action.call(target, instance, instance._selectLayer.value);
        };
    };
    return MUIComboBox;
}(MUIControl));
var MUISegmentedControl = (function (_super) {
    __extends(MUISegmentedControl, _super);
    function MUISegmentedControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.segmentedItems = [];
        _this.selectedSegmentedIndex = -1;
        return _this;
    }
    MUISegmentedControl.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        var opts = {};
        var sp = layer.getAttribute("data-status-style-prefix");
        if (sp != null)
            opts["status-style-prefix"] = sp;
        for (var index = 0; index < this.layer.childNodes.length; index++) {
            var itemLayer = this.layer.childNodes[index];
            if (itemLayer.tagName == "DIV") {
                var si = new MUIButton();
                si.initWithLayer(itemLayer, owner, opts);
                si.type = MUIButtonType.PushIn;
                this._addSegmentedItem(si);
                MUIOutletRegister(owner, si.layerID, si);
            }
        }
        if (this.segmentedItems.length > 0) {
            var item = this.segmentedItems[0];
            item.setSelected(true);
            this.selectedSegmentedIndex = 0;
        }
    };
    MUISegmentedControl.prototype._addSegmentedItem = function (item) {
        this.segmentedItems.push(item);
        item.setAction(this, this._didClickSegmentedButton);
    };
    MUISegmentedControl.prototype._didClickSegmentedButton = function (button) {
        var index = this.segmentedItems.indexOf(button);
        this.selectSegmentedAtIndex(index);
        if (this.mouseOutTarget != null)
            this.mouseOutAction.call(this.mouseOutTarget, index);
    };
    MUISegmentedControl.prototype.setAction = function (target, action) {
        this.mouseOutTarget = target;
        this.mouseOutAction = action;
    };
    MUISegmentedControl.prototype.selectSegmentedAtIndex = function (index) {
        if (this.selectedSegmentedIndex == index)
            return;
        if (this.selectedSegmentedIndex > -1) {
            var lastItem = this.segmentedItems[this.selectedSegmentedIndex];
            lastItem.setSelected(false);
        }
        this.selectedSegmentedIndex = index;
        var item = this.segmentedItems[this.selectedSegmentedIndex];
        item.setSelected(true);
    };
    return MUISegmentedControl;
}(MUIControl));
var MUIPageControl = (function (_super) {
    __extends(MUIPageControl, _super);
    function MUIPageControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.numberOfPages = 0;
        _this._items = [];
        _this._currentPage = -1;
        return _this;
    }
    MUIPageControl.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        for (var index = 0; index < this.layer.childNodes.length; index++) {
            var itemLayer = this.layer.childNodes[index];
            if (itemLayer.tagName == "DIV") {
                var i = new MUIButton();
                i.initWithLayer(itemLayer, owner, options);
                this._items.push(i);
            }
        }
        if (this._items.length > 0)
            this.currentPage = 0;
    };
    Object.defineProperty(MUIPageControl.prototype, "currentPage", {
        get: function () {
            return this._currentPage;
        },
        set: function (index) {
            if (this._currentPage == index)
                return;
            if (this._currentPage > -1) {
                var i = this._items[this._currentPage];
                i.setSelected(false);
            }
            var i = this._items[index];
            i.setSelected(true);
            this._currentPage = index;
        },
        enumerable: true,
        configurable: true
    });
    return MUIPageControl;
}(MUIControl));
var MUIToolbarButton = (function (_super) {
    __extends(MUIToolbarButton, _super);
    function MUIToolbarButton() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MUIToolbarButton.buttonWithLayer = function (layer, owner) {
        var lid = layer.getAttribute("id");
        var tb = new MUIToolbarButton(lid);
        tb.initWithLayer(layer, owner);
        return tb;
    };
    return MUIToolbarButton;
}(MUIButton));
var MUIToolbar = (function (_super) {
    __extends(MUIToolbar, _super);
    function MUIToolbar() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.buttons = [];
        return _this;
    }
    MUIToolbar.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var layer = this.layer.childNodes[index];
                if (layer.tagName == "DIV") {
                    var lid = layer.getAttribute("id");
                    var tb = new MUIToolbarButton(lid);
                    var button = MUIToolbarButton.buttonWithLayer(layer, owner);
                    button.parent = this;
                    this._linkViewToSubview(button);
                    this.addToolbarButton(button);
                }
            }
        }
    };
    MUIToolbar.prototype.addToolbarButton = function (button) {
        this.buttons.push(button);
    };
    return MUIToolbar;
}(MUIView));
var MUINavigationController = (function (_super) {
    __extends(MUINavigationController, _super);
    function MUINavigationController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.rootViewController = null;
        _this.viewControllersStack = [];
        _this.currentViewControllerIndex = -1;
        _this._pushAnimationController = null;
        _this._popAnimationController = null;
        return _this;
    }
    MUINavigationController.prototype.init = function () {
        _super.prototype.init.call(this);
        this.view.layer.style.overflow = "hidden";
    };
    MUINavigationController.prototype.initWithRootViewController = function (vc) {
        this.init();
        this.setRootViewController(vc);
    };
    MUINavigationController.prototype.setRootViewController = function (vc) {
        this.rootViewController = vc;
        this.view.addSubview(vc.view);
        this.viewControllersStack.push(vc);
        this.currentViewControllerIndex = 0;
        this.rootViewController.navigationController = this;
        this.addChildViewController(vc);
        if (this.presentationController != null) {
            var size = vc.preferredContentSize;
            this.contentSize = size;
        }
    };
    MUINavigationController.prototype.viewWillAppear = function (animated) {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewWillAppear(animated);
    };
    MUINavigationController.prototype.viewDidAppear = function (animated) {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewDidAppear(animated);
    };
    MUINavigationController.prototype.viewWillDisappear = function (animated) {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewWillDisappear(animated);
    };
    MUINavigationController.prototype.viewDidDisappear = function (animated) {
        if (this.currentViewControllerIndex < 0)
            return;
        var vc = this.viewControllersStack[this.currentViewControllerIndex];
        vc.viewDidDisappear(animated);
    };
    MUINavigationController.prototype.pushViewController = function (vc, animated) {
        var lastVC = this.viewControllersStack[this.currentViewControllerIndex];
        this.viewControllersStack.push(vc);
        this.currentViewControllerIndex++;
        vc.navigationController = this;
        if (vc.transitioningDelegate == null)
            vc.transitioningDelegate = this;
        vc.onLoadView(this, function () {
            this.view.addSubview(vc.view);
            this.addChildViewController(vc);
            if (vc.preferredContentSize != null)
                this.preferredContentSize = vc.preferredContentSize;
            _MIUShowViewController(lastVC, vc, this, false);
        });
    };
    MUINavigationController.prototype.popViewController = function (animated) {
        if (this.currentViewControllerIndex == 0)
            return;
        var fromVC = this.viewControllersStack[this.currentViewControllerIndex];
        this.currentViewControllerIndex--;
        this.viewControllersStack.pop();
        var toVC = this.viewControllersStack[this.currentViewControllerIndex];
        if (toVC.transitioningDelegate == null)
            toVC.transitioningDelegate = this;
        if (toVC.preferredContentSize != null)
            this.contentSize = toVC.preferredContentSize;
        _MUIHideViewController(fromVC, toVC, this, this, function () {
            fromVC.removeChildViewController(this);
            fromVC.view.removeFromSuperview();
        });
    };
    MUINavigationController.prototype.popToRootViewController = function (animated) {
        if (this.viewControllersStack.length == 1)
            return;
        var currentVC = this.viewControllersStack.pop();
        for (var index = this.currentViewControllerIndex - 1; index > 0; index--) {
            var vc = this.viewControllersStack.pop();
            vc.view.removeFromSuperview();
            this.removeChildViewController(vc);
        }
        this.currentViewControllerIndex = 0;
        var rootVC = this.viewControllersStack[0];
        this.contentSize = rootVC.preferredContentSize;
        _MUIHideViewController(currentVC, rootVC, this, this, function () {
            currentVC.view.removeFromSuperview();
            this.removeChildViewController(currentVC);
        });
    };
    Object.defineProperty(MUINavigationController.prototype, "preferredContentSize", {
        get: function () {
            if (this.currentViewControllerIndex < 0)
                return this._preferredContentSize;
            var vc = this.viewControllersStack[this.currentViewControllerIndex];
            return vc.preferredContentSize;
        },
        enumerable: true,
        configurable: true
    });
    MUINavigationController.prototype.animationControllerForPresentedController = function (presentedViewController, presentingViewController, sourceController) {
        if (this._pushAnimationController == null) {
            this._pushAnimationController = new MUIPushAnimationController();
            this._pushAnimationController.init();
        }
        return this._pushAnimationController;
    };
    MUINavigationController.prototype.animationControllerForDismissedController = function (dismissedController) {
        if (this._popAnimationController == null) {
            this._popAnimationController = new MUIPopAnimationController();
            this._popAnimationController.init();
        }
        return this._popAnimationController;
    };
    return MUINavigationController;
}(MUIViewController));
var MUIPushAnimationController = (function (_super) {
    __extends(MUIPushAnimationController, _super);
    function MUIPushAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MUIPushAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.25;
    };
    MUIPushAnimationController.prototype.animateTransition = function (transitionContext) {
    };
    MUIPushAnimationController.prototype.animationEnded = function (transitionCompleted) {
    };
    MUIPushAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.Push);
        return animations;
    };
    return MUIPushAnimationController;
}(MIOObject));
var MUIPopAnimationController = (function (_super) {
    __extends(MUIPopAnimationController, _super);
    function MUIPopAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MUIPopAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.25;
    };
    MUIPopAnimationController.prototype.animateTransition = function (transitionContext) {
    };
    MUIPopAnimationController.prototype.animationEnded = function (transitionCompleted) {
    };
    MUIPopAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.Pop);
        return animations;
    };
    return MUIPopAnimationController;
}(MIOObject));
var MUIPageController = (function (_super) {
    __extends(MUIPageController, _super);
    function MUIPageController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.selectedViewControllerIndex = 0;
        _this.pageControllersCount = 0;
        _this._pageAnimationController = null;
        return _this;
    }
    MUIPageController.prototype.addPageViewController = function (vc) {
        this.addChildViewController(vc);
        if (vc.transitioningDelegate == null)
            vc.transitioningDelegate = this;
        this.pageControllersCount++;
    };
    MUIPageController.prototype._loadChildControllers = function () {
        var vc = this.childViewControllers[0];
        this.view.addSubview(vc.view);
        vc.onLoadView(this, function () {
            this._setViewLoaded(true);
        });
    };
    MUIPageController.prototype.viewWillAppear = function (animated) {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewWillAppear(animated);
    };
    MUIPageController.prototype.viewDidAppear = function (animated) {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewDidAppear(animated);
    };
    MUIPageController.prototype.viewWillDisappear = function (animated) {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewWillDisappear(animated);
    };
    MUIPageController.prototype.viewDidDisappear = function (animated) {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewDidDisappear(animated);
    };
    MUIPageController.prototype.showPageAtIndex = function (index) {
        if (this.selectedViewControllerIndex == -1)
            return;
        if (index == this.selectedViewControllerIndex)
            return;
        if (index < 0)
            return;
        if (index >= this.childViewControllers.length)
            return;
        var oldVC = this.childViewControllers[this.selectedViewControllerIndex];
        var newVC = this.childViewControllers[index];
        this.selectedViewControllerIndex = index;
        newVC.onLoadView(this, function () {
            this.view.addSubview(newVC.view);
            this.addChildViewController(newVC);
            _MIUShowViewController(oldVC, newVC, this, this, function () {
                oldVC.view.removeFromSuperview();
            });
        });
    };
    MUIPageController.prototype.showNextPage = function () {
        this.showPageAtIndex(this.selectedViewControllerIndex + 1);
    };
    MUIPageController.prototype.showPrevPage = function () {
        this.showPageAtIndex(this.selectedViewControllerIndex - 1);
    };
    MUIPageController.prototype.animationControllerForPresentedController = function (presentedViewController, presentingViewController, sourceController) {
        if (this._pageAnimationController == null) {
            this._pageAnimationController = new MIOPageAnimationController();
            this._pageAnimationController.init();
        }
        return this._pageAnimationController;
    };
    MUIPageController.prototype.animationControllerForDismissedController = function (dismissedController) {
        if (this._pageAnimationController == null) {
            this._pageAnimationController = new MIOPageAnimationController();
            this._pageAnimationController.init();
        }
        return this._pageAnimationController;
    };
    return MUIPageController;
}(MUIViewController));
var MIOPageAnimationController = (function (_super) {
    __extends(MIOPageAnimationController, _super);
    function MIOPageAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOPageAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0;
    };
    MIOPageAnimationController.prototype.animateTransition = function (transitionContext) {
    };
    MIOPageAnimationController.prototype.animationEnded = function (transitionCompleted) {
    };
    MIOPageAnimationController.prototype.animations = function (transitionContext) {
        return null;
    };
    return MIOPageAnimationController;
}(MIOObject));
var MUISplitViewController = (function (_super) {
    __extends(MUISplitViewController, _super);
    function MUISplitViewController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._masterViewController = null;
        _this._detailViewController = null;
        _this._masterView = null;
        _this._detailView = null;
        return _this;
    }
    MUISplitViewController.prototype.init = function () {
        _super.prototype.init.call(this);
        this._masterView = new MUIView();
        this._masterView.init();
        this._masterView.layer.style.width = "320px";
        this.view.addSubview(this._masterView);
        this._detailView = new MUIView();
        this._detailView.init();
        this._detailView.layer.style.left = "320px";
        this._detailView.layer.style.width = "auto";
        this._detailView.layer.style.right = "0px";
        this.view.addSubview(this._detailView);
    };
    MUISplitViewController.prototype.setMasterViewController = function (vc) {
        if (this._masterViewController != null) {
            this._masterViewController.view.removeFromSuperview();
            this.removeChildViewController(this._masterViewController);
            this._masterViewController = null;
        }
        if (vc != null) {
            vc.parent = this;
            vc.splitViewController = this;
            this._masterView.addSubview(vc.view);
            this.addChildViewController(vc);
            this._masterViewController = vc;
        }
    };
    MUISplitViewController.prototype.setDetailViewController = function (vc) {
        if (this._detailViewController != null) {
            this._detailViewController.view.removeFromSuperview();
            this.removeChildViewController(this._detailViewController);
            this._detailViewController = null;
        }
        if (vc != null) {
            vc.parent = this;
            vc.splitViewController = this;
            this._detailView.addSubview(vc.view);
            this.addChildViewController(vc);
            this._detailViewController = vc;
        }
    };
    MUISplitViewController.prototype.showDetailViewController = function (vc) {
        var oldVC = this._detailViewController;
        var newVC = vc;
        if (oldVC == newVC)
            return;
        newVC.onLoadView(this, function () {
            this._detailView.addSubview(newVC.view);
            this.addChildViewController(newVC);
            this._detailViewController = vc;
            _MIUShowViewController(oldVC, newVC, this, this, function () {
                oldVC.view.removeFromSuperview();
                this.removeChildViewController(oldVC);
            });
        });
    };
    Object.defineProperty(MUISplitViewController.prototype, "masterViewController", {
        get: function () {
            return this._masterViewController;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUISplitViewController.prototype, "detailViewController", {
        get: function () {
            return this._detailViewController;
        },
        enumerable: true,
        configurable: true
    });
    return MUISplitViewController;
}(MUIViewController));
var MIOTabBarController = (function (_super) {
    __extends(MIOTabBarController, _super);
    function MIOTabBarController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.tabBar = null;
        _this.pageController = null;
        return _this;
    }
    MIOTabBarController.prototype.viewDidLoad = function () {
        _super.prototype.viewDidLoad.call(this);
        this.tabBar = new MUITabBar(this.layerID + "tabbar");
        this.view.addSubview(this.tabBar);
    };
    MIOTabBarController.prototype.addTabBarViewController = function (vc) {
        this.addChildViewController(vc);
        vc.onLoadLayer(this, function () {
            this.tabBar.addTabBarItem(vc.tabBarItem);
            this.pageController.addPageViewController(vc);
        });
    };
    return MIOTabBarController;
}(MUIViewController));
var MUIAlertViewStyle;
(function (MUIAlertViewStyle) {
    MUIAlertViewStyle[MUIAlertViewStyle["Default"] = 0] = "Default";
})(MUIAlertViewStyle || (MUIAlertViewStyle = {}));
var MUIAlertActionStyle;
(function (MUIAlertActionStyle) {
    MUIAlertActionStyle[MUIAlertActionStyle["Default"] = 0] = "Default";
    MUIAlertActionStyle[MUIAlertActionStyle["Cancel"] = 1] = "Cancel";
    MUIAlertActionStyle[MUIAlertActionStyle["Destructive"] = 2] = "Destructive";
})(MUIAlertActionStyle || (MUIAlertActionStyle = {}));
var MUIAlertItemType;
(function (MUIAlertItemType) {
    MUIAlertItemType[MUIAlertItemType["None"] = 0] = "None";
    MUIAlertItemType[MUIAlertItemType["Action"] = 1] = "Action";
    MUIAlertItemType[MUIAlertItemType["TextField"] = 2] = "TextField";
    MUIAlertItemType[MUIAlertItemType["ComboBox"] = 3] = "ComboBox";
})(MUIAlertItemType || (MUIAlertItemType = {}));
var MUIAlertItem = (function (_super) {
    __extends(MUIAlertItem, _super);
    function MUIAlertItem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = MUIAlertItemType.None;
        return _this;
    }
    MUIAlertItem.prototype.initWithType = function (type) {
        this.type = type;
    };
    return MUIAlertItem;
}(MIOObject));
var MUIAlertTextField = (function (_super) {
    __extends(MUIAlertTextField, _super);
    function MUIAlertTextField() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.textField = null;
        return _this;
    }
    MUIAlertTextField.prototype.initWithConfigurationHandler = function (target, handler) {
        _super.prototype.initWithType.call(this, MUIAlertItemType.TextField);
        this.textField = new MUITextField();
        this.textField.init();
        if (target != null && handler != null) {
            handler.call(target, this.textField);
        }
    };
    return MUIAlertTextField;
}(MUIAlertItem));
var MUIAlertComboBox = (function (_super) {
    __extends(MUIAlertComboBox, _super);
    function MUIAlertComboBox() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.comboBox = null;
        return _this;
    }
    MUIAlertComboBox.prototype.initWithConfigurationHandler = function (target, handler) {
        _super.prototype.initWithType.call(this, MUIAlertItemType.ComboBox);
        this.comboBox = new MUIComboBox();
        this.comboBox.init();
        if (target != null && handler != null) {
            handler.call(target, this.comboBox);
        }
    };
    return MUIAlertComboBox;
}(MUIAlertItem));
var MUIAlertAction = (function (_super) {
    __extends(MUIAlertAction, _super);
    function MUIAlertAction() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.title = null;
        _this.style = MUIAlertActionStyle.Default;
        _this.target = null;
        _this.completion = null;
        return _this;
    }
    MUIAlertAction.alertActionWithTitle = function (title, style, target, completion) {
        var action = new MUIAlertAction();
        action.initWithTitle(title, style);
        action.target = target;
        action.completion = completion;
        return action;
    };
    MUIAlertAction.prototype.initWithTitle = function (title, style) {
        _super.prototype.initWithType.call(this, MUIAlertItemType.Action);
        this.title = title;
        this.style = style;
    };
    return MUIAlertAction;
}(MUIAlertItem));
var MUIAlertViewController = (function (_super) {
    __extends(MUIAlertViewController, _super);
    function MUIAlertViewController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.textFields = [];
        _this.comboBoxes = [];
        _this.target = null;
        _this.completion = null;
        _this._items = [];
        _this._title = null;
        _this._message = null;
        _this._style = MUIAlertViewStyle.Default;
        _this._backgroundView = null;
        _this._tableView = null;
        _this._headerCell = null;
        _this._alertViewSize = new MIOSize(320, 50);
        _this._fadeInAnimationController = null;
        _this._fadeOutAnimationController = null;
        return _this;
    }
    MUIAlertViewController.prototype.initWithTitle = function (title, message, style) {
        _super.prototype.init.call(this);
        this.modalPresentationStyle = MUIModalPresentationStyle.FormSheet;
        this._title = title;
        this._message = message;
        this._style = style;
        this.transitioningDelegate = this;
    };
    MUIAlertViewController.prototype.viewDidLoad = function () {
        _super.prototype.viewDidLoad.call(this);
        this._backgroundView = new MUIView();
        this._backgroundView.init();
        this._backgroundView.layer.style.background = "";
        if (MIOCoreGetBrowser() == MIOCoreBrowserType.Safari)
            this._backgroundView.layer.classList.add("alertview_background_safari");
        else
            this._backgroundView.layer.classList.add("alertview_background");
        this.view.addSubview(this._backgroundView);
        this._tableView = new MUITableView();
        this._tableView.init();
        this._tableView.dataSource = this;
        this._tableView.delegate = this;
        this._tableView.layer.style.background = "";
        this.view.addSubview(this._tableView);
        this.view.layer.style.background = "";
        this.view.layer.classList.add("alertview_window");
    };
    MUIAlertViewController.prototype.viewDidAppear = function (animated) {
        _super.prototype.viewDidAppear.call(this, animated);
        this._tableView.reloadData();
    };
    MUIAlertViewController.prototype.viewWillDisappear = function (animated) {
        _super.prototype.viewWillDisappear.call(this, animated);
        if (this.target != null && this.completion != null) {
            this.completion.call(this.target);
        }
    };
    Object.defineProperty(MUIAlertViewController.prototype, "preferredContentSize", {
        get: function () {
            return this._alertViewSize;
        },
        enumerable: true,
        configurable: true
    });
    MUIAlertViewController.prototype._addItem = function (item) {
        this._items.push(item);
        this._calculateContentSize();
    };
    MUIAlertViewController.prototype.addAction = function (action) {
        this._addItem(action);
    };
    MUIAlertViewController.prototype.addTextFieldWithConfigurationHandler = function (target, handler) {
        var ai = new MUIAlertTextField();
        ai.initWithConfigurationHandler(target, handler);
        this.textFields.push(ai.textField);
        this._addItem(ai);
    };
    MUIAlertViewController.prototype.addComboBoxWithConfigurationHandler = function (target, handler) {
        var ac = new MUIAlertComboBox();
        ac.initWithConfigurationHandler(target, handler);
        this.comboBoxes.push(ac.comboBox);
        this._addItem(ac);
    };
    MUIAlertViewController.prototype.addCompletionHandler = function (target, handler) {
        this.target = target;
        this.completion = handler;
    };
    MUIAlertViewController.prototype._calculateContentSize = function () {
        var h = 80 + (this._items.length * 50) + 1;
        this._alertViewSize = new MIOSize(320, h);
    };
    MUIAlertViewController.prototype.numberOfSections = function (tableview) {
        return 1;
    };
    MUIAlertViewController.prototype.numberOfRowsInSection = function (tableview, section) {
        return this._items.length + 1;
    };
    MUIAlertViewController.prototype.cellAtIndexPath = function (tableview, indexPath) {
        var cell = null;
        if (indexPath.row == 0) {
            cell = this._createHeaderCell();
        }
        else {
            var item = this._items[indexPath.row - 1];
            if (item.type == MUIAlertItemType.Action) {
                cell = this._createActionCellWithTitle(item.title, item.style);
            }
            else if (item.type == MUIAlertItemType.TextField) {
                cell = this._createTextFieldCell(item.textField);
            }
            else if (item.type == MUIAlertItemType.ComboBox) {
                cell = this._createComboBoxCell(item.comboBox);
            }
        }
        cell.separatorStyle = MUITableViewCellSeparatorStyle.None;
        return cell;
    };
    MUIAlertViewController.prototype.heightForRowAtIndexPath = function (tableView, indexPath) {
        var h = 50;
        if (indexPath.row == 0)
            h = 80;
        return h;
    };
    MUIAlertViewController.prototype.canSelectCellAtIndexPath = function (tableview, indexPath) {
        if (indexPath.row == 0)
            return false;
        var item = this._items[indexPath.row - 1];
        if (item.type == MUIAlertItemType.Action)
            return true;
        return false;
    };
    MUIAlertViewController.prototype.didSelectCellAtIndexPath = function (tableView, indexPath) {
        var item = this._items[indexPath.row - 1];
        if (item.type == MUIAlertItemType.Action) {
            if (item.target != null && item.completion != null)
                item.completion.call(item.target);
            this.dismissViewController(true);
        }
    };
    MUIAlertViewController.prototype._createHeaderCell = function () {
        var cell = new MUITableViewCell();
        cell.initWithStyle(MUITableViewCellStyle.Custom);
        var titleLabel = new MUILabel();
        titleLabel.init();
        titleLabel.text = this._title;
        titleLabel.layer.style.left = "";
        titleLabel.layer.style.top = "";
        titleLabel.layer.style.right = "";
        titleLabel.layer.style.height = "";
        titleLabel.layer.style.width = "";
        titleLabel.layer.style.background = "";
        titleLabel.layer.classList.add("alertview_title");
        cell.addSubview(titleLabel);
        var messageLabel = new MUILabel();
        messageLabel.init();
        messageLabel.text = this._message;
        messageLabel.layer.style.left = "";
        messageLabel.layer.style.top = "";
        messageLabel.layer.style.right = "";
        messageLabel.layer.style.height = "";
        messageLabel.layer.style.width = "";
        messageLabel.layer.style.background = "";
        messageLabel.layer.classList.add("alertview_subtitle");
        cell.addSubview(messageLabel);
        cell.layer.style.background = "transparent";
        return cell;
    };
    MUIAlertViewController.prototype._createActionCellWithTitle = function (title, style) {
        var cell = new MUITableViewCell();
        cell.initWithStyle(MUITableViewCellStyle.Custom);
        var buttonLabel = new MUILabel();
        buttonLabel.init();
        buttonLabel.text = title;
        buttonLabel.layer.style.left = "";
        buttonLabel.layer.style.top = "";
        buttonLabel.layer.style.right = "";
        buttonLabel.layer.style.height = "";
        buttonLabel.layer.style.width = "";
        buttonLabel.layer.style.background = "";
        cell.addSubview(buttonLabel);
        cell.layer.style.background = "transparent";
        switch (style) {
            case MUIAlertActionStyle.Default:
                cell.layer.classList.add("alertview_default_action");
                buttonLabel.layer.classList.add("alertview_default_action_title");
                break;
            case MUIAlertActionStyle.Cancel:
                cell.layer.classList.add("alertview_cancel_action");
                buttonLabel.layer.classList.add("alertview_cancel_action_title");
                break;
            case MUIAlertActionStyle.Destructive:
                cell.layer.classList.add("alertview_destructive_action");
                buttonLabel.layer.classList.add("alertview_destructive_action_title");
                break;
        }
        return cell;
    };
    MUIAlertViewController.prototype._createTextFieldCell = function (textField) {
        var cell = new MUITableViewCell();
        cell.initWithStyle(MUITableViewCellStyle.Custom);
        textField.layer.style.left = "";
        textField.layer.style.top = "";
        textField.layer.style.right = "";
        textField.layer.style.height = "";
        textField.layer.style.width = "";
        textField.layer.style.background = "";
        textField.layer.classList.add("alertview_cell_textfield");
        cell.addSubview(textField);
        return cell;
    };
    MUIAlertViewController.prototype._createComboBoxCell = function (comboBox) {
        var cell = new MUITableViewCell();
        cell.initWithStyle(MUITableViewCellStyle.Custom);
        comboBox.layer.style.background = "";
        comboBox.layer.classList.add("alertview_cell_combobox");
        cell.addSubview(comboBox);
        return cell;
    };
    MUIAlertViewController.prototype.animationControllerForPresentedController = function (presentedViewController, presentingViewController, sourceController) {
        if (this._fadeInAnimationController == null) {
            this._fadeInAnimationController = new MUIAlertFadeInAnimationController();
            this._fadeInAnimationController.init();
        }
        return this._fadeInAnimationController;
    };
    MUIAlertViewController.prototype.animationControllerForDismissedController = function (dismissedController) {
        if (this._fadeOutAnimationController == null) {
            this._fadeOutAnimationController = new MUIAlertFadeOutAnimationController();
            this._fadeOutAnimationController.init();
        }
        return this._fadeOutAnimationController;
    };
    return MUIAlertViewController;
}(MUIViewController));
var MUIAlertFadeInAnimationController = (function (_super) {
    __extends(MUIAlertFadeInAnimationController, _super);
    function MUIAlertFadeInAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MUIAlertFadeInAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.25;
    };
    MUIAlertFadeInAnimationController.prototype.animateTransition = function (transitionContext) {
    };
    MUIAlertFadeInAnimationController.prototype.animationEnded = function (transitionCompleted) {
    };
    MUIAlertFadeInAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.FadeIn);
        return animations;
    };
    return MUIAlertFadeInAnimationController;
}(MIOObject));
var MUIAlertFadeOutAnimationController = (function (_super) {
    __extends(MUIAlertFadeOutAnimationController, _super);
    function MUIAlertFadeOutAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MUIAlertFadeOutAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.25;
    };
    MUIAlertFadeOutAnimationController.prototype.animateTransition = function (transitionContext) {
    };
    MUIAlertFadeOutAnimationController.prototype.animationEnded = function (transitionCompleted) {
    };
    MUIAlertFadeOutAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.FadeOut);
        return animations;
    };
    return MUIAlertFadeOutAnimationController;
}(MIOObject));
var MUICalendarDayCellType;
(function (MUICalendarDayCellType) {
    MUICalendarDayCellType[MUICalendarDayCellType["Default"] = 0] = "Default";
    MUICalendarDayCellType[MUICalendarDayCellType["Custom"] = 1] = "Custom";
})(MUICalendarDayCellType || (MUICalendarDayCellType = {}));
var MUICalendarDayCell = (function (_super) {
    __extends(MUICalendarDayCell, _super);
    function MUICalendarDayCell() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = MUICalendarDayCellType.Default;
        _this.identifier = null;
        _this._date = null;
        _this._day = null;
        _this._month = null;
        _this._year = null;
        _this._titleLabel = null;
        _this._selected = false;
        _this._isToday = false;
        return _this;
    }
    Object.defineProperty(MUICalendarDayCell.prototype, "date", {
        get: function () {
            return this._date;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUICalendarDayCell.prototype, "selected", {
        get: function () { return this._selected; },
        set: function (value) { this.setSelected(value); },
        enumerable: true,
        configurable: true
    });
    MUICalendarDayCell.prototype.init = function () {
        _super.prototype.init.call(this);
        this.type = MUICalendarDayCellType.Default;
        this.layer.style.background = "";
        this._titleLabel = new MUILabel();
        this._titleLabel.init();
        this.addSubview(this._titleLabel);
        this._titleLabel.layer.style.background = "";
        this._titleLabel.layer.style.left = "";
        this._titleLabel.layer.style.top = "";
        this._titleLabel.layer.style.width = "";
        this._titleLabel.layer.style.height = "";
        this._setupLayer();
    };
    MUICalendarDayCell.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        this.type = MUICalendarDayCellType.Custom;
        this._setupLayer();
    };
    MUICalendarDayCell.prototype._setupLayer = function () {
        var instance = this;
        this.layer.onclick = function () {
            instance._onClick.call(instance);
        };
    };
    MUICalendarDayCell.prototype._onClick = function () {
        this.setSelected(true);
    };
    MUICalendarDayCell.prototype.setDate = function (date) {
        this._date = new Date(date.getTime());
        this._day = date.getDate();
        this._month = date.getMonth();
        this._year = date.getFullYear();
        var today = new Date();
        var d = today.getDate();
        var m = today.getMonth();
        var y = today.getFullYear();
        if (this.type == MUICalendarDayCellType.Default)
            this._titleLabel.text = date.getDate();
        var isToday = (this._day == d && this._month == m && this._year == y);
        this.setToday(isToday);
    };
    MUICalendarDayCell.prototype.setToday = function (value) {
        if (this.type == MUICalendarDayCellType.Custom)
            return;
        if (value) {
            this.layer.classList.remove("calendarview_day_cell");
            this._titleLabel.layer.classList.remove("calendarview_day_title");
            this.layer.classList.add("calendarview_today_day_cell");
            this._titleLabel.layer.classList.add("calendarview_today_day_title");
        }
        else {
            this.layer.classList.add("calendarview_day_cell");
            this._titleLabel.layer.classList.add("calendarview_day_title");
            this.layer.classList.remove("calendarview_today_day_cell");
            this._titleLabel.layer.classList.remove("calendarview_today_day_title");
        }
    };
    MUICalendarDayCell.prototype.setSelected = function (value) {
        if (this._selected == value)
            return;
        this.willChangeValue("selected");
        this._selected = value;
        this.didChangeValue("selected");
    };
    return MUICalendarDayCell;
}(MUIView));
var MUICalendarMonthView = (function (_super) {
    __extends(MUICalendarMonthView, _super);
    function MUICalendarMonthView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._month = null;
        _this._year = null;
        _this.firstDate = null;
        _this.lastDate = null;
        _this.cellSpacingX = 0;
        _this.cellSpacingY = 0;
        _this._header = null;
        _this._headerTitleLabel = null;
        _this._dayViews = [];
        _this._dayViewIndex = 0;
        _this._weekRows = 0;
        _this._delegate = null;
        return _this;
    }
    Object.defineProperty(MUICalendarMonthView.prototype, "month", {
        get: function () {
            return this._month;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUICalendarMonthView.prototype, "year", {
        get: function () {
            return this._year;
        },
        enumerable: true,
        configurable: true
    });
    MUICalendarMonthView.prototype.initWithMonth = function (month, year, delegate) {
        _super.prototype.init.call(this);
        this._delegate = delegate;
        this.layer.style.position = "relative";
        this.layer.style.background = "";
        this._header = new MUIView();
        this._header.initWithLayer(MUICoreLayerCreateWithStyle("calendarview_month_header"), this);
        this.addSubview(this._header);
        this._headerTitleLabel = new MUILabel();
        this._headerTitleLabel.initWithLayer(MUICoreLayerCreateWithStyle("calendarview_month_header_title"), this);
        this._header.addSubview(this._headerTitleLabel);
        var w = 100 / 7;
        for (var index = 0; index < 7; index++) {
            var dayLabel = new MUILabel();
            dayLabel.initWithLayer(MUICoreLayerCreateWithStyle("calendarview_month_header_day_title"), this);
            dayLabel.layer.style.left = (w * index) + "%";
            dayLabel.layer.style.width = w + "%";
            dayLabel.text = MIODateGetStringForDay(index).substr(0, 2);
            this._header.addSubview(dayLabel);
        }
        this.setMonth(month, year);
    };
    MUICalendarMonthView.prototype.setMonth = function (month, year) {
        if (month < 0) {
            this._month = 11;
            this._year = year - 1;
        }
        else if (month > 11) {
            this._month = 0;
            this._year = year + 1;
        }
        else {
            this._month = month;
            this._year = year;
        }
        for (var count = 0; count < this._dayViews.length; count++) {
            var dayCell = this._dayViews[count];
            var identifier = dayCell.identifier;
            this._delegate._reuseDayCell(dayCell, identifier);
            dayCell.removeFromSuperview();
        }
        this._dayViews = [];
        this._dayViewIndex = 0;
        this._setupHeader();
        this._setupDays();
    };
    MUICalendarMonthView.prototype._setupHeader = function () {
        this._headerTitleLabel.text = MIODateGetStringForMonth(this._month) + " " + this._year;
    };
    MUICalendarMonthView.prototype._dayCellAtDate = function (date) {
        var dv = this._delegate._cellDayAtDate(date);
        this._dayViewIndex++;
        return dv;
    };
    MUICalendarMonthView.prototype._setupDays = function () {
        this.firstDate = new Date(this._year, this._month, 1);
        this.lastDate = new Date(this._year, this._month + 1, 0);
        var currentDate = new Date(this._year, this._month, 1);
        var rowIndex = MIODateGetDayFromDate(currentDate) == 0 ? -1 : 0;
        while (this.lastDate >= currentDate) {
            var dayView = this._dayCellAtDate(currentDate);
            this._dayViews.push(dayView);
            this.addSubview(dayView);
            dayView.setDate(currentDate);
            if (MIODateGetDayFromDate(dayView.date) == 0)
                rowIndex++;
            dayView.weekRow = rowIndex;
            currentDate.setDate(currentDate.getDate() + 1);
        }
        this._weekRows = rowIndex + 1;
    };
    MUICalendarMonthView.prototype.layoutSubviews = function () {
        var headerHeight = this._header.getHeight() + 1;
        var x = 0;
        var y = 0;
        var w = this.frame.size.width / 7;
        var h = (this.getHeight() - headerHeight - this.cellSpacingY) / this._weekRows;
        var marginX = this.cellSpacingX / 2;
        var marginW = marginX * 2;
        var offsetX = [marginX, w + marginX, (w * 2) + marginX, (w * 3) + marginX, (w * 4) + marginX, (w * 5) + marginX, (w * 6) + marginX];
        var marginY = this.cellSpacingY / 2;
        var marginH = marginY * 2;
        for (var index = 0; index < this._dayViews.length; index++) {
            var dv = this._dayViews[index];
            x = offsetX[MIODateGetDayFromDate(dv.date)];
            y = headerHeight + (dv.weekRow * h) + marginY;
            dv.setFrame(MIORect.rectWithValues(x, y, (w - marginW), (h - marginH)));
            dv.layoutSubviews();
        }
    };
    return MUICalendarMonthView;
}(MUIView));
var MUICalendarView = (function (_super) {
    __extends(MUICalendarView, _super);
    function MUICalendarView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataSource = null;
        _this.delegate = null;
        _this.minDate = null;
        _this.maxDate = null;
        _this.horizontalCellSpacing = 0;
        _this.verticalCellSpacing = 0;
        _this.selectedDate = null;
        _this._selectedDayCell = null;
        _this._today = new Date();
        _this._currentMonth = _this._today.getMonth();
        _this._cellPrototypes = {};
        _this._reusablePrototypeDayCells = {};
        _this._reusableDayCells = [];
        _this._views = [];
        _this._visibleDayCells = {};
        _this.scrollTopLimit = 0;
        _this.scrollBottomLimit = 0;
        _this.initialReload = false;
        _this.lastContentOffsetY = 0;
        return _this;
    }
    Object.defineProperty(MUICalendarView.prototype, "today", {
        get: function () { return this._today; },
        enumerable: true,
        configurable: true
    });
    MUICalendarView.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setup();
    };
    MUICalendarView.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        this._setup();
        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var subLayer = this.layer.childNodes[index];
                if (subLayer.tagName != "DIV")
                    continue;
                if (subLayer.getAttribute("data-cell-identifier") != null) {
                    this._addCellPrototypeWithLayer(subLayer);
                    subLayer.style.display = "none";
                }
            }
        }
    };
    MUICalendarView.prototype._setup = function () {
    };
    MUICalendarView.prototype._addCellPrototypeWithLayer = function (subLayer) {
        var cellIdentifier = subLayer.getAttribute("data-cell-identifier");
        var cellClassname = subLayer.getAttribute("data-class");
        if (cellClassname == null)
            cellClassname = "MUICalendarCell";
        var item = {};
        item["class"] = cellClassname;
        item["layer"] = subLayer;
        this._cellPrototypes[cellIdentifier] = item;
    };
    MUICalendarView.prototype._reuseDayCell = function (cell, identifier) {
        if (identifier == null)
            this._reusableDayCells.push(cell);
        else {
            var array = this._reusablePrototypeDayCells[identifier];
            if (array == null) {
                array = [];
                this._reusablePrototypeDayCells[identifier] = array;
            }
            array.push(cell);
            delete this._visibleDayCells[cell.date];
        }
    };
    MUICalendarView.prototype._cellDayAtDate = function (date) {
        var dayCell = null;
        if (this.dataSource != null && typeof this.dataSource.dayCellAtDate === "function")
            dayCell = this.dataSource.dayCellAtDate(this, date);
        if (dayCell == null) {
            dayCell = this.dequeueReusableDayCellWithIdentifier();
        }
        this._visibleDayCells[date] = dayCell;
        return dayCell;
    };
    MUICalendarView.prototype.cellDayAtDate = function (date) {
        return this._visibleDayCells[date];
    };
    MUICalendarView.prototype.dequeueReusableDayCellWithIdentifier = function (identifier) {
        var dv = null;
        if (identifier != null) {
            var cells = this._reusablePrototypeDayCells[identifier];
            if (cells != null && cells.length > 0) {
                dv = cells[0];
                cells.splice(0, 1);
            }
            else {
                var item = this._cellPrototypes[identifier];
                if (item == null)
                    throw ("Calendar day identifier doesn't exist.");
                var className = item["class"];
                dv = Object.create(window[className].prototype);
                dv.constructor.apply(dv);
                var layer = item["layer"];
                if (layer != null) {
                    var newLayer = layer.cloneNode(true);
                    newLayer.style.display = "";
                    dv.initWithLayer(newLayer);
                    dv.awakeFromHTML();
                }
                dv.addObserver(this, "selected");
            }
        }
        else {
            if (this._reusableDayCells.length > 0) {
                dv = this._reusableDayCells[0];
                this._reusableDayCells.splice(0, 1);
            }
            else {
                dv = new MUICalendarDayCell();
                dv.init();
                dv.addObserver(this, "selected");
            }
        }
        return dv;
    };
    MUICalendarView.prototype.reloadData = function () {
        for (var index = 0; index < this._views.length; index++) {
            var view = this._views[index];
            view.removeFromSuperview();
        }
        this._views = [];
        var currentYear = 2017;
        var currentMonth = 0;
        if (this.minDate != null) {
            var firstDay = new Date(currentYear, currentMonth + 1, 1);
            if (firstDay <= this.minDate)
                currentMonth += 1;
        }
        for (var index = 0; index < 24; index++) {
            var mv = new MUICalendarMonthView();
            mv.initWithMonth(currentMonth, currentYear, this);
            mv.cellSpacingX = this.horizontalCellSpacing;
            mv.cellSpacingY = this.verticalCellSpacing;
            this.addSubview(mv);
            this._views.push(mv);
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
        }
        this.initialReload = true;
        this.setNeedsDisplay();
    };
    MUICalendarView.prototype.layoutSubviews = function () {
        if (this._viewIsVisible == false)
            return;
        if (this.hidden == true)
            return;
        if (this.initialReload == true) {
            this.initialReload = false;
            this.initialLayout();
        }
        else {
        }
    };
    MUICalendarView.prototype.initialLayout = function () {
        var w = this.getWidth() - this.horizontalCellSpacing;
        var h = this.getHeight();
        var x = 0;
        var y = 0;
        for (var index = 0; index < this._views.length; index++) {
            var mv = this._views[index];
            mv.setFrame(MIORect.rectWithValues(x, y, w, h));
            mv.layer.style.top = "";
            mv.layoutSubviews();
            y += h;
        }
        var middle = h / 2;
        this.scrollTopLimit = middle;
        this.scrollBottomLimit = h + middle;
        var ws = this.getWidth();
        var hs = y;
        this.contentSize = new MIOSize(ws, y);
        this.scrollToDate(this.today);
        this.lastContentOffsetY = this.contentOffset.y;
    };
    MUICalendarView.prototype.scrollLayout = function () {
        var scrollDown = false;
        var offsetY = 0;
        if (this.contentOffset.y == this.lastContentOffsetY)
            return;
        if (this.contentOffset.y > this.lastContentOffsetY) {
            offsetY = this.contentOffset.y - this.lastContentOffsetY;
            scrollDown = true;
        }
        else if (this.contentOffset.y < this.lastContentOffsetY) {
            offsetY = this.lastContentOffsetY - this.contentOffset.y;
            scrollDown = false;
        }
        if (offsetY < this.scrollTopLimit)
            return;
        this.lastContentOffsetY = this.contentOffset.y;
        if (scrollDown == false) {
            var firstMonth = this._views[0];
            var currentMonth = this._views[1];
            var lastMonth = this._views[2];
            if (this.minDate != null && firstMonth.firstDate <= this.minDate)
                return;
            lastMonth.setMonth(firstMonth.month - 1, firstMonth.year);
            this._views[0] = lastMonth;
            this._views[1] = firstMonth;
            this._views[2] = currentMonth;
            console.log("Offset y: " + this.contentOffset.y);
            lastMonth.removeFromSuperview();
            this.addSubview(lastMonth, 0);
            console.log("Offset y: " + this.contentOffset.y);
            lastMonth.layoutSubviews();
            if (MIOCoreGetBrowser() == MIOCoreBrowserType.Safari) {
                var offsetY = this.getHeight() + this.contentOffset.y;
                this.scrollToPoint(0, offsetY);
            }
        }
        else {
            var firstMonth = this._views[0];
            var currentMonth = this._views[1];
            var lastMonth = this._views[2];
            if (this.maxDate != null && lastMonth.lastDate > this.maxDate)
                return;
            firstMonth.setMonth(lastMonth.month + 1, lastMonth.year);
            this._views[0] = currentMonth;
            this._views[1] = lastMonth;
            this._views[2] = firstMonth;
            var hs = this.getHeight();
            var newY = this.contentOffset.y - this.getHeight();
            console.log("Offset y: " + this.contentOffset.y + " H: " + hs);
            firstMonth.removeFromSuperview();
            this.addSubview(firstMonth);
            console.log("Offset y: " + this.contentOffset.y + " new Y: " + newY);
            firstMonth.layoutSubviews();
            if (MIOCoreGetBrowser() == MIOCoreBrowserType.Safari) {
                this.scrollToPoint(0, newY);
            }
            this.scrollToPoint(0, newY);
            this.lastContentOffsetY = newY;
        }
    };
    MUICalendarView.prototype.observeValueForKeyPath = function (key, type, object) {
        if (key == "selected" && type == "did") {
            this._didChangeDayCellSelectedValue(object);
        }
    };
    MUICalendarView.prototype._didChangeDayCellSelectedValue = function (dayCell) {
        if (dayCell.selected == true) {
            var canSelect = true;
            if (this.delegate != null && typeof this.delegate.canSelectDate === "function") {
                canSelect = this.delegate.canSelectDate.call(this.delegate, this, dayCell.date);
            }
            if (this.delegate == null)
                return;
            if (canSelect == true && typeof this.delegate.didSelectDayCellAtDate === "function") {
                if (this._selectedDayCell != null)
                    this._selectedDayCell.setSelected(false);
                this.selectedDate = dayCell.date;
                this._selectedDayCell = dayCell;
                this.delegate.didSelectDayCellAtDate.call(this.delegate, this, dayCell.date);
            }
        }
    };
    MUICalendarView.prototype.scrollToDate = function (date) {
        var firstMonthView = this._views[0];
        var firstMonth = firstMonthView.month;
        var firstYear = firstMonthView.year;
        var currentMonth = date.getMonth();
        var currentYear = date.getFullYear();
        var h = this.getHeight();
        var count = 0;
        var yy = currentYear - firstYear;
        if (yy <= 0) {
            count = currentMonth - firstMonth;
        }
        else {
            count = 11 - firstMonth;
            count += ((yy - 1) * 12);
            count += currentMonth + 1;
        }
        if (count != 0) {
            var y = h * count;
            this.scrollToPoint(0, y);
        }
    };
    MUICalendarView.prototype.deselectCellAtDate = function (date) {
        if (this.selectedDate == date)
            this._selectedDayCell.setSelected(false);
    };
    return MUICalendarView;
}(MUIScrollView));
function MIOCalendarGetStringFromDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();
    var d = yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]);
    return d;
}
var MUIDatePickerController = (function (_super) {
    __extends(MUIDatePickerController, _super);
    function MUIDatePickerController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.delegate = null;
        _this.calendarView = null;
        return _this;
    }
    MUIDatePickerController.prototype.viewDidLoad = function () {
        this.view.setBackgroundRGBColor(255, 255, 255);
        this.calendarView = new MUICalendarView();
        this.calendarView.init();
        this.calendarView.dataSource = this;
        this.calendarView.delegate = this;
        this.calendarView.horizontalCellSpacing = 1;
        this.calendarView.verticalCellSpacing = 1;
        this.view.addSubview(this.calendarView);
        this.calendarView.reloadData();
    };
    MUIDatePickerController.prototype.viewTitleForHeaderAtMonthForCalendar = function (calendar, currentMonth) {
        var title = MIODateGetStringForMonth(currentMonth);
        var header = new MUILabel();
        header.init();
        header.setText(title);
        header.setTextAlignment("center");
        header.setHeight(30);
        header.setTextRGBColor(101, 100, 106);
        header.setBackgroundRGBColor(255, 255, 255);
        header.setFontSize(20);
        header.setFontStyle("bold");
        header.setFontFamily("SourceSansPro-Semibold, Source Sans Pro, sans-serif");
        return header;
    };
    MUIDatePickerController.prototype.dayCellAtDate = function (calendar, date) {
        var cell = calendar.dequeueReusableDayCellWithIdentifier(null);
        return cell;
    };
    MUIDatePickerController.prototype.didSelectDayCellAtDate = function (calendarView, date) {
        if (this.delegate != null && typeof this.delegate.didSelectDate === "function")
            this.delegate.didSelectDate(this, date);
        this.dismissViewController(true);
    };
    Object.defineProperty(MUIDatePickerController.prototype, "preferredContentSize", {
        get: function () {
            return new MIOSize(320, 320);
        },
        enumerable: true,
        configurable: true
    });
    return MUIDatePickerController;
}(MUIViewController));
var MUIChartViewType;
(function (MUIChartViewType) {
    MUIChartViewType[MUIChartViewType["Bar"] = 0] = "Bar";
    MUIChartViewType[MUIChartViewType["HorizontalBar"] = 1] = "HorizontalBar";
    MUIChartViewType[MUIChartViewType["Line"] = 2] = "Line";
    MUIChartViewType[MUIChartViewType["Pie"] = 3] = "Pie";
})(MUIChartViewType || (MUIChartViewType = {}));
var MUIChartView = (function (_super) {
    __extends(MUIChartView, _super);
    function MUIChartView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.title = "";
        _this.backgroundChartColors = [
            'rgba(0, 191, 191, 0.6)',
            'rgba(255, 211, 88, 0.6)',
            'rgba(75, 204, 255, 0.6)',
            'rgba(255, 86, 113, 0.6)',
        ];
        _this.borderChartColors = [
            'rgba(0, 191, 191, 0.6)',
            'rgba(255, 211, 88, 0.6)',
            'rgba(75, 204, 255, 0.6)',
            'rgba(255, 86, 113, 0.6)',
        ];
        _this.labels = null;
        _this.values = null;
        _this.canvas = null;
        _this.chartLayer = null;
        return _this;
    }
    MUIChartView.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
    };
    MUIChartView.prototype.createCanvas = function () {
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.layer.appendChild(this.canvas);
    };
    MUIChartView.prototype.destroyCanvas = function () {
        this.layer.removeChild(this.canvas);
        this.canvas = null;
    };
    MUIChartView.prototype.renderWithType = function (type) {
        var typeName = this.nameFromChartType(type);
        var bgColors = this.backgroundChartColors;
        var fgColors = this.borderChartColors;
        var values = this.values;
        var labels = this.labels;
        var opts = this.optionsForChartType(type, this.title);
        var data = {
            labels: labels,
            datasets: [{
                    data: values,
                    backgroundColor: bgColors,
                    borderColor: fgColors,
                    borderWidth: 1
                }]
        };
        this.clear();
        this.createCanvas();
        this.chartLayer = new Chart(this.canvas, {
            type: typeName,
            data: data,
            options: opts
        });
    };
    MUIChartView.prototype.clear = function () {
        if (this.chartLayer != null) {
            this.chartLayer.destroy();
            this.destroyCanvas();
        }
    };
    MUIChartView.prototype.nameFromChartType = function (type) {
        var name = null;
        switch (type) {
            case MUIChartViewType.Bar:
                name = "bar";
                break;
            case MUIChartViewType.HorizontalBar:
                name = "horizontalBar";
                break;
            case MUIChartViewType.Line:
                name = "line";
                break;
            case MUIChartViewType.Pie:
                name = "pie";
                break;
        }
        return name;
    };
    MUIChartView.prototype.optionsForChartType = function (type, title) {
        var op = {};
        if (title != null) {
            op["title"] = { "display": true, "text": title };
        }
        switch (type) {
            case MUIChartViewType.Pie:
                op["legend"] = { "display": true, "position": "right" };
                break;
            default:
                op["legend"] = { "display": false };
                break;
        }
        return op;
    };
    return MUIChartView;
}(MUIView));
var MUIReportViewController = (function (_super) {
    __extends(MUIReportViewController, _super);
    function MUIReportViewController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._tableView = null;
        return _this;
    }
    return MUIReportViewController;
}(MUIViewController));
var MUIReportTableViewCellType;
(function (MUIReportTableViewCellType) {
    MUIReportTableViewCellType[MUIReportTableViewCellType["Custom"] = 0] = "Custom";
    MUIReportTableViewCellType[MUIReportTableViewCellType["Label"] = 1] = "Label";
    MUIReportTableViewCellType[MUIReportTableViewCellType["Combox"] = 2] = "Combox";
})(MUIReportTableViewCellType || (MUIReportTableViewCellType = {}));
var MUIReportTableViewCell = (function (_super) {
    __extends(MUIReportTableViewCell, _super);
    function MUIReportTableViewCell() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = MUIReportTableViewCellType.Custom;
        _this.label = null;
        _this._target = null;
        _this._onClickFn = null;
        _this.parentRow = null;
        return _this;
    }
    MUIReportTableViewCell.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        this.layer.style.background = "";
        this.layer.classList.add("tableviewcell_deselected_color");
        if (this.type == MUIReportTableViewCellType.Label) {
            var labelLayer = MUILayerGetFirstElementWithTag(layer, "LABEL");
            if (labelLayer != null) {
                this.label = new MUILabel();
                this.label.initWithLayer(labelLayer, this);
                this.addSubview(this.label);
            }
        }
        var instance = this;
        this.layer.onclick = function () {
            if (instance._onClickFn != null)
                instance._onClickFn.call(instance._target, instance);
        };
    };
    return MUIReportTableViewCell;
}(MUIView));
var MUIReportTableViewRow = (function (_super) {
    __extends(MUIReportTableViewRow, _super);
    function MUIReportTableViewRow() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cells = [];
        return _this;
    }
    MUIReportTableViewRow.prototype.removeFromSuperview = function () {
        for (var index = 0; index < this.cells.length; index++) {
            var cell = this.cells[index];
            cell.removeFromSuperview();
        }
        this.cells = [];
    };
    return MUIReportTableViewRow;
}(MUIView));
var MUIReportTableViewColumn = (function (_super) {
    __extends(MUIReportTableViewColumn, _super);
    function MUIReportTableViewColumn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.identifier = null;
        _this.title = null;
        _this.width = 0;
        _this.minWidth = 0;
        _this.serverName = null;
        _this.pixelWidth = 0;
        _this.alignment = "center";
        _this.formatter = null;
        _this.ascending = true;
        _this._colHeader = null;
        _this._target = null;
        _this._onHeaderClickFn = null;
        return _this;
    }
    MUIReportTableViewColumn.labelColumnWithTitle = function (title, width, minWidth, alignment, key, formatter, identifer) {
        var col = new MUIReportTableViewColumn();
        col.title = title;
        col.identifier = identifer;
        col.width = width;
        col.minWidth = minWidth;
        col.serverName = key;
        col.alignment = alignment;
        col.formatter = formatter;
        return col;
    };
    MUIReportTableViewColumn.prototype.columnHeaderView = function () {
        if (this._colHeader != null)
            return this._colHeader;
        var header = new MUIView();
        header.init();
        header.setHeight(23);
        header.layer.style.background = "";
        header.layer.classList.add("tableview_header");
        var titleLabel = new MUILabel();
        titleLabel.init();
        titleLabel.layer.style.background = "";
        titleLabel.layer.classList.add("tableview_header_title");
        titleLabel.text = this.title;
        titleLabel.setTextAlignment(this.alignment);
        header.addSubview(titleLabel);
        this._colHeader = header;
        var instance = this;
        this._colHeader.layer.onclick = function () {
            if (instance._onHeaderClickFn != null)
                instance._onHeaderClickFn.call(instance._target, instance);
        };
        return this._colHeader;
    };
    return MUIReportTableViewColumn;
}(MIOObject));
var MUIReportTableView = (function (_super) {
    __extends(MUIReportTableView, _super);
    function MUIReportTableView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataSource = null;
        _this.delegate = null;
        _this.cellPrototypes = {};
        _this.cells = [];
        _this.rows = [];
        _this.columns = [];
        _this.rowByCell = {};
        _this.selectedIndexPath = null;
        return _this;
    }
    MUIReportTableView.prototype.initWithLayer = function (layer, owner, options) {
        _super.prototype.initWithLayer.call(this, layer, owner, options);
        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var subLayer = this.layer.childNodes[index];
                if (subLayer.tagName != "DIV")
                    continue;
                if (subLayer.getAttribute("data-cell-identifier") != null) {
                    this._addCellPrototypeWithLayer(subLayer);
                    subLayer.style.display = "none";
                }
            }
        }
    };
    MUIReportTableView.prototype._addCellPrototypeWithLayer = function (subLayer) {
        var cellIdentifier = subLayer.getAttribute("data-cell-identifier");
        var cellClassname = subLayer.getAttribute("data-class");
        var type = subLayer.getAttribute("data-report-cell-type");
        if (cellClassname == null)
            cellClassname = "MUIReportTableViewCell";
        if (type == null)
            type = MUIReportTableViewCellType.Custom;
        else if (type.toLocaleLowerCase() == "label")
            type = MUIReportTableViewCellType.Label;
        else if (type.toLocaleLowerCase() == "combobox")
            type = MUIReportTableViewCellType.Combox;
        var item = {};
        item["class"] = cellClassname;
        item["layer"] = subLayer;
        item["type"] = type;
        var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        if (size != null)
            item["size"] = size;
        this.cellPrototypes[cellIdentifier] = item;
    };
    MUIReportTableView.prototype.addColumn = function (column) {
        this.columns.push(column);
    };
    MUIReportTableView.prototype.removeAllColumns = function () {
        for (var index = 0; index < this.columns.length; index++) {
            var col = this.columns[index];
            var header = col.columnHeaderView();
            header.removeFromSuperview();
        }
        this.columns = [];
    };
    MUIReportTableView.prototype.dequeueReusableCellWithIdentifier = function (identifier) {
        var item = this.cellPrototypes[identifier];
        var className = item["class"];
        var cell = Object.create(window[className].prototype);
        cell.constructor.apply(cell);
        var layer = item["layer"];
        if (layer != null) {
            var newLayer = layer.cloneNode(true);
            newLayer.style.display = "";
            var size = item["size"];
            cell.type = item["type"];
            cell.initWithLayer(newLayer);
            cell.awakeFromHTML();
        }
        else {
            var cells = item["cells"];
            if (cells == null) {
                cells = [];
                item["cells"] = cells;
            }
            cells.push(cell);
        }
        return cell;
    };
    MUIReportTableView.prototype.reloadData = function () {
        for (var index = 0; index < this.rows.length; index++) {
            var row = this.rows[index];
            row.removeFromSuperview();
        }
        this.rowByCell = {};
        this.rows = [];
        this.cells = [];
        this.selectedIndexPath = null;
        for (var index = 0; index < this.columns.length; index++) {
            var col = this.columns[index];
            var header = col.columnHeaderView();
            col._target = this;
            col._onHeaderClickFn = this.onHeaderClickFn;
            this.addSubview(header);
        }
        var rows = this.dataSource.numberOfRows(this);
        for (var rowIndex = 0; rowIndex < rows; rowIndex++) {
            var row = new MUIReportTableViewRow();
            row.init();
            for (var colIndex = 0; colIndex < this.columns.length; colIndex++) {
                var col = this.columns[colIndex];
                var indexPath = MIOIndexPath.indexForColumnInRowAndSection(colIndex, rowIndex, 0);
                var cell = this.dataSource.cellAtIndexPath(this, col, indexPath);
                cell._target = this;
                cell._onClickFn = this.cellOnClickFn;
                this.addSubview(cell);
                cell.parentRow = row;
                row.cells.push(cell);
            }
            this.rows.push(row);
        }
        this.setNeedsDisplay();
    };
    MUIReportTableView.prototype.layoutSubviews = function () {
        if (this._viewIsVisible == false)
            return;
        if (this.hidden == true)
            return;
        var x = 0;
        var y = 0;
        var w = this.getWidth();
        for (var colIndex = 0; colIndex < this.columns.length; colIndex++) {
            var col = this.columns[colIndex];
            var header = col.columnHeaderView();
            header.setX(x);
            col.pixelWidth = (col.width * this.getWidth()) / 100;
            if (col.minWidth > 0 && col.pixelWidth < col.minWidth)
                col.pixelWidth = col.minWidth;
            header.setWidth(col.pixelWidth);
            x += col.pixelWidth;
        }
        y += 23;
        x = 0;
        var offsetY = 0;
        for (var rowIndex = 0; rowIndex < this.rows.length; rowIndex++) {
            var row = this.rows[rowIndex];
            for (var colIndex = 0; colIndex < this.columns.length; colIndex++) {
                var col = this.columns[colIndex];
                var cell = row.cells[colIndex];
                cell.setX(x);
                cell.setY(y);
                cell.setWidth(col.pixelWidth);
                x += col.pixelWidth;
                var h = cell.getHeight();
                if (offsetY < h)
                    offsetY = h;
            }
            x = 0;
            y += offsetY;
            if (offsetY == 0)
                y += 40;
        }
    };
    MUIReportTableView.prototype.onHeaderClickFn = function (col) {
        if (this.delegate != null) {
            if (typeof this.delegate.sortDescriptorsDidChange === "function")
                this.delegate.sortDescriptorsDidChange(this, col);
        }
    };
    MUIReportTableView.prototype.cellOnClickFn = function (cell) {
        var row = cell.parentRow;
        var colIndex = row.cells.indexOf(cell);
        var rowIndex = this.rows.indexOf(row);
        var ip = MIOIndexPath.indexForColumnInRowAndSection(colIndex, rowIndex, 0);
        if (this.delegate != null) {
            if (typeof this.delegate.didSelectCellAtIndexPath === "function")
                this.delegate.didSelectCellAtIndexPath(this, ip);
        }
    };
    return MUIReportTableView;
}(MUIView));
var MUIActivityIndicator = (function (_super) {
    __extends(MUIActivityIndicator, _super);
    function MUIActivityIndicator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MUIActivityIndicator;
}(MUIView));
//# sourceMappingURL=index.js.map