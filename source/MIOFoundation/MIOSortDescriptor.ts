import { MIOObject } from "./MIOObject";


/**
 * Created by godshadow on 28/09/2016.
 */

export class MIOSortDescriptor extends MIOObject
{
    key = null;
    ascending = false;

    public static sortDescriptorWithKey(key, ascending)
    {
        var sd = new MIOSortDescriptor();
        sd.initWithKey(key, ascending);
        return sd;
    }

    initWithKey(key, ascending)
    {
        this.key = key;
        this.ascending = ascending;
    }
}

//
// For internal purposes: Don't use it, could change
//

export function _MIOSortDescriptorSortObjects(objs, sortDescriptors)
{
    let resultObjects = null;
    
    if (objs.length == 0 || sortDescriptors == null) {
        resultObjects = objs.slice(0);        
    } 
    else {    
    
        if (sortDescriptors == null) return objs;
        if (objs.length == 0) return objs;

        resultObjects = objs.sort(function(a, b){

            return _MIOSortDescriptorSortObjects2(a, b, sortDescriptors, 0);
            //return instance._MIOSortDescriptorSortObjects2(a, b, sortDescriptors, 0);
        });
    }

    return resultObjects;
}

function _MIOSortDescriptorSortObjects2(a, b, sortDescriptors, index)
{
    if (index >= sortDescriptors.length)
        return 0;

    let sd = sortDescriptors[index];
    let key = sd.key;

    let lv = a[key];
    let rv = b[key];

    if (typeof lv === "string"){
        lv = lv.toLocaleLowerCase();
    }

    if (typeof rv === "string"){
        rv = rv.toLocaleLowerCase();
    }

    if (lv == rv) {

        if (lv == rv){
            return _MIOSortDescriptorSortObjects2(a, b, sortDescriptors, ++index);            
        }
        else if (lv < rv)
            return sd.ascending ? -1 : 1;
        else
            return sd.ascending ? 1 : -1;
    }
    else if (lv < rv)
        return sd.ascending ? -1 : 1;
    else
        return sd.ascending ? 1 : -1;

}
