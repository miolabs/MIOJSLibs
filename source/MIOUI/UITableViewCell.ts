
import { MUIView } from "./MUIView";
import { MUILabel } from "./MUILabel";
import { MUIButton, MUICoreLayerAddStyle, MUICoreLayerRemoveStyle } from ".";
import { MIOLog } from "../MIOFoundation";

export enum UITableViewCellStyle {

    Custom,
    Default
}

export enum UITableViewCellAccessoryType {

    None,
    DisclosureIndicator,
    DetailDisclosureButton,
    Checkmark
}

export enum UITableViewCellEditingStyle {

    None,
    Delete,
    Insert
}

export enum UITableViewCellSeparatorStyle {

    None,
    SingleLine,
    SingleLineEtched // TODO 
}

export enum UITableViewCellSelectionStyle {

    None,
    Default
}

export class UITableViewCell extends MUIView 
{
    reuseIdentifier: string = null;

    nodeID: string = null;

    contentView: MUIView = null;
    style = UITableViewCellStyle.Custom;

    textLabel = null;
    
    accessoryView:MUIView = null;
    separatorStyle = UITableViewCellSeparatorStyle.SingleLine;

    private _editing = false;
    editingAccessoryView: MUIView = null;

    selectionStyle = UITableViewCellSelectionStyle.Default;
    private _selected = false;

    _target = null;
    _onClickFn = null;
    _onDblClickFn = null;
    _onAccessoryClickFn = null;
    _onEditingAccessoryClickFn = null;

    _section = null;

    initWithStyle(style: UITableViewCellStyle) {

        super.init();
        this.style = style;

        if (style == UITableViewCellStyle.Default) {
            this.textLabel = new MUILabel();
            this.textLabel.init();
            this.textLabel.layer.style.top = "";
            this.textLabel.layer.style.left = "";
            this.textLabel.layer.style.width = "";
            this.textLabel.layer.style.height = "";
            this.textLabel.layer.classList.add("tableviewcell_default_textlabel");
            this.addSubview(this.textLabel);
            this.layer.style.height = "44px";

            MUICoreLayerAddStyle(this.layer, "cell");
        }

        this._setupLayer();
    }

    initWithLayer(layer, owner, options?) {
        super.initWithLayer(layer, owner, options);

        this.scanLayerNodes(layer, owner);

        this._setupLayer();
    }

    private scanLayerNodes(layer, owner) {

        if (layer.childNodes.length == 0) return;

        if (layer.childNodes.length > 0) {
            for (var index = 0; index < layer.childNodes.length; index++) {
                var subLayer = layer.childNodes[index];

                if (subLayer.tagName != "DIV")
                    continue;

                this.scanLayerNodes(subLayer, owner);

                if (subLayer.getAttribute("data-accessory-type") != null) {
                    this.addAccessoryView(subLayer, owner);
                }

                if (subLayer.getAttribute("data-editing-accessory-view") != null) {
                    this.addEditingAccessoryView(subLayer, owner);
                }
            }
        }

    }

    //data-accessory-type="checkmark"

    private addAccessoryView(layer, owner) {

        let type = layer.getAttribute("data-accessory-type");

        this.accessoryView = new MUIView();
        this.accessoryView.initWithLayer(layer, owner);

        if (type == "checkmark") this.accessoryType = UITableViewCellAccessoryType.Checkmark;
        else if (type == "disclosure") this.accessoryType = UITableViewCellAccessoryType.DisclosureIndicator;
        else this.accessoryType = UITableViewCellAccessoryType.None;

        if (this.accessoryType != UITableViewCellAccessoryType.None) return;
        
        // this.accessoryView.layer.addEventListener("click", this.accessoryViewDidClick.bind(this));
    }

    private accessoryViewDidClick(e:Event){
        e.stopPropagation();        
        this._onAccessoryClickFn.call(this._target, this);
    }

    private editingAccessoryInsertView:MUIView = null;
    editingAccessoryDeleteView:MUIView = null; //TODO: Make this public!! Rigth I didn't figure out how without breaking the uitableviewcell gesture click
    private addEditingAccessoryView(layer, owner) {

        let type = layer.getAttribute("data-editing-accessory-view");
        if (type == "insert") {
            this.editingAccessoryInsertView = new MUIView();
            this.editingAccessoryInsertView.initWithLayer(layer, owner);

            this.editingAccessoryInsertView.layer.addEventListener("click", this.editingAccessoryViewDidClick.bind(this));
        }
        else if (type == "delete") {
            this.editingAccessoryDeleteView = new MUIView();
            this.editingAccessoryDeleteView.initWithLayer(layer, owner);

            this.editingAccessoryDeleteView.layer.addEventListener("click", this.editingAccessoryViewDidClick.bind(this));
        }
        else {
            this.editingAccessoryView = new MUIView();
            this.editingAccessoryView.initWithLayer(layer, owner);    

            this.editingAccessoryView.layer.addEventListener("click", this.editingAccessoryViewDidClick.bind(this));
        }

        // // TODO: Change for a gesuture recongnizer or something independent of the html
        // let instance = this;
        // this.editingAccessoryView.layer.onclick = function (e) {
        //     if (instance._onAccessoryClickFn != null) {
        //         e.stopPropagation();
        //         instance._onAccessoryClickFn.call(instance._target, instance);
        //     }
        // };
    }

    private _editingAccessoryType = UITableViewCellEditingStyle.None;

    get editingAccessoryType(){ return this._editingAccessoryType;}
    set editingAccessoryType(value:UITableViewCellEditingStyle){
        this.setEditingAccessoryType(value);
    }

    setEditingAccessoryType(value:UITableViewCellEditingStyle){
        this._editingAccessoryType = value;

        // Reset
        if (this.editingAccessoryDeleteView != null) this.setEditingAccessoryViewHidden(this.editingAccessoryDeleteView, true);
        if (this.editingAccessoryInsertView != null) this.setEditingAccessoryViewHidden(this.editingAccessoryInsertView, true);
        if (this.editingAccessoryView != null) this.setEditingAccessoryViewHidden(this.editingAccessoryView, true);

        // Set the view type
        if (value == UITableViewCellEditingStyle.Insert && this.editingAccessoryInsertView != null) {
            this.editingAccessoryView = this.editingAccessoryInsertView;
            this.setEditingAccessoryViewHidden(this.editingAccessoryInsertView, false);            
        } 
        else if (value == UITableViewCellEditingStyle.Delete && this.editingAccessoryDeleteView != null) {
            this.editingAccessoryView = this.editingAccessoryDeleteView;
            this.setEditingAccessoryViewHidden(this.editingAccessoryDeleteView, false);            
        } 
    }

    setEditingAccessoryViewHidden(view:MUIView, value:boolean){
        if (value == true){
            MUICoreLayerAddStyle(view.layer, "no-visible");
        }
        else {
            MUICoreLayerRemoveStyle(view.layer, "no-visible");
        }
    }

    private editingAccessoryViewDidClick(e:Event){
        e.stopPropagation();
        this._onEditingAccessoryClickFn.call(this._target, this);
    }

    private _setupLayer() {
        //this.layer.style.position = "absolute";        

        // let instance = this;
        // this.layer.onclick = function (e) {
        //     if (instance._onClickFn != null) {
        //         if(!e.detail || e.detail == 1){
        //             e.stopPropagation();
        //             instance._onClickFn.call(instance._target, instance);                
        //         }
        //     }
        //     MIOLog("CLK");
        // };

        // this.layer.ondblclick = function (e) {            
        //     if (instance._onDblClickFn != null) {
        //         e.stopPropagation();
        //         instance._onDblClickFn.call(instance._target, instance);
        //     }
        //     MIOLog("DBL CLK");
        // };
    }

    private _accessoryType:UITableViewCellAccessoryType = UITableViewCellAccessoryType.None;
    get accessoryType() {return this._accessoryType;}
    set accessoryType(value:UITableViewCellAccessoryType){
        this.setAccessoryType(value);
    }

    setAccessoryType(type) {
        if (type == this._accessoryType)
            return;

        if (this.accessoryView == null) {
            if (this.style == UITableViewCellStyle.Default) this.textLabel.layer.style.right = "25px";

            let layer = document.createElement("div");
            layer.style.position = "absolute";
            layer.style.top = "15px";
            layer.style.right = "5px";
            layer.style.width = "15px";
            layer.style.height = "15px";

            this.accessoryView = new MUIView("accessory_view");
            this.accessoryView.initWithLayer(layer, null);

            this.addSubview(this.accessoryView);
        }

        // if (type == UITableViewCellAccessoryType.None) this.accessoryView.setHidden(true);
        // else this.accessoryView.setHidden(false);

        if (type == UITableViewCellAccessoryType.None) {
            MUICoreLayerRemoveStyle(this.layer, "checked");
            this.accessoryView.hidden = true;
        } 
        else if (type == UITableViewCellAccessoryType.Checkmark) { 
            this.accessoryView.hidden = false;
            MUICoreLayerAddStyle(this.layer, "checked");
        }
        else if (type == UITableViewCellAccessoryType.DisclosureIndicator) { 
            this.accessoryView.hidden = false;
        }        

        this._accessoryType = type;
    }

    setPaddingIndex(value) {

        let offset = (value + 1) * 10;
        if (this.style == UITableViewCellStyle.Default) this.textLabel.setX(offset);
    }

    setHeight(h) {
        super.setHeight(h);

        let offsetY = (h - 15) / 2;

        if (this.accessoryView != null) {
            this.accessoryView.layer.style.top = offsetY + "px";
        }
    }

    setSelected(value) {
        if (this._selected == value) return;

        this.willChangeValue("selected");
        this._selected = value;
        if (this.selectionStyle == UITableViewCellSelectionStyle.Default) {
            if (value == true)
                MUICoreLayerAddStyle(this.layer, "selected");
            else 
                MUICoreLayerRemoveStyle(this.layer, "selected");
        }
        
        this.didChangeValue("selected"); 
    }

    set selected(value) {
        this.setSelected(value);
    }

    get selected() {
        return this._selected;
    }

    _setHightlightedSubviews(value) {
        for (var count = 0; count < this.subviews.length; count++) {
            var v = this.subviews[count];
            if (v instanceof MUILabel)
                v.setHightlighted(value);
        }
        if (this.accessoryView == null) return;

        if (value == true) {

            switch (this.accessoryType) {

                case UITableViewCellAccessoryType.DisclosureIndicator:
                    //this.accessoryView.layer.classList.remove("tableviewcell_accessory_disclosure_indicator");
                    //this.accessoryView.layer.classList.add("tableviewcell_accessory_disclosure_indicator_highlighted");
                    break;
            }
        }
        else {

            switch (this.accessoryType) {

                case UITableViewCellAccessoryType.DisclosureIndicator:
                    //this.accessoryView.layer.classList.remove("tableviewcell_accessory_disclosure_indicator_highlighted");
                    //this.accessoryView.layer.classList.add("tableviewcell_accessory_disclosure_indicator");
                    break;
            }
        }
    }

    setEditing(editing, animated?) {

        if (editing == this._editing) return;

        this._editing = editing;

        if (this.editingAccessoryView != null) {
            this.editingAccessoryView.setHidden(!editing);
        }
    }

    set editing(value: boolean) {
        this.setEditing(value, false);
    }

    get isEditing(): boolean {
        return this._editing;
    }
}