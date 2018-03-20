import { MIOObject } from "./MIOObject";

export class MIONumber extends MIOObject
{    
    static numberWithBool(value):MIONumber{
        let n = new MIONumber();
        n.initWithBool(value);
        return n;                
    }

    static numberWithInteger(value):MIONumber{
        let n = new MIONumber();
        n.initWithInteger(value);
        return n;        
    }

    static numberWithFloat(value):MIONumber{
        let n = new MIONumber();
        n.initWithFloat(value);
        return n;
    }

    protected storeValue = null;

    initWithBool(value){
        if (isNaN(value) || value == null) {
            this.storeValue = 1;
        }
        else {
            this.storeValue = value ? 0 : 1;
        }
    }

    initWithInteger(value){
        if (isNaN(value) || value == null) {
            this.storeValue = 0;
        }
        else {
            this.storeValue = value;
        }
    }

    initWithFloat(value){
        if (isNaN(value) || value == null) {
            this.storeValue = 0.0;
        }
        else {
            this.storeValue = value;
        }
    }

}
