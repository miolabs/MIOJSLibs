
/// <reference path="MUIView.ts" />

enum MUIReportTableViewCellType {
    Custom,
    Label,
    Combox
}

class MUIReportTableViewCell extends MUIView {

    type = MUIReportTableViewCellType.Custom;    

    label:MUILabel = null;

    initWithLayer(layer, owner, options) {
        super.initWithLayer(layer, owner, options);

        this.layer.style.background = "";        
        this.layer.classList.add("tableviewcell_deselected_color");

        if (this.type == MUIReportTableViewCellType.Label) {

            let labelLayer = MUILayerGetFirstElementWithTag(layer, "LABEL");
            if (labelLayer != null){
                this.label = new MUILabel();
                this.label.initWithLayer(labelLayer, this);
                this.addSubview(this.label);
            }
        }
        
        // var instance = this;
        // this.layer.onclick = function () {
        //     if (instance._onClickFn != null)
        //         instance._onClickFn.call(instance._target, instance);
        // };

        // this.layer.ondblclick = function () {
        //     if (instance._onDblClickFn != null)
        //         instance._onDblClickFn.call(instance._target, instance);
        // };
    }
}

class MUIReportTableViewRow extends MUIView {
    cells = [];

    removeFromSuperview() {
        for (var index = 0; index < this.cells.length; index++) {
            let cell: MUIReportTableViewCell = this.cells[index];
            cell.removeFromSuperview();
        }
        super.removeFromSuperview();
    }
}

class MUIReportTableViewColumn extends MIOObject {

    static labelColumnWithTitle(title: string, width?, identifer?: string) {
        let col = new MUIReportTableViewColumn();
        col.title = title;
        col.identifier = identifer;
        if (width != null) col.width = width;
        return col;
    }

    identifier: string = null;
    title: string = null;
    width = 150;

    private _colHeader: MUIView = null;

    columnHeaderView() {
        if (this._colHeader != null)
            return this._colHeader;

        var header = new MUIView();
        header.init();
        header.setHeight(23);
        header.setWidth(this.width);
        header.layer.style.background = "";
        header.layer.classList.add("tableview_header");

        var titleLabel = new MUILabel();
        titleLabel.init();
        titleLabel.layer.style.background = "";
        titleLabel.layer.classList.add("tableview_header_title");
        titleLabel.text = this.title;
        header.addSubview(titleLabel);

        this._colHeader = header;

        return this._colHeader;
    }
}

class MUIReportTableView extends MUIView {
    dataSource = null;
    delegate = null;

    private cellPrototypes = {};
    private rows = [];
    private columns = [];

    selectedIndexPath = null;

    initWithLayer(layer, owner, options?) {
        super.initWithLayer(layer, owner, options);

        
        // Check if we have prototypes
        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var subLayer = this.layer.childNodes[index];

                if (subLayer.tagName != "DIV")
                    continue;

                if (subLayer.getAttribute("data-cell-identifier") != null) {
                    this._addCellPrototypeWithLayer(subLayer);
                    subLayer.style.display = "none";
                }
                // else if (subLayer.getAttribute("data-tableview-header") != null) {
                //     this._addHeaderWithLayer(subLayer);
                // }
                // else if (subLayer.getAttribute("data-tableview-footer") != null) {
                //     this._addFooterWithLayer(subLayer);
                // }
            }
        }
    }

    private _addCellPrototypeWithLayer(subLayer) {
        var cellIdentifier = subLayer.getAttribute("data-cell-identifier");
        var cellClassname = subLayer.getAttribute("data-class");
        var type = subLayer.getAttribute("data-report-cell-type");
        if (cellClassname == null) cellClassname = "MUIReportTableViewCell";
        if (type == null) type = MUIReportTableViewCellType.Custom;
        else if (type.toLocaleLowerCase() == "label") type = MUIReportTableViewCellType.Label;
        else if (type.toLocaleLowerCase() == "combobox") type = MUIReportTableViewCellType.Combox;

        var item = {};
        item["class"] = cellClassname;
        item["layer"] = subLayer;
        item["type"] = type;
        var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        if (size != null) item["size"] = size;

        this.cellPrototypes[cellIdentifier] = item;
    }

    addColumn(column: MUIReportTableViewColumn) {
        this.columns.push(column);
    }

    removeAllColumns(){
        this.columns = [];
    }

    dequeueReusableCellWithIdentifier(identifier:string) {

        var item = this.cellPrototypes[identifier];

        //instance creation here
        var className = item["class"];
        var cell = Object.create(window[className].prototype);
        cell.constructor.apply(cell);

        //cell.init();
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
    }

    reloadData() {

        // Remove all subviews
        for (var index = 0; index < this.rows.length; index++) {
            let row = this.rows[index];
            row.removeFromSuperview();
        }

        this.selectedIndexPath = null;

        for (var index = 0; index < this.columns.length; index++) {

            let col:MUIReportTableViewColumn = this.columns[index];
            let header = col.columnHeaderView();
            this.addSubview(header);
        }

        let rows = this.dataSource.numberOfRows(this);

        for (var rowIndex = 0; rowIndex < rows; rowIndex++) {
            let row = new MUIReportTableViewRow();
            row.init();
            for (var colIndex = 0; colIndex < this.columns.length; colIndex++) {

                let indexPath = MIOIndexPath.indexForColumnInRowAndSection(colIndex, rowIndex, 0);
                let cell = this.dataSource.cellAtIndexPath(this, indexPath);
                this.addSubview(cell);
                row.cells.push(cell);
            }
            this.rows.push(row);
        }

        this.setNeedsDisplay();
    }

    layout() {

        //super.layout();

        if (this._viewIsVisible == false) return;
        if (this.hidden == true) return;
        if (this._needDisplay == false) return;
        this._needDisplay = false;


        var x = 0;
        var y = 0;
        var w = this.getWidth();

        for (var colIndex = 0; colIndex < this.columns.length; colIndex++) {
            let col:MUIReportTableViewColumn = this.columns[colIndex];
            let header:MUIView = col.columnHeaderView();
            header.setX(x);
            x += col.width;
        }
        y += 23;

        x = 0;
        var offsetY = 0;
        for (var rowIndex = 0; rowIndex < this.rows.length; rowIndex++){
            let row:MUIReportTableViewRow = this.rows[rowIndex];
            for (var colIndex = 0; colIndex < this.columns.length; colIndex++){
                let col = this.columns[colIndex];
                let cell = row.cells[colIndex];
                cell.setX(x);                
                cell.setY(y);
                cell.setWidth(col.width);
                x += col.width;
                
                let h = cell.getHeight();
                if (offsetY < h) offsetY = h;
            }
            x = 0;
            y += offsetY;
            if (offsetY == 0) y += 40; 
        }

    }
/*
        if (this.headerView != null) {
            this.headerView.setY(y);

            if (this.headerHeight > 0) {
                this.headerView.setHeight(this.headerHeight);
                y += this.headerHeight;
            }
            else
                y += this.headerView.getHeight();
        }

        for (var count = 0; count < this.sections.length; count++) {
            var section = this.sections[count];

            if (section.header != null) {
                section.header.setY(y);
                var sh = section.header.getHeight();
                if (sh > 0) {
                    y += sh;
                }
                else {
                    section.header.setHeight(this.sectionHeaderHeight);
                    y += this.sectionHeaderHeight;
                }
            }

            for (var index = 0; index < section.cells.length; index++) {
                var h = 0;

                if (this.delegate != null) {
                    if (typeof this.delegate.heightForRowAtIndexPath === "function")
                        h = this.delegate.heightForRowAtIndexPath(this, index, section);
                }

                var cell = section.cells[index];
                if (this.delegate != null) {
                    if (typeof this.delegate.willDisplayCellAtIndexPath === "function")
                        this.delegate.willDisplayCellAtIndexPath(this, cell, index, section);
                }

                cell.setY(y);
                if (h > 0)
                    cell.setHeight(h);

                if (h == 0)
                    h = cell.getHeight();

                if (h == 0) {
                    h = 44;
                    cell.setHeight(h);
                }

                y += h;
                if (cell.separatorStyle == MUITableViewCellSeparatorStyle.SingleLine)
                    y += 1;
                else if (cell.separatorStyle == MUITableViewCellSeparatorStyle.SingleLineEtched)
                    y += 2;

                cell.layout();
            }
        }

        if (this.footerView != null) {
            this.footerView.setY(y);

            if (this.footerHeight > 0) {
                this.footerView.setHeight(this.footerHeight);
                y += this.footerHeight;
            }
            else
                y += this.footerView.getHeight() + 1;
        }

        this.layer.scrollHeight = y;
}*/
}