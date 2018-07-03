import { MIOObject, MIOLog } from "../MIOFoundation";
import { MNKWebSocket } from "./MNKWebSocket";

export class MIORemoteNotificationServer extends MIOObject
{
    private static _sharedInstance:MIORemoteNotificationServer = null;    
    
    init(){        
        if (MIORemoteNotificationServer._sharedInstance != null){
            throw new Error("MIORemoteMessageCenter: Instantiation failed. Use sharedInstance() instead of new.");
        }
        super.init();
        this.login();
    }

    public static sharedInstance():MIORemoteNotificationServer {
        if (MIORemoteNotificationServer._sharedInstance != null) {
            return MIORemoteNotificationServer._sharedInstance;
        }

        let instance = new MIORemoteNotificationServer();
        instance.init();
        
        MIORemoteNotificationServer._sharedInstance = instance;
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
        let params = {
            "deviceID": "1529058013587268",
            "messageType": "openConnection",
            "userData": {
                "username": "admin@dual-link.com",
                "password": "123123"
            }
        }
        
    }

    webSocketDidCloseConnection(webSocket:MNKWebSocket){
        MIOLog("Conenction Close");
    }

    webSocketDidFailConnection(webSocket:MNKWebSocket){
        MIOLog("Conenction FAIL");
    }


    private observers = [];
    addObserver(observer, name:string, userInfo?){

    }

    postNotification(name:string, userInfo?){

    }

    sendRequest(name:string, target?, completion?){

    }

}


