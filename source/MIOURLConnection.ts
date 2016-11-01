/**
 * Created by godshadow on 14/3/16.
 */

class MIOURLRequest
{
    url = null;
    httpMethod = "GET";
    body = null;
    headers = [];

    constructor(url)
    {
        this.url = url;
    }

    setHeaderField(field, value)
    {
        this.headers.push({"Field" : field, "Value" : value});
    }
}

class MIOURLConnection
{
    request = null;
    delegate = null;
    blockFN = null;
    blockTarget = null;

    private xmlHttpRequest = null;

    initWithRequest(request, delegate)
    {
        this.request = request;
        this.delegate = delegate;
        this.start();
    }

    initWithRequestBlock(request, blockTarget, blockFN)
    {
        this.request = request;
        this.blockFN = blockFN;
        this.blockTarget = blockTarget;
        this.start();
    }

    start()
    {
        this.xmlHttpRequest = new XMLHttpRequest();

        var instance = this;
        this.xmlHttpRequest.onload = function(){

            if(this.status >= 200 && this.status <= 300)
            {
                // success!
                if (instance.delegate != null)
                    instance.delegate.connectionDidReceiveData(instance, this.responseText);
                else if (instance.blockFN != null)
                    instance.blockFN.call(instance.blockTarget, this.status, this.responseText);
            }
            else
            {
                // something went wrong
                if (instance.delegate != null)
                    instance.delegate.connectionDidFail(instance);
                else if (instance.blockFN != null)
                    instance.blockFN.call(instance.blockTarget, this.status, null);
            }
        };

        this.xmlHttpRequest.open(this.request.httpMethod, this.request.url);

        // Add headers
        for (var count = 0; count < this.request.headers.length; count++)
        {
            var item = this.request.headers[count];
            this.xmlHttpRequest.setRequestHeader(item["Field"], item["Value"]);
        }

        if (this.request.httpMethod == "POST" && this.request.body != null)
            this.xmlHttpRequest.send(this.request.body);
        else
            this.xmlHttpRequest.send();
    }
}
