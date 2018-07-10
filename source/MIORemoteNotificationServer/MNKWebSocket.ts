import { MIOObject, MIOURL } from "../MIOFoundation";

export interface MNKWebSocketDelegate {
    webSocketDidOpenConnection?(webSocket:MNKWebSocket);
    webSocketDidCloseConnection?(webSocket:MNKWebSocket);
    webSocketDidFailConnection?(webSocket:MNKWebSocket);

    webSocketDidReceiveMessage?(webSocket:MNKWebSocket, message:string);
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
        
        this.webSocket.onopen = function(ev){
            instance.openCallback(ev);
        };

        this.webSocket.onclose = function(ev){
            instance.closeCallback(ev);
        };

        this.webSocket.onerror = function(ev){
            instance.errorCallback(ev);
        }

        this.webSocket.onmessage = function(ev){
            instance.readCallback(ev);
        }

    }

    send(data){
        this.webSocket.send(data);
    }

    private openCallback(ev:Event){
        if (this.delegate != null && typeof this.delegate.webSocketDidOpenConnection === "function") {
            this.delegate.webSocketDidOpenConnection(this);
        }
    }

    private closeCallback(ev:Event){
        if (this.delegate != null && typeof this.delegate.webSocketDidCloseConnection === "function") {
            this.delegate.webSocketDidCloseConnection(this);
        }
    }

    private errorCallback(ev:Event){
        if (this.delegate != null && typeof this.delegate.webSocketDidFailConnection === "function") {
            this.delegate.webSocketDidFailConnection(this);
        }
    }

    private readCallback(ev){
        let msg = JSON.parse(ev.data.replace(/(\r\n|\n|\r)/gm, ""));
        if (this.delegate != null && typeof this.delegate.webSocketDidReceiveMessage === "function") {
            this.delegate.webSocketDidReceiveMessage(this, msg);
        }
    }

}