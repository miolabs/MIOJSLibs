import { MIOObject } from "./MIOObject";

/**
 * Created by godshadow on 28/09/2016.
 */

export class MIOSortDescriptor extends MIOObject
{
    key:string;
    ascending = false;

    public static sortDescriptorWithKey(key:string, ascending:boolean)
    {
        let sd = new MIOSortDescriptor();
        sd.initWithKey(key, ascending);
        return sd;
    }

    initWithKey(key:string, ascending:boolean)
    {
        this.key = key;
        this.ascending = ascending;
    }
}

//
// For internal purposes: Don't use it, could change
//

export function _MIOSortDescriptorSortObjects( objs:any, sortDescriptors:MIOSortDescriptor[] ) : any[]
{
    let resultObjects:any[];
    
    if (objs.length == 0 || sortDescriptors == null) {
        resultObjects = objs.slice(0);        
    } 
    else {    
    
        if (sortDescriptors == null) return objs;
        if (objs.length == 0) return objs;

        resultObjects = objs.sort(function(a:any, b:any){

            return _MIOSortDescriptorSortObjects2(a, b, sortDescriptors, 0);
            //return instance._MIOSortDescriptorSortObjects2(a, b, sortDescriptors, 0);
        });
    }

    return resultObjects;
}

export function _MIOSortDescriptorSortObjects2(a:any, b:any, sortDescriptors:MIOSortDescriptor[], index:number)
{
    if (index >= sortDescriptors.length) return 0;

    let sd = sortDescriptors[index];
    let key = sd.key;

    let lv = (a instanceof MIOObject) ? a.valueForKeyPath(key) : a[key];
    let rv = (b instanceof MIOObject) ? b.valueForKeyPath(key) : b[key];

    if (typeof lv === "string"){
        lv = lv.toLocaleLowerCase();
    }

    if (typeof rv === "string"){
        rv = rv.toLocaleLowerCase();
    }

    if (typeof lv === "string" && typeof rv === "string" && lv.length != rv.length){
        // Check the length
        let lv2 = lv;
        let rv2 = rv;
        let sortValue = 0;
        if (lv.length > rv.length){
            lv2 = lv.substr(0, rv.length);
            sortValue = sd.ascending ? 1 : -1;
        }
        else if (lv.length < rv.length){
            rv2 = rv.substr(0, lv.length);
            sortValue = sd.ascending ? -1 : 1;
        }

        if (lv2 == rv2)
            return sortValue;
        else if (lv2 < rv2)
            return sd.ascending ? -1 : 1;
        else
            return sd.ascending ? 1 : -1;            
    }
    else if (lv == rv)
        return _MIOSortDescriptorSortObjects2(a, b, sortDescriptors, ++index);
    else if (lv != null && rv != null) {
        if (lv < rv) return sd.ascending ? -1 : 1;
        else return sd.ascending ? 1 : -1;
    }
    else if (lv == null) return sd.ascending ? -1 : 1;    
    else if (rv == null) return sd.ascending ? 1 : -1;

    return 0;
}

