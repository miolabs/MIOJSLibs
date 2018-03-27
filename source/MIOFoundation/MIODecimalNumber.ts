import { MIONumber } from "./MIONumber";
import { Decimal } from 'decimal.js';

export class MIODecimalNumber extends MIONumber
{
    static decimalNumberWithString(str:string):MIODecimalNumber{
        let dn = new MIODecimalNumber();
        dn.initWithString(str);
        return dn;
    }

    static one ():MIODecimalNumber {
        return MIODecimalNumber.numberWithInteger(1);
    }

    static zero():MIODecimalNumber {
        return MIODecimalNumber.numberWithInteger(0);
    }

    // static subclasses from mionumber
    static numberWithBool(value):MIODecimalNumber{
        let n = new MIODecimalNumber();
        n._initWithValue(value);
        return n;                
    }

    static numberWithInteger(value):MIODecimalNumber{
        let n = new MIODecimalNumber();
        n._initWithValue(value);
        return n;        
    }

    static numberWithFloat(value):MIODecimalNumber{
        let n = new MIODecimalNumber();
        n._initWithValue(value);
        return n;
    }
    
    initWithString(str:string){
        this._initWithValue(str);
    }

    initWithDecimal(value){
        super.init();
        if (isNaN(value) || value == null) {
            this.storeValue = new Decimal(0);
        }
        else {
            this.storeValue = value;
        }
    }

    _initWithValue(value){
        super.init();
        this.storeValue = new Decimal(value||0);
    }

    decimalNumberByAdding(value:MIODecimalNumber){
        let dv = new MIODecimalNumber();
        dv.initWithDecimal(this.storeValue.add(value.storeValue));
        return dv;
    }

    decimalNumberBySubtracting(value:MIODecimalNumber){
        let dv = new MIODecimalNumber();
        dv.initWithDecimal(this.storeValue.sub(value.storeValue));
        return dv;        
    }

    decimalNumberByMultiplyingBy(value:MIODecimalNumber){
        let dv = new MIODecimalNumber();
        dv.initWithDecimal(this.storeValue.mul(value.storeValue));
        return dv;        
    }

    decimalNumberByDividingBy(value:MIODecimalNumber){
        let dv = new MIODecimalNumber();
        dv.initWithDecimal(this.storeValue.div(value.storeValue));
        return dv;        
    }

    get decimalValue(){
        return this.storeValue.toNumber();
    }

    get floatValue(){
        return this.storeValue.toNumber();
    }
}