import { MIOObject } from "../MIOFoundation";

class MIORemoteNotificationServer extends MIOObject
{
    private static _sharedInstance:MIORemoteNotificationServer = new MIORemoteNotificationServer();    
    
    init(){
        if (MIORemoteNotificationServer._sharedInstance == null){
            throw new Error("MIORemoteMessageCenter: Instantiation failed. Use defaultCenter() instead of new.");
        }
        
        MIORemoteNotificationServer._sharedInstance = this;        
    }

    public static sharedInstance():MIORemoteNotificationServer {
        return MIORemoteNotificationServer._sharedInstance;
    }

    private observers = [];
    addObserver(observer, name:string, context?){

    }

}