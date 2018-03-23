import { MUIView } from "./MUIView";
import { MUIButton } from "./MUIButton";

/**
 * Created by godshadow on 11/3/16.
 */

class MIOCalendarHeaderView extends MUIView
{
    private prevButton:MUIButton = null;
    private nextButton:MUIButton = null;

    private monthButton:MUIButton = null;
    private yearButton:MUIButton = null;

    init(){

    }
}

class MIOCalendarMonthView extends MUIView
{

}

class MIOCalendarDayView extends MUIView
{

}

class MIOCalendarView extends MUIView
{
    private header = null;
    private month = null;
}

