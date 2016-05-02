/**
 * Created by godshadow on 22/3/16.
 */

    /// <reference path="MIOView.ts" />

function MIOTableViewFromElementID(view, elementID)
{
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;

    var tv = new MIOTableView();
    tv.initWithLayer(layer);
    view._linkViewToSubview(tv);

    return tv;
}

class MIOTableViewCell extends MIOView
{
    selected = false;

    private _target = null;
    private _onClickFn = null;
    private _onDblClickFn = null;
    private _row = 0;
    private _section = 0;

    init()
    {
        super.init();
        this._setupLayer();
    }

    initWithLayer(layer, options?)
    {
        super.initWithLayer(layer, options);
        this._setupLayer();
    }

    _setupLayer()
    {
        var instance = this;
        this.layer.classList.add("tableviewcell_deselected_color");

        this.layer.onclick = function()
        {
            if (instance._onClickFn != null)
                instance._onClickFn.call(instance._target, instance);
        }

        this.layer.ondblclick = function()
        {
            if (instance._onDblClickFn != null)
                instance._onDblClickFn.call(instance._target, instance);
        }
    }

    setSelected(value)
    {
        this.willChangeValue("selected");
        this.selected = value;

        if (value == true) {
            this.layer.classList.remove("tableviewcell_deselected_color");
            this.layer.classList.add("tableviewcell_selected_color");
        }
        else
        {
            this.layer.classList.remove("tableviewcell_selected_color");
            this.layer.classList.add("tableviewcell_deselected_color");
        }

        this._setHightlightedSubviews(value);

        this.didChangeValue("selected");
    }

    _setHightlightedSubviews(value)
    {
        for (var count = 0; count < this.subviews.length; count++)
        {
            var v = this.subviews[count];
            if (v instanceof MIOLabel)
                v.setHightlighted(value);
        }
    }
}

class MIOTableViewSection extends MIOObject
{
    header = null;
    cells = [];
}

class MIOTableView extends MIOView
{
    dataSource = null;
    delegate = null;

    sections = [];
    headerView = null;

    private selectedCellRow = -1;
    private selectedCellSection = -1;

    private cellPrototypes = {};

    initWithLayer(layer, options?)
    {
        super.initWithLayer(layer, options);

        // Check if we have a header in the tableview
        if (this.layer.childNodes.length > 0)
        {
            // Get the first div element. We don't support more than one element
            var index = 0;
            var headerLayer = this.layer.childNodes[index];
            while(headerLayer.tagName != "DIV")
            {
                index++;
                headerLayer = this.layer.childNodes[index];
            }

            this.headerView = new MIOView();
            this.headerView.initWithLayer(headerLayer);
        }
    }

    addCellPrototypeWithIdentifier(identifier, classname,  html, css, elementID)
    {
        var item = {"html" : html, "css" : css, "id" : elementID, "class" : classname};
        this.cellPrototypes[identifier] = item;
    }

    cellWithIdentifier(identifier)
    {
        var item = this.cellPrototypes[identifier];

        //instance creation here
        var className = item["class"];
        var cell = Object.create(window[className].prototype);
        cell.constructor.apply(cell);

        var html = item["html"];
        var css = item["css"];
        var elID = item["id"];
        var layer = MIOLayerFromResource(html, css, elID);
        cell.initWithLayer(layer);

        return cell;
    }

    setHeaderView(view)
    {
        this.headerView = view;
        this.addSubview(this.headerView);
    }

    reloadData()
    {
        // Remove all subviews
        for (var index = 0; index < this.sections.length; index++)
        {
            var section = this.sections[index];
            if (section.header != null)
                section.header.removeFromSuperview();

            for (var count = 0; count < section.cells.length; count++){
                var cell = section.cells[count];
                cell.removeFromSuperview();
            }

        }

        this.sections = [];

        var sections = this.dataSource.numberOfSections(this);
        for (var sectionIndex = 0; sectionIndex < sections; sectionIndex++)
        {
            var section = new MIOTableViewSection();
            this.sections.push(section);

            var rows = this.dataSource.numberOfRowsInSection(this, sectionIndex);

            if (typeof this.dataSource.titleForHeaderInSection === "function")
            {
                var title = this.dataSource.titleForHeaderInSection(this, sectionIndex);
                var header = new MIOView();
                header.init();
                header.layer.classList.add("tableview_header");
                section.header = header;

                var titleLabel = new MIOLabel();
                titleLabel.init();
                titleLabel.layer.classList.add("tableview_header_title");
                titleLabel.setText(title);
                header.addSubview(titleLabel);

                this.addSubview(header);
            }

            for (var index = 0; index < rows; index++)
            {
                var cell = this.dataSource.cellAtIndexPath(this, index, sectionIndex);
                cell.addObserver(this, "selected");
                section.cells.push(cell);
                this.addSubview(cell);

                cell._target = this;
                cell._onClickFn = this.cellOnClickFn;
                cell._onDblClickFn = this.cellOnDblClickFn;
                cell._row = index;
                cell._section = sectionIndex;
            }
        }

        this.layout();
    }

    layout()
    {
        super.layout();

        if (this.sections == null)
            return;

        var y = 0;
        var w = this.getWidth();

        if (this.headerView != null)
        {
            y += this.headerView.getHeight() + 1;
        }

        for (var count = 0; count < this.sections.length; count++)
        {
            var section = this.sections[count];

            if (section.header != null)
            {
                section.header.setY(y);
                y += 23;
            }

            for (var index = 0; index < section.cells.length; index++) {
                var h = 44;

                if (this.delegate != null) {
                    if (typeof this.delegate.heightForRowAtIndexPath === "function")
                        h = this.delegate.heightForRowAtIndexPath(this, count);
                }

                var cell = section.cells[index];
                cell.setY(y);
                cell.setWidth(w);
                cell.setHeight(h);

                y += h + 1;
            }
        }
    }

    cellOnClickFn(cell)
    {
        var index = cell._row;
        var section = cell._section;

        if (this.selectedCellRow == index && this.selectedCellSection == section)
            return;

        if (this.selectedCellRow > -1 && this.selectedCellSection > -1)
            this.deselectCellAtIndexPath(this.selectedCellRow, this.selectedCellSection);

        this.selectedCellRow = index;
        this.selectedCellSection = section;

        this._selectCell(cell);

        if (this.delegate != null){
            if (typeof this.delegate.didSelectCellAtIndexPath === "function")
                this.delegate.didSelectCellAtIndexPath(this, index, section);
        }
    }

    cellOnDblClickFn(cell)
    {
        var index = cell._row;
        var section = cell._section;

        if (this.selectedCellRow == index && this.selectedCellSection == section) {

            if (this.delegate != null)
                if (typeof this.delegate.didMakeDoubleClick === "function")
                    this.delegate.didMakeDoubleClick(this, index, section);
            return;
        }

        if (this.selectedCellRow > -1 && this.selectedCellSection > -1)
            this.deselectCellAtIndexPath(this.selectedCellRow, this.selectedCellSection);

        this.selectedCellRow = index;
        this.selectedCellSection = section;

        this._selectCell(cell);

        if (this.delegate != null){
            if (typeof this.delegate.didSelectCellAtIndexPath === "function")
                this.delegate.didSelectCellAtIndexPath(this, index, section);
        }

        if (this.delegate != null)
            if (typeof this.delegate.didMakeDoubleClick === "function")
                this.delegate.didMakeDoubleClick(this, index, section);
    }

    _selectCell(cell)
    {
        cell.setSelected(true);
    }

    selectCellAtIndexPath(row, section)
    {
        this.selectedCellRow = row;
        this.selectedCellSection = section;
        var cell = this.sections[section].cells[row];
        this._selectCell(cell);
    }

    _deselectCell(cell)
    {
        cell.setSelected(false);
    }

    deselectCellAtIndexPath(row, section)
    {
        this.selectedCellRow = -1;
        this.selectedCellSection = -1;
        var cell = this.sections[section].cells[row];
        this._deselectCell(cell);
    }

}