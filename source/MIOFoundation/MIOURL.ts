
/// <reference path="MIOObject.ts" />

enum MIOURLTokenType
{
    Protocol,
    Host,
    Path,
    Param,
    Value
}

class MIOURL extends MIOObject
{    
    baseURL:MIOURL = null;
    absoluteString:string = null;

    scheme:string = null;
    user:string = null;
    password = null;
    host:string = null;
    port:number = 0;
    hostname:string = null;
    path:string = "/";
    file:string = null;
    pathExtension:string = null;
    
    params = [];

    public static urlWithString(urlString:string):MIOURL
    {
        var url = new MIOURL();
        url.initWithURLString(urlString);

        return url;
    }

    initWithURLString(urlString:string)
    {
        this.absoluteString = urlString;
        this._parseURLString(urlString);
    }

    private _parseURLString(urlString:string)
    {    
        var param = "";
        var value = "";

        var token = "";
        var step = MIOURLTokenType.Protocol;

        var foundPort = false;
        var foundExt = false;        

        for (var index = 0; index < urlString.length; index++)
        {
            var ch = urlString.charAt(index);

            if (ch == ":")
            {
                if (step == MIOURLTokenType.Protocol)
                {
                    this.scheme = token;
                    token = "";
                    index += 2; //Igonring the double slash // from the protocol (http://)
                    step = MIOURLTokenType.Host;
                }
                else if (step == MIOURLTokenType.Host)
                {
                    this.hostname = token;
                    token = "";
                    foundPort = true;
                }
            }
            else if (ch == "/")
            {
                if (step == MIOURLTokenType.Host)
                {
                    if (foundPort == true)
                    {
                        this.host = this.hostname + ":" + token;
                        this.port = parseInt(token);                        
                    }
                    else 
                    {
                        this.host = token;
                        this.hostname = token;
                    }
                    step = MIOURLTokenType.Path;                    
                }
                else
                { 
                    this.path += token + ch;                    
                }

                token = "";                    
            }
            else if (ch == "." && step == MIOURLTokenType.Path)
            {
                this.file = token;
                foundExt = true;
                token = "";
            }
            else if (ch == "?")
            {
                if (foundExt == true)
                {
                    this.file += "." + token;
                    this.pathExtension = token;
                }
                else 
                    this.file = token;

                token = "";
                step = MIOURLTokenType.Param;
            }
            else if (ch == "&")
            {
                var item = {"Key" : param, "Value":value};
                this.params.push(item);
                step = MIOURLTokenType.Param;
                param = "";
                value = "";
            }
            else if (ch == "=")
            {
                param = token;
                step = MIOURLTokenType.Value;
                token = "";
            }
            else
            {
                token += ch;
            }
        }

        if (token.length > 0)
        {
            if (step == MIOURLTokenType.Path)
            {
                if (foundExt == true)
                {
                    this.file += "." + token;
                    this.pathExtension = token;
                }
                else
                    this.path += token;
            }
            else if (step == MIOURLTokenType.Param)
            {
                var i = {"key" : token};
                this.params.push(i);
            }
            else if (step == MIOURLTokenType.Value)
            {
                var item = {"Key" : param, "Value" : token};
                this.params.push(item);                
            }
        }
    }    

    public urlByAppendingPathComponent(path:string):MIOURL
    {                
        var urlString = this.scheme + "://" + this.host + this.path;
        
        if (path.charAt(0) != "/")
            urlString += path;
        else
            urlString += path.substr(1);

        var newURL = MIOURL.urlWithString(urlString);
        return newURL;
    }

    public standardizedURL():MIOURL
    {
        return null;
    }

}