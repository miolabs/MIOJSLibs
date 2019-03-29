import { MIOCoder } from "./MIOCoder";
import { MIOError } from "./MIOError";
import { MIOPropertyListSerialization } from "./MIOPropertyListSerialization";
import { MIOClassFromString } from "../MIOCore/platform/Web/MIOCore_Web";


export class MIOKeyedUnarchiver extends MIOCoder
{
    static unarchiveTopLevelObjectWithData(data:string){
        let coder = new MIOKeyedUnarchiver();
        coder.init();

        return coder._parseData(data, null);
    }

    private objects = null;
    _parseData(data:string, error){
        let items = MIOPropertyListSerialization.propertyListWithData(data, 0, 0, null);

        this.objects = items["$objects"];
        let rootIndex = items["$top"]["$0"]["CF$UID"];

        let rootInfo = this.objects[rootIndex];
        let obj = this.createObjectFromInfo(rootInfo);

        return obj;
    }

    private classFromInfo(info){
        let name = info["$classname"];
        if (name == null) {
            let index = info["$class"]["CF$UID"];            
            let objInfo = this.objects[index];
            name = this.classFromInfo(objInfo);
        }

        return name;
    }
    private createObjectFromInfo(info){
        let classname = this.classFromInfo(info);                

        switch (classname){
            case "NSMutableArray":
            case "NSArray":
            return this.createArray(info);            

            case "NSMutableDictionary":
            case "NSDictionary":
            return this.createDictionary(info);

            default:                        
            return this.createObject(classname, info);
        }

        
    }

    private currentInfo = null;
    private createObject(classname, info){
        let obj = MIOClassFromString(classname);
        this.currentInfo = info;
        obj.initWithCoder(this);
        this.currentInfo = null;

        return obj;
    }

    decodeObjectForKey(key:string){        
        let obj = this.valueFromInfo(this.currentInfo[key]);                                    
        return obj;
    }

    private createArray(info){
        let objects = info["NS.objects"];
        let array = [];
        for (let index = 0; index < objects.length; index++){
            let value = this.valueFromInfo(objects[index]);                                    
            array.push(value);
        }

        return array;
    }
    
    private createDictionary(info){
        let keys = info["NS.keys"];
        let objects = info["NS.objects"];

        let dict = {};
        for (let index = 0; index < keys.length; index++){
            let k = this.valueFromInfo(keys[index]);
            let v = this.valueFromInfo(objects[index]); 
            dict[k] = v;           
        }

        return dict;
    }

    private valueFromInfo(info){
        let index = info["CF$UID"];
        let value = this.objects[index];

        if (typeof value === "boolean") return value;
        if (typeof value === "number") return value;
        if (typeof value === "string" && value != "$null") return value;
        if (typeof value === "string" && value == "$null") return null;
        
        //TODO: Check for date

        return this.createObjectFromInfo(value);
    }

}