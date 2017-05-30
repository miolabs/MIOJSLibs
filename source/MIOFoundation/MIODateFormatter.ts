
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

        var result, value, dateString;
        [result, value, dateString] = this._parse(str);
        if (result == true) {
            return new Date(dateString);
        }

        return null;
    }

    stringFromDate(date:Date):string {

        if (date == null) return null;

        var dd = date.getDate();
        var mm = date.getMonth() + 1;
        var yy = date.getFullYear();        

        return dd + "/" + mm + "/" + yy;
    }

    isPartialStringValid(str:string):[boolean, string]{

        if (str.length == 0) return [true, str];

        var result, newStr;
        [result, newStr] = this._parse(str);                

        return [result, newStr];
    }

    private _parse(str:string):[boolean, string, string]{

        var parseString = "";
        var step = 0;

        var dd = "";
        var mm = "";
        var yy = "";

        // Check dd-mm-yy or dd-mm-yyyy
        for (var index = 0; index < str.length; index++) {
            var ch = str[index];

            if (ch == "-" || ch == "." || ch == "/")
            {
                // Next step
                if (parseString.length == 0) return [false, parseString, ""];
                parseString += "/";
                step++;
            }
            else 
            {
                var result, value;
                
                switch(step) {

                    case 0: //dd
                        [result, dd] = this._parseDay(ch, dd);
                        break;

                    case 1: // mm
                        [result, mm] = this._parseMonth(ch, mm);
                        break;

                    case 2: // yy or yyyy
                        [result, yy] = this._parseYear(ch, yy);
                        break;
                }

                if (result == true)
                    parseString += ch;
                else 
                    return [false, parseString, ""];
            }            
        }

        var dateString = (yy[3]? yy : "20") + yy + "-" + mm + "-" + dd;
        return [true, parseString, dateString];
    }

    private _parseDay(ch, dd):[boolean, string] {

        var c = parseInt(ch);
        if (isNaN(c)) return [false, dd];
        var v = parseInt(dd + ch);
        if (v < 1 || v > 31) return [false, dd];
        return [true, dd + ch];
    }
    
    private _parseMonth(ch, mm):[boolean, string] {

        var c = parseInt(ch);
        if (isNaN(c)) return [false, mm];
        var v = parseInt(mm + ch);
        if (v < 1 || v > 12) return [false, mm];
        return [true, mm + ch];
    }

    private _parseYear(ch, yy):[boolean, string]{

        var c = parseInt(ch);
        if (isNaN(c)) return [false, yy];
        var v = parseInt(yy + ch);
        if (v > 3000) return [false, yy];
        return [true, yy + ch];
    }
}