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

    _target = null;
    _onClickFn = null;

    constructor()
    {
        super();
    }

    init()
    {
        super.init();
        this._setupLayer();
    }

    initWithLayer(layer)
    {
        super.initWithLayer(layer);
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

class MIOTableView extends MIOView
{
    dataSource = null;
    delegate = null;

    cells = [];
    selectedCellIndex = -1;
    cellPrototypes = {};

    constructor()
    {
        super();
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
        cell.constructor.apply(cell, new Array("World"));

        var html = item["html"];
        var css = item["css"];
        var elID = item["id"];
        var layer = MIOLayerFromResource(html, css, elID);
        cell.initWithLayer(layer);

        return cell;
    }

    reloadData()
    {
        this.removeAllSubviews();
        this.cells = [];

        var rows = this.dataSource.numberOfRowsForTableView(this);

        for (var count = 0; count < rows; count++)
        {
            var cell = this.dataSource.cellAtIndexForTableView(this, count);
            cell.addObserver(this, "selected");
            this.cells.push(cell);
            this.addSubview(cell);

            cell._target = this;
            cell._onClickFn = this.cellOnClickFn;
        }

        this.layout();
    }

    layout()
    {
        super.layout();

        var y = 0;
        var w = this.getWidth();

        for (var count = 0; count < this.cells.length; count++)
        {
            var h = 44;

            if (this.delegate != null) {
                if (typeof this.delegate.heightForRowAtIndexForTableView === "function")
                    h = this.delegate.heightForRowAtIndexForTableView(this, count);
            }

            var cell = this.cells[count];
            cell.setY(y);
            cell.setWidth(w);
            cell.setHeight(h);

            y += h + 1;
        }
    }

    cellOnClickFn(cell)
    {
        var index = this.cells.indexOf(cell);
        if (this.selectedCellIndex == index)
            return;

        if (this.selectedCellIndex > -1)
            this.deselectCellAtIndex(this.selectedCellIndex);

        this.selectedCellIndex = index;
        this._selectCell(cell);

        if (this.delegate != null){
            if (typeof this.delegate.didSelectCellAtIndex === "function")
                this.delegate.didSelectCellAtIndex(index);
        }
    }

    _selectCell(cell)
    {
        cell.setSelected(true);
    }

    selectCellAtIndex(index)
    {
        this.selectedCellIndex = index;
        var cell = this.cells[index];
        this._selectCell(cell);
    }

    _deselectCell(cell)
    {
        cell.setSelected(false);
    }

    deselectCellAtIndex(index)
    {
        this.selectedCellIndex = -1;
        var cell = this.cells[index];
        this._deselectCell(cell);
    }

}