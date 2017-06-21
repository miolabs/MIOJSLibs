
/// <reference path="../MIOUI/MIOUI.ts" />
/// <reference path="../MIOUIX/MUIXCalendarView.ts" />

class MUIXDatePickerController extends MUIViewController
{
    private calendarView = null;
    
    viewDidLoad(){
        
        this.view.setBackgroundRGBColor(255, 255, 255);

        this.calendarView = new MUIXCalendarView();
        this.calendarView.init();
        this.calendarView.dataSource = this;        
        this.calendarView.delegate = this;        

        this.calendarView.horizontalCellSpacing = 1;
        this.calendarView.verticalCellSpacing = 1;

        this.view.addSubview(this.calendarView);

        this.calendarView.reloadData();
    }

    viewTitleForHeaderAtMonthForCalendar(calendar, currentMonth)
    {
        var title = MIODateGetStringForMonth(currentMonth);
        var header = new MUILabel();
        header.init();
        header.setText(title);
        header.setTextAlignment("center");
        header.setHeight(30);
        header.setTextRGBColor(101, 100, 106);
        header.setBackgroundRGBColor(255, 255, 255);
        header.setFontSize(20);
        header.setFontStyle("bold");
        header.setFontFamily("SourceSansPro-Semibold, Source Sans Pro, sans-serif");

        return header;
    }

    dayCellAtDate(calendar, date)
    {
        var cell = calendar.dequeueReusableDayCellWithIdentifier(null);

//        var title = currentDate.getDate();
//        cell.dayLabel.setText(title);

        //var day = this.fetchedResultsController.objectAtIndexPath(index, 0);
        // var did = MIOCalendarGetStringFromDate(date);
        // var day = this._days[did];
        // cell.setDayOptions(day, date);
/*
        var mainPAX =  parseInt(day["paxMain"]) - parseInt(day["paxMainUsed"]);
        var premiumPAX = parseInt(day["paxPremium"]) - parseInt(day["paxPremiumUsed"]);
        var kitchenPAX = parseInt(day["paxKitchen"]) - parseInt(day["paxKitchenUsed"]);
        cell.mainZoneLabel.setText(mainPAX);
        cell.mainZoneLabel2.setText("/ " + day["paxMain"]);
        cell.premiumZoneLabel.setText(premiumPAX);
        cell.premiumZoneLabel2.setText("/ " + day["paxPremium"]);
        cell.kitchenZoneLabel.setText(kitchenPAX);
        cell.kitchenZoneLabel2.setText( "/ " + day["paxKitchen"]);
*/
        // if (day == null || day.status == "blocked")
        // {
        //     cell.setHeaderColor(255, 200, 200);
        // }
        // else if (day.status == "reserved")
        // {
        //     cell.setHeaderColor(200, 200, 255);
        // }
        // else
        //     cell.setHeaderColor(238, 238, 238);

        return cell;
    }

    // Calendar Delegate methods
    didSelectDayCellAtDate(calendarView, date) {
        
        // var day = this._getDayForDate(date);

        // if (day == null) return;

        // var vc = this.calendarDetailViewController;
        // vc.selectedDay = day;
        // this.navigationController.pushViewController(vc);

        // MUIWebApplication.sharedInstance().delegate.selectedDate = date;

        // MIONotificationCenter.defaultCenter().postNotification("CalendarCellDidSelected", date);

        // calendarView.deselectCellAtDate(date);
    }

     public get preferredContentSize()
    {
        return new MIOSize(320, 320);
    }
}