import { MIOObject } from "./MIOObject";

export class MIOFormatter extends MIOObject {

    stringForObjectValue(value):string {
        return value;
    }

    getObjectValueForString(str:string) : any {

    }

    editingStringForObjectValue(value) {

    }

    isPartialStringValid(str:string):[boolean, string]{

        var newStr = "";
        
        return [false, newStr];
    }
}