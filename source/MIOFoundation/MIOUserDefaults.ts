/**
 * Created by godshadow on 29/09/2016.
 */

export class MIOUserDefaults
{
    private static _sharedInstance:MIOUserDefaults = new MIOUserDefaults();

    constructor(){
        if (MIOUserDefaults._sharedInstance){
            throw new Error("Error: Instantiation failed: Use standardUserDefaults() instead of new.");
        }
        MIOUserDefaults._sharedInstance = this;
    }

    public static standardUserDefaults():MIOUserDefaults{
        return MIOUserDefaults._sharedInstance;
    }

    setBooleanForKey(key, value:boolean){
        let v = value ? "1" : "0";
        this.setValueForKey(key, v);
    }

    booleanForKey(key){
        let v = this.valueForKey(key);
        return v == "1" ? true : false;
    }

    setValueForKey(key:string, value:any){
        localStorage.setItem(key, value);
    }

    valueForKey(key:string):any{
        return localStorage.getItem(key);
    }

    removeValueForKey(key:string){
        localStorage.removeItem(key);
    }
}