
/// <reference path="MUIViewController.ts" />

enum MUIAlertViewStyle
{
    Default
}

enum MUIAlertActionStyle
{
    Default,
    Cancel,
    Destructive
}

enum MUIAlertItemType {

    None,
    Action,
    TextField,
    ComboBox
}

class MUIAlertItem extends MIOObject
{
    type = MUIAlertItemType.None;

    initWithType(type:MUIAlertItemType) {

        this.type = type;
    }
}

class MUIAlertTextField extends MUIAlertItem
{
    textField:MUITextField = null;

    initWithConfigurationHandler(target, handler) {

        super.initWithType(MUIAlertItemType.TextField);

        this.textField = new MUITextField();
        this.textField.init();

        if (target != null && handler != null) {

            handler.call(target, this.textField);
        }
    }
}

class MUIAlertComboBox extends MUIAlertItem
{
    comboBox:MUIComboBox = null;

    initWithConfigurationHandler(target, handler) {

        super.initWithType(MUIAlertItemType.TextField);

        this.comboBox = new MUIComboBox();
        this.comboBox.init();

        if (target != null && handler != null) {

            handler.call(target, this.comboBox);
        }
    }
}

class MUIAlertAction extends MUIAlertItem
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
        super.initWithType(MUIAlertItemType.Action);

        this.title = title;
        this.style = style;
    }
}

class MUIAlertViewController extends MUIViewController
{
    textFields = [];
    comboBoxes = [];

    private _items = [];        

    private _title:string = null;
    private _message:string = null;
    private _style = MUIAlertViewStyle.Default;

    private _backgroundView:MUIView = null;
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
    }

    viewWillAppear(animated?)
    {
        super.viewWillAppear(animated);
        
        this._tableView.reloadData();
    }

     get preferredContentSize()
    {
        return this._alertViewSize;
    }

    private _addItem(item:MUIAlertItem)
    {
        this._items.push(item);
        this._calculateContentSize();
    }

    addAction(action:MUIAlertAction)
    {
        this._addItem(action);
    }

    addTextFieldWithConfigurationHandler(target, handler)
    {
        var ai = new MUIAlertTextField();
        ai.initWithConfigurationHandler(target, handler);
        this.textFields.push(ai.textField);
        this._addItem(ai);
    }

    addComboBoxWithConfigurationHandler(target, handler)
    {
        var ac = new MUIAlertComboBox();
        ac.initWithConfigurationHandler(target, handler);
        this.comboBoxes.push(ac.comboBox);
        this._addItem(ac);
    }    

    private _calculateContentSize()
    {
        var h = 80 + (this._items.length * 50) + 1;
        this._alertViewSize = new MIOSize(320, h);
    }

    numberOfSections(tableview)
    {
        return 1;
    }

    numberOfRowsInSection(tableview, section)
    {
        return this._items.length + 1;
    }

    cellAtIndexPath(tableview, row, section)
    {
        var cell:MUITableViewCell = null;
        if (row == 0)
        {
            cell = this._createHeaderCell();
        }
        else
        {
            var item = this._items[row - 1];
            if (item.type == MUIAlertItemType.Action) {
                cell = this._createActionCellWithTitle(item.title, item.style);
            }
            else if (item.type == MUIAlertItemType.TextField) {
                cell = this._createTextFieldCell(item.textField);
            }
            else if (item.type == MUIAlertItemType.ComboBox) {
                cell = this._createTextFieldCell(item.comboBox);
            }
        }

        cell.separatorStyle = MUITableViewCellSeparatorStyle.None;
        return cell;
    }

    heightForRowAtIndexPath(taleview, row, section)
    {
        if (row == 0) return 80;
        else return 50;
    }

    canSelectCellAtIndexPath(tableview, row, section)
    {
        if (row == 0) return false;

        var item = this._items[row - 1];
        if (item.type == MUIAlertItemType.Action) return true;

        return false;
    }

    didSelectCellAtIndexPath(tableView, row, section)
    {
        var item = this._items[row - 1];
        if (item.type == MUIAlertItemType.Action) {
            
            if (item.target != null && item.completion != null)
                item.completion.call(item.target);
            
            this.dismissViewController(true);
        }
    }

    // Private methods

    private _createHeaderCell():MUITableViewCell
    {
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
    }

    private _createActionCellWithTitle(title:string, style:MUIAlertActionStyle):MUITableViewCell
    {
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

        switch(style){

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
    }

    private _createTextFieldCell(textField:MUITextField):MUITableViewCell
    {
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
    }

    private _createComboBoxCell(comboBox:MUIComboBox):MUITableViewCell
    {
        var cell = new MUITableViewCell();
        cell.initWithStyle(MUITableViewCellStyle.Custom);        

        comboBox.layer.style.left = "";
        comboBox.layer.style.top = "";
        comboBox.layer.style.right = "";
        comboBox.layer.style.height = "";
        comboBox.layer.style.width = "";
        comboBox.layer.style.background = "";
        comboBox.layer.classList.add("alertview_cell_combobox");

        cell.addSubview(comboBox);

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