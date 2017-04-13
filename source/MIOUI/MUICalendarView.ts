/**
 * Created by godshadow on 11/3/16.
 */

/// <reference path="MUIView.ts" />
/// <reference path="MUILabel.ts" />

function _MIOCCoreLoadTextFile(href) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", href, false);
    xmlhttp.send();
    var response = xmlhttp.responseText;
    return response;
}

function _MIOLayerFromResource(url, css, elementID) {
    var htmlString = _MIOCCoreLoadTextFile(url);
    var parser = new DOMParser();
    var html = parser.parseFromString(htmlString, "text/html");
    //var styles = html.styleSheets;
    //if (css != null)
    //MIOCoreLoadStyle(css);
    return (html.getElementById(elementID));
}


class MUICalendarCell extends MUIView
{
    date = null;

    initWithLayer(layer, options?)
    {
        super.initWithLayer(layer, options);

        var instance = this;
        this.layer.onclick = function()
        {
            if (instance.parent.delegate != null)
                instance.parent.delegate.cellDidSelectedForCalendar.call(instance.parent, instance.date);
        }
    }
}

class MUICalendarDayView extends MUIView
{
    weekRow:number;

    private _date:Date = null;
    get date():Date {return this._date;}

    private _day = null;
    private _month = null;
    private _year = null;
    
    private _titleLabel = null;

    initWithDate(date:Date)
    {
        super.init();

        this._date = new Date(date.getTime());

        this._day = date.getDate();
        this._month = date.getMonth();
        this._year = date.getFullYear();

        this._titleLabel = new MUILabel();
        this._titleLabel.init();
        this._titleLabel.text = date.getDate();
        this.addSubview(this._titleLabel);
    }

    layout()
    {
        this._titleLabel.setFrame(MIOFrame.frameWithRect(0, 0, this.frame.size.width, this.frame.size.height));
    }       
}

class MUICalendarMonthView extends MUIView
{
    private _month = null;
    private _year = null;

    private _hearder = null;
    private _dayViews = [];

    private _weekRows = 0;
    
    initWithMonth(month, year)
    {
        super.init();

        this._month = month < 0 ? 11 : month;
        this._year = month < 0 ? year - 1 : year;

        this._setupHeader();
        this._setupDays();
    }

    setMonth(month, year)
    {
        this._month = month < 0 ? 11 : month;
        this._year = month < 0 ? year - 1 : year;
        
        this._hearder.text = MIODateGetStringForMonth(this._month);
    }

    private _setupHeader()
    {
        this._hearder = new MUILabel();
        this._hearder.initWithFrame(MIOFrame.frameWithRect(0, 0, 100, 20));        
        this.addSubview(this._hearder);
    }

    private _setupDays()
    {
        var lastDate = new Date(this._year, this._month + 1, 0);
        var currentDate = new Date(this._year, this._month, 1);
        
        var rowIndex = MIOCalendarGetDayRowFromDate(currentDate) == 0 ? -1 : 0;
        
        while(lastDate >= currentDate)
        {
            var dayView = new MUICalendarDayView();
            dayView.initWithDate(currentDate);
            this._dayViews.push(dayView);
            this.addSubview(dayView);

            // Calculate rows
            if (MIOCalendarGetDayRowFromDate(dayView.date) == 0)
                rowIndex++;

            dayView.weekRow = rowIndex;

            currentDate.setDate(currentDate.getDate() + 1);
        }

        this._weekRows = rowIndex + 1;
    }

    layout()
    {
        // Layout header
        this._hearder.setFrame(MIOFrame.frameWithRect(0, 0, this.frame.size.width, 20));

        // Layout days
        var x = 0;
        var y = 21;
        var w = this.frame.size.width / 7;
        var h = (this.getHeight() - y) / this._weekRows;
        // Offset x maping by day index
        var offsetX = [0, w, w * 2, w * 3, w * 4,  w * 5, w * 6];

        for (var index = 0; index < this._dayViews.length; index++)
        {
            var dv = this._dayViews[index];
            
            x = offsetX[MIOCalendarGetDayRowFromDate(dv.date];
            y = 21 + (dv.weekRow * h);

            dv.setFrame(MIOFrame.frameWithRect(x, y, w, h));

            dv.layout();            
        }
    }
}

class MUICalendarView extends MUIScrollView
{
    dataSource = null;
    delegate = null;

    headers = [];
    cells = [];
    cellDates = [];

    public get today() {return this._today;}
    private _today = new Date();
    private _currentMonth = this._today.getMonth();
    
    private _cellPrototypes = {};

    private _views = [];
    private _visibleViews = [];
        
    initWithLayer(layer, owner, options?)
    {
        super.initWithLayer(layer, owner, options);
        
        this.layer.onscroll = function(){

            console.log("Trying to scroll");
        };
    }

    addCellPrototypeWithIdentifier(identifier, classname,  html, css, elementID)
    {
        // var item = {"html" : html, "css" : css, "id" : elementID, "class" : classname};
        // this.cellPrototypes[identifier] = item;
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
        var layer = _MIOLayerFromResource(html, css, elID);
        cell.initWithLayer(layer);

        return cell;
    }

    scrollToDate(date:Date)
    {
        // TODO
    }

    reloadData()
    {
        // Remove all subviews
        for (var index = 0; index < this._views.length; index++)
        {
            var view = this._views[index];
            view.removeFromSuperview();
        }

        this._views = [];

        var currentYear = this.today.getFullYear();
        var currentMonth = this.today.getMonth() - 1;        
        var currentDate = new Date(this.today.getFullYear(), currentMonth, 1);

        for (var index = 0; index < 3; index++)
        {
            var mv = new MUICalendarMonthView();
            mv.initWithMonth(currentMonth + index - 1, currentYear);
            this.addSubview(mv);
            this._views.push(mv);
        }

        return;

        var dayIndex = 0;
        var count = 0;

        while(this.endDate >= currentDate)
        {
            dayIndex = MIOCalendarGetDayRowFromDate(currentDate);

            var month = currentDate.getMonth();
            if (month == 0 && currentMonth > 0)
                currentMonth = -1;
            if (month > currentMonth)
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
                    header = new MUILabel();
                    header.init();
                    header.setHeight(20);
                    header.setText(title);
                }
                else
                {
                    header = new MUIView();
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

        var marginLeft = 2;
        var marginRight = 2;
        var marginTop = 0;
        var marginBotton = 0;

        var y = marginTop;
        var x = marginLeft;
        var w = this.getWidth() - (marginLeft + marginRight);
        var h = this.getHeight() - (marginTop + marginBotton);

        for (var index = 0; index < this._views.length; index++)
        {
            var mv = this._views[index];
            mv.setFrame(MIOFrame.frameWithRect(x, y, w, h));
            mv.layout();

            y += h;
        }        

        this.layer.scrollTop = this.getHeight();

        return;

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
            if (!(v instanceof MUICalendarCell))
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
                v.setFrame(MIOFrame.frameWithRect(x, y, w, w));
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
