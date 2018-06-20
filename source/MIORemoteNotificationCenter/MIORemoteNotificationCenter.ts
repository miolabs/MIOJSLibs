import { MIOObject } from "../MIOFoundation";

class MIORemoteNotificationCenter extends MIOObject
{
    private static _sharedInstance:MIORemoteNotificationCenter = new MIORemoteNotificationCenter();    
    
    init(){
        if (MIORemoteNotificationCenter._sharedInstance == null){
            throw new Error("MIORemoteMessageCenter: Instantiation failed. Use defaultCenter() instead of new.");
        }
        
        MIORemoteNotificationCenter._sharedInstance = this;        
    }

    public static defaultCenter():MIORemoteNotificationCenter {
        return MIORemoteNotificationCenter._sharedInstance;
    }

    private observers = [];
    addObserver(observer, name:string, context?){

    }

}