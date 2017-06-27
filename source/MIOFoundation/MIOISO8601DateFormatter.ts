
/// <reference path="MIODateFormatter.ts" />


class MIOISO8601DateFormatter extends MIODateFormatter {

    timeZone = null;

    dateFromString(str:string):Date {

        if (str == null) return null; 
        var d = new Date(str);
        if (d == null) 
            console.log("DATE FORMATTER: Error, invalid date");

        return d;
    }

    stringFromDate(date:Date):string {

        if (date == null) return null;

        var dd = date.getDate().toString();
        var mm = (date.getMonth() + 1).toString();
        var yy = date.getFullYear().toString();        

        return yy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]);
    }

}
