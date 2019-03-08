
import { MUIView } from "./MUIView";
import { MUILabel } from "./MUILabel";
import { MUIButton, MUICoreLayerAddStyle, MUICoreLayerRemoveStyle } from ".";

export enum MUITableViewCellStyle {

    Custom,
    Default
}

export enum MUITableViewCellAccessoryType {

    None,
    DisclosureIndicator,
    DetailDisclosureButton,
    Checkmark
}

export enum MUITableViewCellEditingStyle {

    None,
    Delete,
    Insert
}

export enum MUITableViewCellSeparatorStyle {

    None,
    SingleLine,
    SingleLineEtched // TODO 
}

export enum MUITableViewCellSelectionStyle {

    None,
    Default
}

export class MUITableViewCell extends MUIView {

    reuseIdentifier: string = null;

    nodeID: string = null;

    contentView: MUIView = null;
    style = MUITableViewCellStyle.Custom;

    textLabel = null;
    
    accessoryView:MUIView = null;
    separatorStyle = MUITableViewCellSeparatorStyle.SingleLine;

    private _editing = false;
    editingAccessoryView: MUIView = null;

    selectionStyle = MUITableViewCellSelectionStyle.Default;
    private _selected = false;

    _target = null;
    _onClickFn = null;
    _onDblClickFn = null;
    _onAccessoryClickFn = null;
    _onEditingAccessoryClickFn = null;

    _section = null;

    initWithStyle(style: MUITableViewCellStyle) {

        super.init();
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

        if (type == "checkmark") this.accessoryType = MUITableViewCellAccessoryType.Checkmark;
        else this.accessoryType = MUITableViewCellAccessoryType.None;

        if (this.accessoryType != MUITableViewCellAccessoryType.None) return;
        
        this.accessoryView.layer.addEventListener("click", this.accessoryViewDidClick.bind(this));
    }

    private accessoryViewDidClick(e:Event){
        e.stopPropagation();
        this._onAccessoryClickFn.call(this._target, this);
    }

    private editingAccessoryInsertView:MUIView = null;
    private editingAccessoryDeleteView:MUIView = null;
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

    private _editingAccessoryType = MUITableViewCellEditingStyle.None;

    get editingAccessoryType(){ return this._editingAccessoryType;}
    set editingAccessoryType(value:MUITableViewCellEditingStyle){
        this.setEditingAccessoryType(value);
    }

    setEditingAccessoryType(value:MUITableViewCellEditingStyle){
        this._editingAccessoryType = value;

        // Reset
        if (this.editingAccessoryDeleteView != null) this.editingAccessoryDeleteView.setHidden(true);
        if (this.editingAccessoryInsertView != null) this.editingAccessoryInsertView.setHidden(true);
        if (this.editingAccessoryView != null) this.editingAccessoryView.setHidden(true);

        // Set the view type
        if (value == MUITableViewCellEditingStyle.Insert && this.editingAccessoryInsertView != null) {
            this.editingAccessoryView = this.editingAccessoryInsertView;
            this.editingAccessoryInsertView.setHidden(false);            
        } 
        else if (value == MUITableViewCellEditingStyle.Delete && this.editingAccessoryDeleteView != null) {
            this.editingAccessoryView = this.editingAccessoryDeleteView;
            this.editingAccessoryDeleteView.setHidden(false);            
        } 
    }

    private editingAccessoryViewDidClick(e:Event){
        e.stopPropagation();
        this._onEditingAccessoryClickFn.call(this._target, this);
    }

    private _setupLayer() {
        //this.layer.style.position = "absolute";        

        let instance = this;
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
    }

    private _accessoryType:MUITableViewCellAccessoryType = MUITableViewCellAccessoryType.None;
    get accessoryType() {return this._accessoryType;}
    set accessoryType(value:MUITableViewCellAccessoryType){
        this.setAccessoryType(value);
    }

    setAccessoryType(type) {
        if (type == this._accessoryType)
            return;

        if (this.accessoryView == null) {
            if (this.style == MUITableViewCellStyle.Default) this.textLabel.layer.style.right = "25px";

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

        // if (type == MUITableViewCellAccessoryType.None) this.accessoryView.setHidden(true);
        // else this.accessoryView.setHidden(false);

        if (type == MUITableViewCellAccessoryType.None) MUICoreLayerRemoveStyle(this.layer, "checked");
        else MUICoreLayerAddStyle(this.layer, "checked");

        this._accessoryType = type;
    }

    setPaddingIndex(value) {

        var offset = (value + 1) * 10;
        if (this.style == MUITableViewCellStyle.Default) this.textLabel.setX(offset);
    }

    setHeight(h) {
        super.setHeight(h);

        var offsetY = (h - 15) / 2;

        if (this.accessoryView != null) {
            this.accessoryView.layer.style.top = offsetY + "px";
        }
    }

    setSelected(value) {
        if (this._selected == value) return;

        // WORKAORUND
        //let fix = this.layer.getClientRects();
        // WORKAORUND

        this.willChangeValue("selected");
        this._selected = value;
        if (this.selectionStyle == MUITableViewCellSelectionStyle.Default) {
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

                case MUITableViewCellAccessoryType.DisclosureIndicator:
                    //this.accessoryView.layer.classList.remove("tableviewcell_accessory_disclosure_indicator");
                    //this.accessoryView.layer.classList.add("tableviewcell_accessory_disclosure_indicator_highlighted");
                    break;
            }
        }
        else {

            switch (this.accessoryType) {

                case MUITableViewCellAccessoryType.DisclosureIndicator:
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