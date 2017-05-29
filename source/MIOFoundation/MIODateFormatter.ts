
/// <reference path="MIOFormatter.ts" />

enum MIODateFormatterStyle {
    NoStyle,
    ShortStyle,
    MediumStyle,
    LongStyle,
    FullStyle
}

class MIODateFormatter extends MIOFormatter {

    dateStyle = MIODateFormatterStyle.ShortStyle;
    timeStyle = MIODateFormatterStyle.ShortStyle;    

    dateFromString(str:string):Date {

        return null;
    }

    stringFromDate(date:Date):string {

        return null;
    }

    isPartialStringValid(str:string):[boolean, string]{

        // Check dd-mm-yy or dd-mm-yyyy

        var newStr = "";
        
        return [true, newStr];
    }
}