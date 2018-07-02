import { MIOObject, MIOURL } from "../MIOFoundation";

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