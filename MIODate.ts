/**
 * Created by godshadow on 11/3/16.
 */

function MIODateGetStringForMonth(month)
{
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Dicember"];
    return months[month];
}

function MIODateGetStringForDay(day)
{
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[day];
}

function MIODateGetString(date)
{
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = date.getDate().toString();
    return yyyy + "-" +(mm[1]?mm:"0"+mm[0]) + "-" +  (dd[1]?dd:"0"+dd[0]); // padding
}

function MIODateGetStringForHour(date)
{
    var hh = date.getHours().toString();
    var mm = date.getMinutes().toString();
    return (hh[1]?hh:"0"+hh[0]) + ":" + (mm[1]?mm:"0"+mm[0]);
}

function MIODateGetUTCString(date)
{
    var yyyy = date.getUTCFullYear().toString();
    var mm = (date.getUTCMonth()+1).toString(); // getMonth() is zero-based
    var dd  = date.getUTCDate().toString();
    return yyyy + "-" +(mm[1]?mm:"0"+mm[0]) + "-" +  (dd[1]?dd:"0"+dd[0]); // padding
}

function MIODateGetUTCStringForHour(date)
{
    var hh = date.getUTCHours().toString();
    var mm = date.getUTCMinutes().toString();
    return (hh[1]?hh:"0"+hh[0]) + ":" + (mm[1]?mm:"0"+mm[0]);
}

