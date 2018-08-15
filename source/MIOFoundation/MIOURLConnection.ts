import { MIOURLRequest } from "./MIOURLRequest";
import { MIOHTTPRequest } from "../MIOCore/platform";

/**
 * Created by godshadow on 14/3/16.
 */

export class MIOURLConnection
{
    request:MIOURLRequest = null;
    delegate = null;
    blockFN = null;
    blockTarget = null;

    private xmlHttpRequest = null;

    initWithRequest(request:MIOURLRequest, delegate){
        this.request = request;
        this.delegate = delegate;
        this.start();
    }

    initWithRequestBlock(request:MIOURLRequest, blockTarget, blockFN){
        this.request = request;
        this.blockFN = blockFN;
        this.blockTarget = blockTarget;
        this.start();
    }

    start(){
        MIOHTTPRequest(this, this.request.url.absoluteString, this.request.headers, this.request.httpMethod, this.request.httpBody, this.request.binary, this.delegate, this.blockTarget, this.blockFN, this.request.download);
    }
}
