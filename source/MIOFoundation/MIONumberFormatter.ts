import { MIOFormatter } from "./MIOFormatter";
import { MIOLocale } from "./MIOLocale";

export enum MIONumberFormatterStyle {
    NoStyle,
    DecimalStyle,
    CurrencyStyle,
    PercentStyle
}

export enum _MIONumberFormatterType {
    
    Int,
    Decimal
}

export class MIONumberFormatter extends MIOFormatter {

    numberStyle = MIONumberFormatterStyle.NoStyle;
    locale = null;
    minimumFractionDigits = 0;
    maximumFractionDigits = 0;
    groupingSeparator = null;
    currencySymbol = null;

    init(){
        super.init();
        this.locale = MIOLocale.currentLocale();

        this.groupingSeparator = this.locale.groupingSeparator;
        this.currencySymbol = this.locale.currencySymbol;
    }

    numberFromString(str:string){

        if(str === null) return null;
        
        let result, parseString, numberString, type;
        [result, parseString, numberString, type] = this._parse(str);
        
        if (result == true) {
            let value = null;    
            if (type == _MIONumberFormatterType.Int){
                value =  parseInt(numberString);
            }
            else if (type == _MIONumberFormatterType.Decimal){
                value = parseFloat(numberString);
            }
            
            return isNaN(value) ? null : value;
        }

        return null;
    }

    stringFromNumber(number:number):string{
        return this.stringForObjectValue(number);
    }

    stringForObjectValue(value):string {
        
        let number = value as number;
        if(!number) number = 0;
        let str = number.toString();
        let intValue = null;
        let floatValue = null;
        let array = str.split(".");
        if (array.length == 1) {
            // Only int
            intValue = array[0];
        }
        else if (array.length == 2) {
            intValue = array[0];
            floatValue = array[1];
        }
        
        let res = "";
        let minusOffset = intValue.charAt(0) == "-" ? 1 : 0;
    
        if (intValue.length > (3 + minusOffset)) {

            let offset = Math.floor((intValue.length - minusOffset) / 3);
            if (((intValue.length - minusOffset) % 3) == 0)
                offset--;
            let posArray = [];
            let intLen = intValue.length;
            for (let index = offset; index > 0; index--){
                posArray.push(intLen - (index * 3));
            }

            let posArrayIndex = 0;
            let groupPos = posArray[0];
            for (let index = 0; index < intLen; index++)
            {
                if (index == groupPos) {
                    res += this.groupingSeparator;
                    posArrayIndex++;                    
                    groupPos = posArrayIndex < posArray.length ? posArray[posArrayIndex] : -1;
                }
                let ch = intValue[index];
                res += ch;
            }                        
        }
        else {
            res = intValue;
        }

        if (this.minimumFractionDigits > 0 && floatValue == null)
            floatValue = "";

        if (floatValue != null){            
            res += this.locale.decimalSeparator;
        
            if (this.minimumFractionDigits > 0 && floatValue.length < this.minimumFractionDigits){
                for (let index = 0; index < this.minimumFractionDigits; index++){
                    if (index < floatValue.length)
                    res += floatValue[index];
                else 
                    res += "0";
                }    
            }
            else if (this.maximumFractionDigits > 0 && floatValue.length > this.maximumFractionDigits){
                floatValue = floatValue.substring(0, this.maximumFractionDigits);
            }
            else {
                res += floatValue;
            }
        }
        
        if (this.numberStyle == MIONumberFormatterStyle.PercentStyle) res += "%";
        if (this.numberStyle == MIONumberFormatterStyle.CurrencyStyle) res += " " + this.currencySymbol;        

        return res;
    }

    isPartialStringValid(str:string):[boolean, string]{

        if (str.length == 0) return [true, str];

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
        var percentSymbol = false;

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
            else if (ch == "%"
                     && this.numberStyle == MIONumberFormatterStyle.PercentStyle
                     && percentSymbol == false){
                
                percentSymbol = true;
                parseString += ch;                
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