/**
 * Created by godshadow on 11/3/16.
 */

    /// <reference path="MIOView.ts" />
    /// <reference path="MIOLabel.ts" />

class MIOCalendarCell extends MIOView
{
    date = null;
    dayIndex = 0;
    index = 0;

    parent = null;

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
        this.layer.style.position = "absolute";
        var instance = this;
        this.layer.onclick = function()
        {
            if (instance.parent.delegate != null)
                instance.parent.delegate.cellDidSelectedForCalendar(instance.parent, instance.date, instance.index);
        }
    }
}

class MIOCalendarView extends MIOView
{
    startDate = null;
    endDate = null;
    dataSource = null;
    delegate = null;

    headers = [];
    cells = [];
    cellDates = [];

    cellPrototypes = {};

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
        // Remove all subviews
        while (this.subviews.length > 0)
        {
            var view = this.subviews[0];
            view.removeFromSuperview();
        }

        this.startDate = this.dataSource.startDateForCalendar(this);
        this.endDate = this.dataSource.endDateForCalendar(this);

        var currentDate = new Date(this.startDate.getTime());
        var currentMonth = -1;

        var dayIndex = 0;
        var count = 0;

        while(this.endDate >= currentDate)
        {
            dayIndex = MIOCalendarGetDayRowFromDate(currentDate);

            if (currentDate.getMonth() > currentMonth)
            {
                currentMonth = currentDate.getMonth();
                var title = "";
                var header = null;

                if (typeof this.dataSource.viewTitleForHeaderAtMonthForCalendar === "function")
                {
                    header = this.dataSource.viewTitleForHeaderAtMonthForCalendar(this, currentMonth);
                }
                else if (typeof this.dataSource.titleForHeaderAtMonthForCalendar === "function")
                {
                    title = this.dataSource.titleForHeaderAtMonthForCalendar(this, currentMonth);
                    header = new MIOLabel();
                    header.init();
                    header.setHeight(20);
                    header.setText(title);
                }
                else
                {
                    header = new MIOView();
                    header.init();
                }

                this.addSubview(header);
            }

            var cell = this.dataSource.cellAtDateForCalendar(this, currentDate, count);
            cell.dayIndex = dayIndex;
            cell.index = count;
            cell.parent = this;
            cell.date = new Date(currentDate.getTime());
            this.addSubview(cell);

            currentDate.setDate(currentDate.getDate() + 1);
            count++;
        }

        this.layout();
    }

    layout()
    {
        //super.layout();

        if (this.startDate == null || this.endDate == null)
            return;

        var numberOfDays = 7;
        var offsetX = 2;

        var y = 0;
        var x = offsetX;
        var w = this.layer.clientWidth - (9 * numberOfDays);
        w = w / numberOfDays;

        var posXArray = [];
        for (var count = 0; count < numberOfDays; count++)
        {
            posXArray.push(x);
            x += w + 9;
        }

        x = offsetX;

        var dayCount = 0;
        var currentDate = new Date(this.startDate.getTime());
        var currentMonth = this.startDate.getMonth();
        var dayIndex = 0;
        var dayCount = 0;
        var headerCount = 0;

        var v = null;
        var lastDayIndex = 0;

        for (var count = 0; count < this.subviews.length; count++)
        {
            v = this.subviews[count];
            if (!(v instanceof MIOCalendarCell))
            {
                // Header
                if (lastDayIndex != 0)
                {
                    y += w + 9;
                }

                v.setX(0);
                v.setWidth(this.getWidth());
                v.setY(y);
                y += 30 + 9;
            }
            else
            {
                // Cell
                x = posXArray[v.dayIndex];
                if (v.dayIndex == 0)
                {
                    y += w + 9;
                }
                v.setFrame(x, y, w, w);
                lastDayIndex = v.dayIndex;
            }
        }
    }
}

function MIOCalendarGetStringFromDate(date)
{
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd  = date.getDate().toString();

    var d = yyyy + "-" + (mm[1]?mm:"0" + mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]); // padding

    return d;
}

function MIOCalendarGetDayRowFromDate(date)
{
    // Transform to start on Monday instead of Sunday
    // 0 - Mon, 1 - Tue, 2 - Wed, 3 - Thu, 4 - Fri, 5 - Sat, 6 - Sun
    var row = date.getDay();
    if (row == 0)
        row = 6;
    else
        row--;

    return row;
}
