import { MIOObject, MIOLog } from "../MIOFoundation";
import { MIOURL } from "../../../../Libs/MIOJSLibs/source/MIOFoundation";

export interface MNKWebSocketDelegate {
    webSocketDidOpenConnection?(webSocket:MNKWebSocket);
    webSocketDidCloseConnection?(webSocket:MNKWebSocket);
}

export class MNKWebSocket extends MIOObject
{
    static webSocketWithURLString(urlString:string, delegate){
        let ws = new MNKWebSocket();
        ws.initWithURL(MIOURL.urlWithString(urlString), delegate);

        return ws;
    }

    private url:MIOURL = null;
    private webSocket:WebSocket = null;
    private delegate = null;
    
    initWithURL(url:MIOURL, delegate){
        this.url = url;
        this.delegate = delegate;

        let instance = this;
        this.webSocket = new WebSocket(url.absoluteString);        
        
        this.webSocket.onopen = function(ev:Event){
            instance.openCallback(ev);
        };

        this.webSocket.onclose = function(ev:Event){
            instance.closeCallback(ev);
        };

    }

    private openCallback(ev:Event){
        if (this.delegate != null && typeof this.delegate.webSocketDidOpen === "function") {
            this.delegate.webSocketDidOpenConnection(this);
        }
    }

    private closeCallback(ev:Event){
        if (this.delegate != null && typeof this.delegate.webSocketDidClose === "function") {
            this.delegate.webSocketDidCloseConnection(this);
        }
    }
}




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


