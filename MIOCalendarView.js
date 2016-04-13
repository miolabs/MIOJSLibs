/**
 * Created by godshadow on 11/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOView.ts" />
function MIOCalendarViewFromElementID(view, elementID) {
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var calendar = new MIOCalendarView();
    calendar.initWithLayer(layer);
    view._linkViewToSubview(calendar);
    return calendar;
}
var MIOCalendarCell = (function (_super) {
    __extends(MIOCalendarCell, _super);
    function MIOCalendarCell() {
        _super.call(this);
        this.date = null;
        this.dayIndex = 0;
        this.index = 0;
        this.parent = null;
    }
    MIOCalendarCell.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setupLayer();
    };
    MIOCalendarCell.prototype.initWithLayer = function (layer) {
        _super.prototype.initWithLayer.call(this, layer);
        this._setupLayer();
    };
    MIOCalendarCell.prototype._setupLayer = function () {
        this.layer.style.position = "absolute";
        var instance = this;
        this.layer.onclick = function () {
            if (instance.parent.delegate != null)
                instance.parent.delegate.cellDidSelectedForCalendar(instance.parent, instance.date, instance.index);
        };
    };
    return MIOCalendarCell;
})(MIOView);
var MIOCalendarView = (function (_super) {
    __extends(MIOCalendarView, _super);
    function MIOCalendarView() {
        _super.call(this);
        this.startDate = null;
        this.endDate = null;
        this.dataSource = null;
        this.delegate = null;
        this.headers = [];
        this.cells = [];
        this.cellDates = [];
        this.cellPrototypes = {};
    }
    MIOCalendarView.prototype.addCellPrototypeWithIdentifier = function (identifier, classname, html, css, elementID) {
        var item = { "html": html, "css": css, "id": elementID, "class": classname };
        this.cellPrototypes[identifier] = item;
    };
    MIOCalendarView.prototype.cellWithIdentifier = function (identifier) {
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
    };
    MIOCalendarView.prototype.reloadData = function () {
        this.startDate = this.dataSource.startDateForCalendar(this);
        this.endDate = this.dataSource.endDateForCalendar(this);
        var currentDate = new Date(this.startDate.getTime());
        var currentMonth = -1;
        this._removeAllSubviews();
        var dayIndex = 0;
        var count = 0;
        while (this.endDate >= currentDate) {
            dayIndex = MIOCalendarGetDayRowFromDate(currentDate);
            if (currentDate.getMonth() > currentMonth) {
                currentMonth = currentDate.getMonth();
                var title = "";
                var header = null;
                if (typeof this.dataSource.viewTitleForHeaderAtMonthForCalendar === "function") {
                    header = this.dataSource.viewTitleForHeaderAtMonthForCalendar(this, currentMonth);
                }
                else if (typeof this.dataSource.titleForHeaderAtMonthForCalendar === "function") {
                    title = this.dataSource.titleForHeaderAtMonthForCalendar(this, currentMonth);
                    header = new MIOLabel();
                    header.init();
                    header.setHeight(20);
                    header.setText(title);
                }
                else {
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
    };
    MIOCalendarView.prototype.layout = function () {
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
        for (var count = 0; count < numberOfDays; count++) {
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
        for (var count = 0; count < this.subviews.length; count++) {
            v = this.subviews[count];
            if (!(v instanceof MIOCalendarCell)) {
                // Header
                if (lastDayIndex != 0) {
                    y += w + 9;
                }
                v.setX(0);
                v.setWidth(this.getWidth());
                v.setY(y);
                y += v.getHeight() + 9;
            }
            else {
                // Cell
                x = posXArray[v.dayIndex];
                if (v.dayIndex == 0) {
                    y += w + 9;
                }
                v.setFrame(x, y, w, w);
                lastDayIndex = v.dayIndex;
            }
        }
    };
    return MIOCalendarView;
})(MIOView);
function MIOCalendarGetStringFromDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = date.getDate().toString();
    var d = yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]); // padding
    return d;
}
function MIOCalendarGetDayRowFromDate(date) {
    // Transform to start on Monday instead of Sunday
    // 0 - Mon, 1 - Tue, 2 - Wed, 3 - Thu, 4 - Fri, 5 - Sat, 6 - Sun
    var row = date.getDay();
    if (row == 0)
        row = 6;
    else
        row--;
    return row;
}
//# sourceMappingURL=MIOCalendarView.js.map