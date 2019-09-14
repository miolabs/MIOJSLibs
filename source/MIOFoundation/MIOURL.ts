import { MIOObject } from "./MIOObject";

export enum MIOURLTokenType
{
    Protocol,
    Host,
    Path,
    Param,
    Value
}

export class MIOURL extends MIOObject
{    
    baseURL:MIOURL = null;
    absoluteString:string = null;

    scheme:string = null;
    user:string = null;
    password = null;
    host:string = null;
    port:string = null;
    hostname:string = null;
    path:string = "/";
    file:string = null;
    pathExtension:string = null;
    
    params = [];

    public static urlWithString(urlString:string):MIOURL{
        let url = new MIOURL();
        url.initWithURLString(urlString);

        return url;
    }

    initWithScheme(scheme:string, host:string, path:string){
        super.init();
        this.scheme = scheme;
        this.host = host;
        this.path = path;

        this.absoluteString = "";
        if (scheme.length > 0) this.absoluteString += scheme + "://";
        if (host.length > 0) this.absoluteString += host + "/";
        if (path.length > 0) this.absoluteString += path;                
    }

    initWithURLString(urlString:string){
        super.init();
        this.absoluteString = urlString;
        
        let regex = /^(.*):\/\/([A-Za-z0-9\-\.]+)(:([0-9]+))?(.*)/gm;
        let matches = regex.exec(urlString);

        if (matches == null) return;

        this.scheme = matches[1];
        this.host = matches[2];        
        this.port = matches[4];
        this.hostname = matches[3] != null ? this.host + matches[3] : this.host;
        this.path = matches[5];
    }

    public urlByAppendingPathComponent(path:string):MIOURL{                
        let urlString = this.scheme + "://" + this.hostname + this.path;
        
        if (urlString.charAt(urlString.length - 1) != "/")
            urlString += "/";

        if (path.charAt(0) != "/")
            urlString += path;
        else
            urlString += path.substr(1);

        let newURL = MIOURL.urlWithString(urlString);
        return newURL;
    }

    public standardizedURL():MIOURL{
        return null;
    }

}