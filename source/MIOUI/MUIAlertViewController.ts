import { MIOObject, MIOSize, MIOIndexPath } from "../MIOFoundation";
import { MUITextField } from "./MUITextField";
import { MUIComboBox } from "./MUIComboBox";
import { MUIViewController } from "./MUIViewController";
import { MUIView } from "./MUIView";
import { MUITableView } from "./MUITableView";
import { MUIModalPresentationStyle } from "./MUIViewController_PresentationController";
import { MIOCoreGetBrowser, MIOCoreBrowserType } from "../MIOCore/platform/Web";
import { MUITableViewCell, MUITableViewCellSeparatorStyle, MUITableViewCellStyle } from "./MUITableViewCell";
import { MUILabel } from "./MUILabel";
import { MUIAnimationType, MUIClassListForAnimationType } from "./MIOUI_CoreAnimation";
import { MUICoreLayerRemoveStyle, MUIWebApplication } from ".";
import { MUICoreLayerAddStyle } from "./MIOUI_CoreLayer";

export enum MUIAlertViewStyle
{
    Default
}

export enum MUIAlertActionStyle
{
    Default,
    Cancel,
    Destructive
}

export enum MUIAlertItemType {

    None,
    Action,
    TextField,
    ComboBox
}

export class MUIAlertItem extends MIOObject
{
    type = MUIAlertItemType.None;

    initWithType(type:MUIAlertItemType) {

        this.type = type;
    }
}

export class MUIAlertTextField extends MUIAlertItem
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

export class MUIAlertComboBox extends MUIAlertItem
{
    comboBox:MUIComboBox = null;

    initWithConfigurationHandler(target, handler) {

        super.initWithType(MUIAlertItemType.ComboBox);

        this.comboBox = new MUIComboBox();
        this.comboBox.init();

        if (target != null && handler != null) {

            handler.call(target, this.comboBox);
        }
    }
}

export class MUIAlertAction extends MUIAlertItem
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

export class MUIAlertViewController extends MUIViewController
{
    textFields = [];
    comboBoxes = [];
    
    private target = null;
    private completion = null; 

    private _items = [];        

    private _title:string = null;
    private _message:string = null;
    private _style = MUIAlertViewStyle.Default;

    private _backgroundView:MUIView = null;
    private tableView:MUITableView = null;

    private _headerCell = null;

    private _alertViewSize = new MIOSize(320, 50);

    // The header row holds the title and the message. Its height is the height of that
    // content, measured with the alert's own styles at the alert's width (a message may run
    // to several lines), never below the classic 80 px; the rows below and the sheet size
    // follow it.
    private _headerHeight = 80;
    private _headerMeasuredFor:string = null;

    initWithTitle(title:string, message:string, style:MUIAlertViewStyle){
        super.init();

        this.modalPresentationStyle = MUIModalPresentationStyle.FormSheet;

        this._title = title;
        this._message = message;
        this._style = style;

        this.transitioningDelegate = this;
    }

    viewDidLoad(){
        super.viewDidLoad();
        //MUICoreLayerRemoveStyle(this.view.layer, "page");
        this.view.layer.style.background = "";
        this.view.layer.style.backgroundColor = "";
        //this.view.layer.classList.add("alert-container");

        this._backgroundView = new MUIView();
        this._backgroundView.init();
        MUICoreLayerAddStyle(this._backgroundView.layer, "alert-container");
        this.view.addSubview(this._backgroundView);

        this.tableView = new MUITableView();
        this.tableView.init();
        this.tableView.dataSource = this;
        this.tableView.delegate = this;
        this.tableView.layer.style.background = "";
        this.tableView.layer.style.position = "";
        this.tableView.layer.style.width = "";
        this.tableView.layer.style.height = "";
        MUICoreLayerAddStyle(this.tableView.layer, "alert-table");

        this._backgroundView.addSubview(this.tableView);
    }

    viewDidAppear(animated?) {
        super.viewDidAppear(animated);        
        this.tableView.reloadData();
        if (this.textFields.length > 0) {
            let tf = this.textFields[0] as MUITextField;
            tf.becomeFirstResponder();
        }
    }

    viewWillDisappear(animated?){
        super.viewWillDisappear(animated);
        
        if (this.target != null && this.completion != null){
            this.completion.call(this.target);
        }
    }

    get preferredContentSize(){
        return this._alertViewSize;
    }

    private _addItem(item:MUIAlertItem){
        this._items.push(item);
        this._measureHeaderHeight();
        this._calculateContentSize();
    }

    addAction(action:MUIAlertAction){
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

    addCompletionHandler(target, handler){

        this.target = target;
        this.completion = handler;
    }

    private _calculateContentSize(notify:boolean = false){
        let h = this._headerHeight + (this._items.length * 50) + 1;
        let size = new MIOSize(320, h);

        let ad = MUIWebApplication.sharedInstance().delegate;
        let w = ad.valueForKey("window") as MUIView;
        let wh = w.getHeight();
        if (wh < h) size = new MIOSize(320, wh);

        // once presented, the presentation controller follows preferredContentSize
        if (notify) this.willChangeValue("preferredContentSize");
        this._alertViewSize = size;
        if (notify) this.didChangeValue("preferredContentSize");
    }

    numberOfSections(tableview){
        return 1;
    }

    numberOfRowsInSection(tableview, section)
    {
        return this._items.length + 1;
    }

    cellAtIndexPath(tableview, indexPath:MIOIndexPath){
        let cell:MUITableViewCell = null;
        if (indexPath.row == 0){
            cell = this._createHeaderCell();
        }
        else{
            let item = this._items[indexPath.row - 1];
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
    }

    heightForRowAtIndexPath(tableView:MUITableView, indexPath:MIOIndexPath) {
        let h = 50;
        if (indexPath.row == 0) h = this._headerRowHeight();
        
        return h;
    }

    // The header row's height: the natural height of the header cell once it sits in the
    // alert (the alert's own styles apply there), else the estimate from a copy laid out off
    // screen. When the real height differs from the estimate the sheet follows.
    private _headerRowHeight():number {
        let cell = this._headerCell;
        if (cell != null && typeof document !== "undefined" && document.body.contains(cell.layer)) {
            let h = this._naturalHeight(cell.layer);
            if (h > 0 && h != this._headerHeight) {
                this._headerHeight = h;
                this._headerMeasuredFor = this._headerKey();
                this._calculateContentSize(true);
            }
            return this._headerHeight;
        }
        return this._measureHeaderHeight();
    }

    private _headerKey():string {
        return (this._title ?? "") + "\u0000" + (this._message ?? "") + "\u0000" + this._alertViewSize.width;
    }

    /// The height the layer takes with its content, never below the classic 80 px; 0 when it
    /// cannot be measured.
    private _naturalHeight(layer:HTMLElement):number {
        let saved = layer.style.height;
        layer.style.height = "";
        let h = layer.offsetHeight;
        layer.style.height = saved;
        return h > 0 ? Math.max(80, Math.ceil(h)) : 0;
    }

    private _measureHeaderHeight():number {
        let key = this._headerKey();
        if (this._headerMeasuredFor == key) return this._headerHeight;

        let h = 80;
        if (typeof document !== "undefined" && document.body != null) {
            // The header cell as the alert renders it, inside the alert's own containers (page,
            // alert-container, alert-table) so the same styles apply, laid out off screen at the
            // alert's width and left to its natural height.
            let page = document.createElement("div");
            MUICoreLayerAddStyle(page, "page");
            page.style.position = "absolute";
            page.style.left = "-100000px";
            page.style.top = "0px";
            page.style.width = this._alertViewSize.width + "px";
            page.style.height = "auto";
            page.style.display = "block";
            page.style.overflow = "visible";
            page.style.visibility = "hidden";
            page.style.pointerEvents = "none";

            let container = document.createElement("div");
            MUICoreLayerAddStyle(container, "alert-container");
            container.style.position = "relative";
            container.style.display = "block";
            container.style.width = "100%";
            container.style.height = "auto";
            page.appendChild(container);

            let table = document.createElement("div");
            MUICoreLayerAddStyle(table, "alert-table");
            table.style.position = "relative";
            table.style.display = "block";
            table.style.width = "100%";
            table.style.height = "auto";
            table.style.minHeight = "0";
            table.style.overflow = "visible";
            container.appendChild(table);

            let headerCell = this._headerCell;
            let cell = this._createHeaderCell();
            this._headerCell = headerCell;
            table.appendChild(cell.layer);

            document.body.appendChild(page);
            let measured = this._naturalHeight(cell.layer);
            document.body.removeChild(page);
            if (measured > h) h = measured;
        }

        this._headerHeight = h;
        this._headerMeasuredFor = key;
        return h;
    }

    canSelectCellAtIndexPath(tableview, indexPath:MIOIndexPath)
    {
        if (indexPath.row == 0) return false;

        let item = this._items[indexPath.row - 1];
        if (item.type == MUIAlertItemType.Action) return true;

        return false;
    }

    didSelectCellAtIndexPath(tableView, indexPath:MIOIndexPath)
    {
        let item = this._items[indexPath.row - 1];
        if (item.type == MUIAlertItemType.Action) {
            
            if (item.target != null && item.completion != null)
                item.completion.call(item.target);
            
            this.dismissViewController(true);
        }
    }

    // Private methods

    private _createHeaderCell():MUITableViewCell{
        let cell = new MUITableViewCell();
        cell.initWithStyle(MUITableViewCellStyle.Custom);
        MUICoreLayerAddStyle(cell.layer, "alert-header");

        let titleLabel = new MUILabel();
        titleLabel.init();
        titleLabel.text = this._title;
        titleLabel.layer.style.left = "";
        titleLabel.layer.style.top = "";
        titleLabel.layer.style.right = "";
        titleLabel.layer.style.height = "";
        titleLabel.layer.style.width = ""; 
        titleLabel.layer.style.background = "";
        MUICoreLayerAddStyle(titleLabel.layer, "large");
        MUICoreLayerAddStyle(titleLabel.layer, "strong");        
        cell.addSubview(titleLabel);

        let messageLabel = new MUILabel();
        messageLabel.init();
        messageLabel.text = this._message;
        messageLabel.layer.style.left = "";
        messageLabel.layer.style.top = "";
        messageLabel.layer.style.right = "";
        messageLabel.layer.style.height = "";
        messageLabel.layer.style.width = "";
        messageLabel.layer.style.background = "";
        MUICoreLayerAddStyle(messageLabel.layer, "light");        
        cell.addSubview(messageLabel);          
        
        //cell.layer.style.background = "transparent";

        this._headerCell = cell;
        return cell;
    }

    private _createActionCellWithTitle(title:string, style:MUIAlertActionStyle):MUITableViewCell{
        let cell = new MUITableViewCell();
        cell.initWithStyle(MUITableViewCellStyle.Custom);
        MUICoreLayerAddStyle(cell.layer, "alert-cell");

        let buttonLabel = new MUILabel();
        buttonLabel.init();
        //MUICoreLayerRemoveStyle(buttonLabel.layer, "label");
        buttonLabel.text = title;
        buttonLabel.layer.style.left = "";
        buttonLabel.layer.style.top = "";
        buttonLabel.layer.style.right = "";
        buttonLabel.layer.style.height = "";
        buttonLabel.layer.style.width = "";
        buttonLabel.layer.style.background = "";        
        cell.addSubview(buttonLabel);  

        //cell.layer.style.background = "transparent";
        MUICoreLayerAddStyle(buttonLabel.layer, "btn");                
        //MUICoreLayerAddStyle(buttonLabel.layer, "label");                

        switch(style){

            case MUIAlertActionStyle.Default:                                
                break;

            case MUIAlertActionStyle.Cancel:                
                buttonLabel.layer.classList.add("alert");                
                break;

            case MUIAlertActionStyle.Destructive:                
                buttonLabel.layer.classList.add("alert");                
                break;
        }

        return cell;        
    }

    private _createTextFieldCell(textField:MUITextField):MUITableViewCell{
        var cell = new MUITableViewCell();
        cell.initWithStyle(MUITableViewCellStyle.Custom);    
        MUICoreLayerAddStyle(cell.layer, "alert-cell");    

        textField.layer.style.left = "";
        textField.layer.style.top = "";
        textField.layer.style.right = "";
        textField.layer.style.height = "";
        textField.layer.style.width = "";
        textField.layer.style.background = "";
        MUICoreLayerAddStyle(textField.layer, "input-text");

        cell.addSubview(textField);

        return cell;
    }

    private _createComboBoxCell(comboBox:MUIComboBox):MUITableViewCell{
        let cell = new MUITableViewCell();
        cell.initWithStyle(MUITableViewCellStyle.Custom);   
        MUICoreLayerAddStyle(cell.layer, "alert-cell");         

        // comboBox.layer.style.left = "";
        // comboBox.layer.style.top = "";
        // comboBox.layer.style.right = "";
        // comboBox.layer.style.height = "";
        // comboBox.layer.style.width = "";
        //comboBox.layer.style.background = "";
        MUICoreLayerAddStyle(comboBox.layer, "input-combobox");
        cell.addSubview(comboBox);

        return cell;
    }
    
    // Transitioning delegate
    private _fadeInAnimationController = null;
    private _fadeOutAnimationController = null;

    animationControllerForPresentedController(presentedViewController, presentingViewController, sourceController){
        if (this._fadeInAnimationController == null) {
            this._fadeInAnimationController = new MUIAlertFadeInAnimationController();
            this._fadeInAnimationController.init();
        }

        return this._fadeInAnimationController;
    }

    animationControllerForDismissedController(dismissedController){
        if (this._fadeOutAnimationController == null) {

            this._fadeOutAnimationController = new MUIAlertFadeOutAnimationController();
            this._fadeOutAnimationController.init();
        }

        return this._fadeOutAnimationController;
    }
}

export class MUIAlertFadeInAnimationController extends MIOObject{
    
    transitionDuration(transitionContext){
        return 0.25;
    }

    animateTransition(transitionContext){
        // make view configurations before transitions       
    }

    animationEnded(transitionCompleted){
        // make view configurations after transitions
    }

    // TODO: Not iOS like transitions. For now we use css animations
    animations(transitionContext){
        var animations = MUIClassListForAnimationType(MUIAnimationType.FadeIn);
        return animations;
    }

}

export class MUIAlertFadeOutAnimationController extends MIOObject
{
    transitionDuration(transitionContext){
        return 0.25;
    }

    animateTransition(transitionContext){
        // make view configurations before transitions       
    }

    animationEnded(transitionCompleted){
        // make view configurations after transitions
    }

    // TODO: Not iOS like transitions. For now we use css animations
    animations(transitionContext){
        var animations = MUIClassListForAnimationType(MUIAnimationType.FadeOut);
        return animations;
    }
    
}