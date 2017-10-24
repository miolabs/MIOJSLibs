/**
 * Created by godshadow on 11/3/16.
 */

enum MIODateFirstWeekDay{
    Sunday,
    Monday
}

var _MIODateFirstWeekDay = MIODateFirstWeekDay.Monday;
var _MIODateStringDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var _MIODateStringMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function MIODateSetFirstWeekDay(day:MIODateFirstWeekDay){

    _MIODateFirstWeekDay = day;
    if (day == MIODateFirstWeekDay.Sunday)
        _MIODateStringDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    else
        _MIODateStringDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
}

function MIODateGetStringForMonth(month)
{
    return _MIODateStringMonths[month];
}

function MIODateGetStringForDay(day:number)
{
    return _MIODateStringDays[day];
}

function MIODateGetDayFromDate(date) 
{
    if (_MIODateFirstWeekDay == MIODateFirstWeekDay.Sunday) return date.getDay();    

    // Transform to start on Monday instead of Sunday
    // 0 - Mon, 1 - Tue, 2 - Wed, 3 - Thu, 4 - Fri, 5 - Sat, 6 - Sun
    var day = date.getDay();
    if (day == 0)
        day = 6;
    else
        day--;

    return day;
}

function MIODateGetDayStringFromDate(date) 
{
    var day = MIODateGetDayFromDate(date);
    return MIODateGetStringForDay(day);
}

function MIODateGetString(date)
{
    var d = MIODateGetDateString(date);
    var t = MIODateGetTimeString(date);

    return d + " " + t;
}

function MIODateGetDateString(date)
{
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = date.getDate().toString();
    return yyyy + "-" +(mm[1]?mm:"0"+mm[0]) + "-" +  (dd[1]?dd:"0"+dd[0]); // padding
}

function MIODateGetTimeString(date)
{
    var hh = date.getHours().toString();
    var mm = date.getMinutes().toString();
    return (hh[1]?hh:"0"+hh[0]) + ":" + (mm[1]?mm:"0"+mm[0]);
}

function MIODateGetUTCString(date)
{
    var d = MIODateGetUTCDateString(date);
    var t = MIODateGetUTCTimeString(date);

    return d + " " + t;
}

function MIODateGetUTCDateString(date)
{
    var yyyy = date.getUTCFullYear().toString();
    var mm = (date.getUTCMonth()+1).toString(); // getMonth() is zero-based
    var dd  = date.getUTCDate().toString();
    return yyyy + "-" +(mm[1]?mm:"0"+mm[0]) + "-" +  (dd[1]?dd:"0"+dd[0]); // padding
}

function MIODateGetUTCTimeString(date)
{
    var hh = date.getUTCHours().toString();
    var mm = date.getUTCMinutes().toString();
    var ss = date.getUTCSeconds().toString();
    return (hh[1]?hh:"0" + hh[0]) + ":" + (mm[1]?mm:"0" + mm[0]) + ":" + (ss[1]?ss:"0" + ss[0]);
}

function MIODateFromString(string)
{
    var d = new Date(Date.parse(string));
    return d;
}

function MIODateAddDaysToDateString(dateString, days)
{
    var d = MIODateFromString(dateString);
    d.setDate(d.getDate() + parseInt(days));
    var ds = MIODateGetDateString(d);

    return ds;
}

function MIODateRemoveDaysToDateString(dateString, days)
{
    var d = MIODateFromString(dateString);
    d.setDate(d.getDate() - parseInt(days));
    var ds = MIODateGetDateString(d);

    return ds;
}


function MIODateFromMiliseconds(miliseconds){
  var mEpoch = parseInt(miliseconds); 
  if(mEpoch<10000000000) mEpoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
  var ds = new Date();
  ds.setTime(mEpoch)
  return ds;
}

function isDate (x) 
{ 
  return (null != x) && !isNaN(x) && ("undefined" !== typeof x.getDate); 
}

function MIODateToday(){
    return new Date();
}

function MIODateYesterday(){
    let d = new Date();
    d.setDate(d.getDate() - 1);
    return d;

}