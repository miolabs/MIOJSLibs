
/// <reference path="MIOFormatter.ts" />

enum MIONumberFormatterStyle {
    NoStyle,
    DecimalStyle,
    CurrencyStyle
}

enum _MIONumberFormatterType {
    
    Int,
    Decimal
}

class MIONumberFormatter extends MIOFormatter {

    numberStyle = MIONumberFormatterStyle.NoStyle;
    locale = null;
    minimumFractionDigits = 0;
    maximumFractionDigits = 0;

    init(){
        super.init();
        this.locale = MIOLocale.currentLocale();
    }

    numberFromString(str:string){

        var result, parseString, numberString, type;
        [result, parseString, numberString, type] = this._parse(str);

        if (result == true) {
            
            if (type == _MIONumberFormatterType.Int)
                return parseInt(numberString);
            else if (type == _MIONumberFormatterType.Decimal)
                return parseFloat(numberString);
        }

        return null;
    }

    stringFromNumber(number:number){

        if(!number) return '0';
        var str = number.toString();
        var intValue = null;
        var floatValue = null;
        var array = str.split(".");
        if (array.length == 1) {
            // Only int
            intValue = array[0];
        }
        else if (array.length == 2) {
            intValue = array[0];
            floatValue = array[1];
        }
        
        var res = intValue;

        if (this.minimumFractionDigits > 0 && floatValue == null)
            floatValue = "";

        if (floatValue != null){            
            res += this.locale.decimalSeparator;
        
            if (this.maximumFractionDigits > 0 && floatValue.length > this.maximumFractionDigits)
                floatValue = floatValue.substring(this.maximumFractionDigits);

            for (var index = 0; index < this.minimumFractionDigits; index++){

                if (index < floatValue.length)
                    res += floatValue[index];
                else 
                    res += "0";
            }
        }
        
        return res;
    }

    isPartialStringValid(str:string):[boolean, string]{

        if (str.length == 0) return [true, str, str];

        var result, newStr;
        [result, newStr] = this._parse(str);

        return [result, newStr];
    }

    private _parse(str:string):[boolean, string, string, _MIONumberFormatterType]{

        var number = 0;
        var parseString = "";
        var numberString = "";
        var type = _MIONumberFormatterType.Int;
        var minusSymbol = false;

        for (var index = 0; index < str.length; index++) {
         
            var ch = str[index];
            if (ch == this.locale.decimalSeparator && type != _MIONumberFormatterType.Decimal){
                parseString += ch;
                numberString += ".";
                type = _MIONumberFormatterType.Decimal;
            }
            else if (ch == "-" && minusSymbol == false) {
                parseString += ch;
                numberString += ch;
                minusSymbol = true;                
            }
            else if (!isNaN(parseInt(ch))) {
                parseString += ch;
                numberString += ch;
            }
            else 
                return [false, parseString, numberString, type];
        }

        return [true, parseString, numberString, type];
    }
}