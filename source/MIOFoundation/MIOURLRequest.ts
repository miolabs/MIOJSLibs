import { MIOObject } from "./MIOObject";
import { MIOURL } from "./MIOURL";

export class MIOURLRequest extends MIOObject
{
    url:MIOURL = null;
    httpMethod:string = "GET";
    httpBody = null;
    headers = [];
    binary = false;
    download = false;

    static requestWithURL(url:MIOURL):MIOURLRequest
    {
        var request = new MIOURLRequest();
        request.initWithURL(url);

        return request;
    }

    initWithURL(url:MIOURL)
    {
        this.url = url;
    }

    setHeaderField(field, value)
    {
        this.headers.push({"Field" : field, "Value" : value});
    }
}
