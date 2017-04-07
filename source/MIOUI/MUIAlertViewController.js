/// <reference path="MUIViewController.ts" />
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
var MUIAlertViewStyle;
(function (MUIAlertViewStyle) {
    MUIAlertViewStyle[MUIAlertViewStyle["Default"] = 0] = "Default";
})(MUIAlertViewStyle || (MUIAlertViewStyle = {}));
var MUIAlertActionStyle;
(function (MUIAlertActionStyle) {
    MUIAlertActionStyle[MUIAlertActionStyle["Default"] = 0] = "Default";
})(MUIAlertActionStyle || (MUIAlertActionStyle = {}));
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
        _super.prototype.init.call(this);
        this.title = title;
        this.style = style;
    };
    return MUIAlertAction;
}(MIOObject));
var MUIAlertViewController = (function (_super) {
    __extends(MUIAlertViewController, _super);
    function MUIAlertViewController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._actions = [];
        _this._title = null;
        _this._message = null;
        _this._style = MUIAlertViewStyle.Default;
        _this._backgroundView = null;
        _this._tableView = null;
        _this._headerCell = null;
        _this._alertViewSize = new MIOSize(320, 50);
        // Transitioning delegate
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
    MUIAlertViewController.prototype.viewWillAppear = function () {
        _super.prototype.viewWillAppear.call(this);
        this._tableView.reloadData();
    };
    Object.defineProperty(MUIAlertViewController.prototype, "preferredContentSize", {
        get: function () {
            return this._alertViewSize;
        },
        enumerable: true,
        configurable: true
    });
    MUIAlertViewController.prototype.addAction = function (action) {
        this._actions.push(action);
        this._calculateContentSize();
    };
    MUIAlertViewController.prototype._calculateContentSize = function () {
        var h = 80 + (this._actions.length * 50) + 1;
        this._alertViewSize = new MIOSize(320, h);
    };
    MUIAlertViewController.prototype.numberOfSections = function (tableview) {
        return 1;
    };
    MUIAlertViewController.prototype.numberOfRowsInSection = function (tableview, section) {
        return this._actions.length + 1;
    };
    MUIAlertViewController.prototype.cellAtIndexPath = function (tableview, row, section) {
        var cell = null;
        if (row == 0) {
            cell = this._createHeaderCell();
        }
        else {
            var action = this._actions[row - 1];
            if (action.style == MUIAlertActionStyle.Default)
                cell = this._createDefaultCellWithTitle(action.title);
        }
        cell.separatorStyle = MUITableViewCellSeparatorStyle.None;
        return cell;
    };
    MUIAlertViewController.prototype.heightForRowAtIndexPath = function (taleview, row, section) {
        if (row == 0)
            return 80;
        else
            return 50;
    };
    MUIAlertViewController.prototype.canSelectCellAtIndexPath = function (tableview, row, section) {
        if (row == 0)
            return false;
        return true;
    };
    MUIAlertViewController.prototype.didSelectCellAtIndexPath = function (tableView, row, section) {
        var action = this._actions[row - 1];
        action.completion.call(action.target);
        this.dismissViewController(true);
    };
    // Private methods
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
    MUIAlertViewController.prototype._createDefaultCellWithTitle = function (title) {
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
        buttonLabel.layer.classList.add("alertview_cell_default_title");
        cell.addSubview(buttonLabel);
        cell.layer.style.background = "transparent";
        cell.layer.classList.add("alertview_cell_default");
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
        // make view configurations before transitions       
    };
    MUIAlertFadeInAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations after transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
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
        // make view configurations before transitions       
    };
    MUIAlertFadeOutAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations after transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MUIAlertFadeOutAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.FadeOut);
        return animations;
    };
    return MUIAlertFadeOutAnimationController;
}(MIOObject));
