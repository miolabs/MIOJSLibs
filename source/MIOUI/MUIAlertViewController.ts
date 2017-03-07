
/// <reference path="MUIViewController.ts" />

enum MUIAlertViewStyle
{
    Default
}

enum MUIAlertActionStyle
{
    Default
}

class MUIAlertAction extends MIOObject
{
    title = null;
    style = MUIAlertActionStyle.Default;

    target = null;
    completion = null;

    static alertActionWithTitle(title:string, style:MUIAlertActionStyle, target, completion):MUIAlertAction
    {
        var action = new MUIAlertAction();
        action.initWithTitle(title, style);
        action.target = target;
        action.completion = completion;

        return action;
    }

    initWithTitle(title, style)
    {
        super.init();

        this.title = title;
        this.style = style;
    }
}

class MUIAlertViewController extends MUIViewController
{
    private _actions = [];

    private _title:string = null;
    private _message:string = null;
    private _style = MUIAlertViewStyle.Default;

    private _tableView:MUITableView = null;

    private _headerCell = null;

    private _alertViewSize = new MIOSize(320, 50);

    initWithTitle(title:string, message:string, style:MUIAlertViewStyle)
    {
        super.init();

        this.modalPresentationStyle = MUIModalPresentationStyle.FormSheet;

        this._title = title;
        this._message = message;
        this._style = style;

        this.transitioningDelegate = this;
    }

    viewDidLoad()
    {
        super.viewDidLoad();

        this._tableView = new MUITableView();
        this._tableView.init();
        this._tableView.dataSource = this;
        this._tableView.delegate = this;

        this.view.addSubview(this._tableView);
    }

    viewWillAppear()
    {
        super.viewWillAppear();
        
        this._tableView.reloadData();
    }

     get preferredContentSize()
    {
        return this._alertViewSize;
    }

    addAction(action:MUIAlertAction)
    {
        this._actions.push(action);
        this._calculateContentSize();
    }

    private _calculateContentSize()
    {
        var h = 50 + (this._actions.length * 30) + 1;
        this._alertViewSize = new MIOSize(320, h);
    }

    numberOfSections(tableview)
    {
        return 1;
    }

    numberOfRowsInSection(tableview, section)
    {
        return this._actions.length + 1;
    }

    cellAtIndexPath(tableview, row, section)
    {
        var cell = null;
        if (row == 0)
        {
            cell = this._createHeaderCell();
        }
        else
        {
            var action:MUIAlertAction = this._actions[row - 1];
            if (action.style == MUIAlertActionStyle.Default)
                cell = this._createDefaultCellWithTitle(action.title);                
        }
        return cell;
    }

    heightForRowAtIndexPath(taleview, row, section)
    {
        if (row == 0) return 50;
        else return 30;
    }

    canSelectCellAtIndexPath(tableview, row, section)
    {
        if (row == 0) return false;

        return true;
    }

    didSelectCellAtIndexPath(tableView, row, section)
    {
        var action:MUIAlertAction = this._actions[row - 1];
        
        action.completion.call(action.target);

        this.dismissViewController(true);
    }

    // Private methods

    private _createHeaderCell():MUITableViewCell
    {
        var cell = new MUITableViewCell();
        cell.initWithStyle(MUITableViewCellStyle.Custom);

        var titleLabel = new MUILabel();
        titleLabel.init();
        titleLabel.text = this._title;
        titleLabel.setTextAlignment("center");
        titleLabel.layer.style.left = "10px";
        titleLabel.layer.style.top = "5px";
        titleLabel.layer.style.right = "10px";
        titleLabel.layer.style.height = "20px";
        titleLabel.layer.style.width = "";
        cell.addSubview(titleLabel);        

        var messageLabel = new MUILabel();
        messageLabel.init();
        messageLabel.text = this._message;
        messageLabel.setTextAlignment("center");
        messageLabel.layer.style.left = "10px";
        messageLabel.layer.style.top = "30px";
        messageLabel.layer.style.right = "10px";
        messageLabel.layer.style.height = "20px";
        messageLabel.layer.style.width = "";
        cell.addSubview(messageLabel);          
        
        return cell;
    }

    private _createDefaultCellWithTitle(title:string):MUITableViewCell
    {
        var cell = new MUITableViewCell();
        cell.initWithStyle(MUITableViewCellStyle.Custom);

        var buttonLabel = new MUILabel();
        buttonLabel.init();
        buttonLabel.text = title;
        buttonLabel.setTextAlignment("center");
        buttonLabel.layer.style.left = "10px";
        buttonLabel.layer.style.top = "5px";
        buttonLabel.layer.style.right = "10px";
        buttonLabel.layer.style.height = "20px";
        buttonLabel.layer.style.width = "";
        cell.addSubview(buttonLabel);  

        cell.layer.style.borderTop = "1px solid rgb(0,0,0)";                   

        return cell;        
    }
    
    // Transitioning delegate
    private _fadeInAnimationController = null;
    private _fadeOutAnimationController = null;

    animationControllerForPresentedController(presentedViewController, presentingViewController, sourceController)
    {
        if (this._fadeInAnimationController == null) {

            this._fadeInAnimationController = new MUIAlertFadeInAnimationController();
            this._fadeInAnimationController.init();
        }

        return this._fadeInAnimationController;
    }

    animationControllerForDismissedController(dismissedController)
    {
        if (this._fadeOutAnimationController == null) {

            this._fadeOutAnimationController = new MUIAlertFadeOutAnimationController();
            this._fadeOutAnimationController.init();
        }

        return this._fadeOutAnimationController;
    }
}

class MUIAlertFadeInAnimationController extends MIOObject
{
    transitionDuration(transitionContext)
    {
        return 0.25;
    }

    animateTransition(transitionContext)
    {
        // make view configurations before transitions       
    }

    animationEnded(transitionCompleted)
    {
        // make view configurations after transitions
    }

    // TODO: Not iOS like transitions. For now we use css animations
    animations(transitionContext)
    {
        var animations = MUIClassListForAnimationType(MUIAnimationType.FadeIn);
        return animations;
    }

}

class MUIAlertFadeOutAnimationController extends MIOObject
{
    transitionDuration(transitionContext)
    {
        return 0.25;
    }

    animateTransition(transitionContext)
    {
        // make view configurations before transitions       
    }

    animationEnded(transitionCompleted)
    {
        // make view configurations after transitions
    }

    // TODO: Not iOS like transitions. For now we use css animations
    animations(transitionContext)
    {
        var animations = MUIClassListForAnimationType(MUIAnimationType.FadeOut);
        return animations;
    }
    
}