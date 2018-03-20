
import { MUIView } from "./MUIView";
import { MUILabel } from "./MUILabel";

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

export enum MIOTableViewCellEditingStyle {

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

    reuseIdentifier:string = null;

    nodeID:string = null;

    contentView: MUIView = null;
    style = MUITableViewCellStyle.Custom;

    textLabel = null;

    accessoryType = MUITableViewCellAccessoryType.None;
    accessoryView = null;
    separatorStyle = MUITableViewCellSeparatorStyle.SingleLine;

    selectionStyle = MUITableViewCellSelectionStyle.Default;
    private _selected = false;

    private _editing = false;
    editingAccessoryType = MUITableViewCellAccessoryType.None;
    editingAccesoryView: MUIView = null;

    private _target = null;
    private _onClickFn = null;
    private _onDblClickFn = null;
    private _onAccessoryClickFn = null;
    private _row = 0;
    private _section = 0;

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
        }

        this._setupLayer();
    }

    initWithLayer(layer, owner, options) {
        super.initWithLayer(layer, owner, options);

        this._setupLayer();
    }

    private _setupLayer() {
        this.layer.style.background = "";

        var instance = this;
        this.layer.classList.add("tableviewcell_deselected_color");

        this.layer.onclick = function (e) {            
            if (instance._onClickFn != null){
                e.stopPropagation();
                instance._onClickFn.call(instance._target, instance);
            }
        };

        this.layer.ondblclick = function (e) {            
            if (instance._onDblClickFn != null){
                e.stopPropagation();
                instance._onDblClickFn.call(instance._target, instance);
            }
        };
    }

    setAccessoryType(type) {
        if (type == this.accessoryType)
            return;

        if (this.accessoryView == null) {
            if (this.style == MUITableViewCellStyle.Default) this.textLabel.layer.style.right = "25px";

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

        // Remove the previous accessory
        if (this.accessoryType == MUITableViewCellAccessoryType.Checkmark)
            this.accessoryView.layer.classList.remove("tableviewcell_accessory_checkmark");
        else if (this.accessoryType == MUITableViewCellAccessoryType.DisclosureIndicator)
            this.accessoryView.layer.classList.remove("tableviewcell_accessory_disclosure_indicator");
        else if (this.accessoryType == MUITableViewCellAccessoryType.DetailDisclosureButton)
            this.accessoryView.layer.classList.remove("tableviewcell_accessory_detail_disclosure_button");

        // Add the new one
        if (type == MUITableViewCellAccessoryType.Checkmark)
            this.accessoryView.layer.classList.add("tableviewcell_accessory_checkmark");
        else if (type == MUITableViewCellAccessoryType.DisclosureIndicator)
            this.accessoryView.layer.classList.add("tableviewcell_accessory_disclosure_indicator");
        else if (type == MUITableViewCellAccessoryType.DetailDisclosureButton)
            this.accessoryView.layer.classList.add("tableviewcell_accessory_detail_disclosure_button");

        this.accessoryType = type;
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
    }

    setEditing(editing, animated?) {

        if (editing == this._editing) return;

        this._editing = editing;

        if (this.editingAccesoryView == null) {
            if (this.style == MUITableViewCellStyle.Default) this.textLabel.layer.style.left = "25px";

            var layer = document.createElement("div");
            layer.style.position = "absolute";

            var btn = new MUIView();
            btn.init();

            btn.layer.style.top = "";
            btn.layer.style.right = "";
            btn.layer.style.width = "";
            btn.layer.style.height = "100%";

            // TODO: Call delegate
            btn.layer.classList.add("tableviewcell_accessory_delete");

            var instance = this;
            btn.layer.onclick = function (e) {
                if (instance._onAccessoryClickFn != null){
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

    }

    set editing(value: boolean) {
        this.setEditing(value, false);
    }

    get isEditing(): boolean {
        return this._editing;
    }
}