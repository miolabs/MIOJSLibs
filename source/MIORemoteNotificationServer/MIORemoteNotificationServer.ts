import { MIOObject, MIOLog } from "../MIOFoundation";
import { MNKWebSocket } from "./MNKWebSocket";

export class MIORemoteNotificationServer extends MIOObject
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

    private webSocket:MNKWebSocket = null;
    private webSocketURLString = "ws://dl-rms-dev.eu-central-1.elasticbeanstalk.com";
    private login(){        
        if (this.webSocket == null){
             this.webSocket = MNKWebSocket.webSocketWithURLString(this.webSocketURLString, this);
        }        
    }

    webSocketDidOpenConnection(webSocket:MNKWebSocket){
        MIOLog("Conenction OK");
    }

    private observers = [];
    addObserver(observer, name:string, userInfo?){

    }

    postNotification(name:string, userInfo?){

    }

    sendRequest(name:string, target?, completion?){

    }

}


