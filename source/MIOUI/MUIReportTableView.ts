import { MUIView, MUILayerGetFirstElementWithTag } from "./MUIView";
import { MIOObject, MIOFormatter, MIOIndexPath, MIOSize, MIORange } from "../MIOFoundation";
import { MUILabel } from "./MUILabel";
import { MUIScrollView } from "./MUIScrollView";

export enum MUIReportTableViewCellType {
    Custom,
    Label,
    Combox
}

export class MUIReportTableViewCell extends MUIView {

    type = MUIReportTableViewCellType.Custom;

    label: MUILabel = null;

    private _target = null;
    private _onClickFn = null;
    private parentRow = null;

    initWithLayer(layer, owner, options) {
        super.initWithLayer(layer, owner, options);

        this.layer.style.background = "";
        this.layer.classList.add("tableviewcell_deselected_color");

        if (this.type == MUIReportTableViewCellType.Label) {

            let labelLayer = MUILayerGetFirstElementWithTag(layer, "LABEL");
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

        // this.layer.ondblclick = function () {
        //     if (instance._onDblClickFn != null)
        //         instance._onDblClickFn.call(instance._target, instance);
        // };
    }
}

export class MUIReportTableViewRow extends MIOObject {
    cells = [];
    y = 0;
    height = 0;

    removeFromSuperview() {
        for (let index = 0; index < this.cells.length; index++) {
            let cell: MUIReportTableViewCell = this.cells[index];
            cell.removeFromSuperview();
        }
        //super.removeFromSuperview();
        this.cells = [];
    }
}

export class MUIReportTableViewColumn extends MIOObject {

    static labelColumnWithTitle(title: string, width, minWidth, alignment, key?, formatter?:MIOFormatter, identifer?: string) {
        let col = new MUIReportTableViewColumn();
        col.title = title;
        col.identifier = identifer;
        col.width = width;
        col.minWidth = minWidth;
        col.serverName = key;
        col.alignment = alignment;
        col.formatter = formatter;
        return col;
    }

    identifier: string = null;
    title: string = null;
    width = 0;
    minWidth = 0;
    serverName: string = null;
    pixelWidth = 0;
    alignment = "center";
    formatter:MIOFormatter = null;
    ascending = true;

    private _colHeader: MUIView = null;

    _target = null;
    _onHeaderClickFn = null;

    columnHeaderView() {
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
    }

    removeFromSuperview(){
        if (this._colHeader != null) this._colHeader.removeFromSuperview();
    }
}

export class MUIReportTableView extends MUIScrollView {
    dataSource = null;
    delegate = null;

    private cellPrototypes = {};
    private cells = [];
    private rows = [];
    private rowsCount = 0;
    columns = [];    

    private defaultRowHeight = 44;
    private contentHeight = 0;
    private rowByCell = {};

    selectedIndexPath = null;

    initWithLayer(layer, owner, options?) {
        super.initWithLayer(layer, owner, options);


        // Check if we have prototypes
        if (this.layer.childNodes.length > 0) {
            for (let index = 0; index < this.layer.childNodes.length; index++) {
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

    removeAllColumns() {
        for (let index = 0; index < this.columns.length; index++) {

            let col: MUIReportTableViewColumn = this.columns[index];
            let header = col.columnHeaderView();
            header.removeFromSuperview();
        }

        this.columns = [];
    }

    dequeueReusableCellWithIdentifier(identifier: string) {

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
        for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
            let col: MUIReportTableViewColumn = this.columns[colIndex];            
            col.removeFromSuperview();
        }

        for (let index = 0; index < this.rows.length; index++) {
            let row = this.rows[index];
            row.removeFromSuperview();
        }

        this.contentHeight = 23;
        let rows = this.dataSource.numberOfRows(this);
        this.contentHeight += rows * this.defaultRowHeight;
        this.rowsCount = rows;

        let size = new MIOSize(0, this.contentHeight);
        this.contentSize = size;        
        this.scrollToTop();

        this.reloadLayoutSubviews = true;

        this.setNeedsDisplay();
    }

    private reloadLayoutSubviews = false;
    layoutSubviews() {
 
        if (this.reloadLayoutSubviews == true) {
            this.reloadLayoutSubviews = false;
            this.initialLayoutSubviews();
        }
        else {
            this.scrollLayoutSubviews();
        }
    }

    private initialLayoutSubviews() {

        //if (this.rowsCount == 0) return;
        
        //let posY = this.addHeader();
        let maxY = this.getHeight() + (this.defaultRowHeight * 2);

        var x = 0;
        var y = 0;
        var w = this.getWidth();

        for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
            let col: MUIReportTableViewColumn = this.columns[colIndex];            
            let header: MUIView = col.columnHeaderView();
            
            header.setX(x);
            col.pixelWidth = (col.width * this.getWidth()) / 100;
            if (col.minWidth > 0 && col.pixelWidth < col.minWidth) col.pixelWidth = col.minWidth;
            header.setWidth(col.pixelWidth);            
            x += col.pixelWidth;

            col._onHeaderClickFn = this.onHeaderClickFn;                        
            col._target = this;
            this.addSubview(header);
        }    
        y += 23;
        x = 0;

        if (this.rowsCount == 0) return;

        var exit = false;

        var currentRow = 0;
        while (exit == false){
            
            // New row
            let row = new MUIReportTableViewRow();
            row.init();

            var offsetY = 0;
            for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
                let col = this.columns[colIndex];
                let indexPath = MIOIndexPath.indexForColumnInRowAndSection(colIndex, currentRow, 0);
                let cell = this.dataSource.cellAtIndexPath(this, col, indexPath);
                
                //TODO: Review why is not absoute
                cell.layer.style.postion = "absolute";

                cell._target = this;
                cell._onClickFn = this.cellOnClickFn;                
                this.addSubview(cell);
                
                cell.setX(x);
                cell.setY(y);
                cell.setWidth(col.pixelWidth);
                x += col.pixelWidth;

                let h = cell.getHeight();
                if (offsetY < h) offsetY = h;

                cell.parentRow = row;
                row.cells.push(cell); 
            }            
            this.lastIndexPath = MIOIndexPath.indexForRowInSection(currentRow, 0);
            this.rows.push(row);
            currentRow++;
            x = 0;

            if (offsetY == 0) offsetY = this.defaultRowHeight;            
            row.y = y;
            row.height = offsetY;
            y += offsetY;
            
            if (offsetY != this.defaultRowHeight) {
                this.contentHeight -= this.defaultRowHeight;
                this.contentHeight += offsetY;
            }

            if (y >= maxY) {                
                exit = true;
            }
        }

        this.visibleRange = new MIORange(0, this.rows.length);

        let size = new MIOSize(0, this.contentHeight);
        this.contentSize = size;
        this.lastContentOffsetY = 0;
    }

    private lastIndexPath:MIOIndexPath = null;
    private visibleRange:MIORange = null;
    private lastContentOffsetY = 0;
    private scrollLayoutSubviews() {

        if (this.rowsCount == 0) return;

        var scrollDown = false;
        var offsetY = 0;
        if (this.contentOffset.y == this.lastContentOffsetY) return;
        if (this.contentOffset.y > this.lastContentOffsetY) {
            offsetY = this.contentOffset.y - this.lastContentOffsetY;
            scrollDown = true;
        }
        else if (this.contentOffset.y < this.lastContentOffsetY) {
            offsetY = this.lastContentOffsetY - this.contentOffset.y;
            scrollDown = false;
        }

        if (offsetY < (this.defaultRowHeight / 2)) return;
        this.lastContentOffsetY = this.contentOffset.y;

        if (scrollDown == true) {

            var start = this.visibleRange.location;
            var end = this.visibleRange.location + this.visibleRange.length - 1;
            var row = this.rows[end];
            var posY = row.y + row.height;
            let maxY = this.contentOffset.y + this.getHeight() + (this.defaultRowHeight * 2);
            var startRowIndex = this.lastIndexPath.row + 1;

            var nextRow = end + 1;
            var exit = false;

            let x = 0;
            let y = posY;

            var currentRow = startRowIndex;
            while (exit == false){
                
                // New row
                row = new MUIReportTableViewRow();
                row.init();
    
                offsetY = 0;
                for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
                    let col = this.columns[colIndex];
                    let indexPath = MIOIndexPath.indexForColumnInRowAndSection(colIndex, currentRow, 0);
                    let cell = this.dataSource.cellAtIndexPath(this, col, indexPath);
                    
                    //TODO: Review why is not absoute
                    cell.layer.style.postion = "absolute";
    
                    cell._target = this;
                    cell._onClickFn = this.cellOnClickFn;                
                    this.addSubview(cell);
                    
                    cell.setX(x);
                    cell.setY(y);
                    cell.setWidth(col.pixelWidth);
                    x += col.pixelWidth;
    
                    let h = cell.getHeight();
                    if (offsetY < h) offsetY = h;
    
                    cell.parentRow = row;
                    row.cells.push(cell); 
                }            
                this.lastIndexPath = MIOIndexPath.indexForRowInSection(currentRow, 0);
                this.rows.push(row);
                currentRow++;
                x = 0;
    
                if (offsetY == 0) offsetY = this.defaultRowHeight;
                row.y = y;
                row.height = offsetY;
                y += offsetY;
                    
                if (offsetY != this.defaultRowHeight) {
                    this.contentHeight -= this.defaultRowHeight;
                    this.contentHeight += offsetY;
                }
    
                if (y >= maxY) {                
                    exit = true;
                }
            }
    
            this.visibleRange = new MIORange(0, this.rows.length);
    
            let size = new MIOSize(0, this.contentHeight);
            this.contentSize = size;
            this.lastContentOffsetY = 0;
        }
        else {
            // TODO
        }
            
    }



    onHeaderClickFn(col:MUIReportTableViewColumn){

        if (this.delegate != null) {
            if (typeof this.delegate.sortDescriptorsDidChange === "function")
                this.delegate.sortDescriptorsDidChange(this, col);
        }

    }

    cellOnClickFn(cell) {
                
        let row:MUIReportTableViewRow = cell.parentRow;
        let colIndex = row.cells.indexOf(cell);
        let rowIndex = this.rows.indexOf(row);
        let ip = MIOIndexPath.indexForColumnInRowAndSection(colIndex, rowIndex, 0);

        if (this.delegate != null) {
            if (typeof this.delegate.didSelectCellAtIndexPath === "function")
                this.delegate.didSelectCellAtIndexPath(this, ip);
        }
    }
    
}