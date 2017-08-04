/**
 * Created by godshadow on 14/3/16.
 */

/// <reference path="MIOURL.ts" />


class MIOURLRequest extends MIOObject
{
    url = null;
    httpMethod = "GET";
    body = null;
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

class MIOURLConnection
{
    request:MIOURLRequest = null;
    delegate = null;
    blockFN = null;
    blockTarget = null;

    private xmlHttpRequest = null;

    initWithRequest(request:MIOURLRequest, delegate)
    {
        this.request = request;
        this.delegate = delegate;
        this.start();
    }

    initWithRequestBlock(request:MIOURLRequest, blockTarget, blockFN)
    {
        this.request = request;
        this.blockFN = blockFN;
        this.blockTarget = blockTarget;
        this.start();
    }

    start()
    {
        this.xmlHttpRequest = new XMLHttpRequest();
       // this.xmlHttpRequest.responseType = "arraybuffer";
       

        var instance = this;
        this.xmlHttpRequest.onload = function(){

            if(this.status >= 200 && this.status <= 300)
            {
                // success!
                if (instance.delegate != null)
                    instance.delegate.connectionDidReceiveText(instance, this.responseText);
                else if (instance.blockFN != null) {
                    var type = instance.xmlHttpRequest.getResponseHeader('Content-Type').split(';')[0];
                    if( type != 'application/json' && type != 'text/html') {
                        //instance.xmlHttpRequest.overrideMimeType('text/plain; charset=x-user-defined');
                        var filename;
                        if(type == 'application/pdf')
                            filename = 'document.pdf';
                        else if(type == 'application/csv')
                            filename = 'document.csv';    
                        else
                            filename = "manager_document.xls";

                        var disposition = instance.xmlHttpRequest.getResponseHeader('Content-Disposition');
                        if (disposition && disposition.indexOf('attachment') !== -1) {
                            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                            var matches = filenameRegex.exec(disposition);
                            if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                        }

                        var data = new Uint8Array(this.response);                        

                        if (instance.request.download == true) {

                            var blob = new Blob([data] , { type: type});
                            if (typeof window.navigator.msSaveBlob !== 'undefined') {
                                // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                                window.navigator.msSaveBlob(blob, filename);
                            } else {
                                var URL = window.URL || window.webkitURL;
                                var downloadUrl = URL.createObjectURL(blob);

                                if (filename) {
                                    // use HTML5 a[download] attribute to specify filename
                                    var a = document.createElement("a");
                                    // safari doesn't support this yet
                                    if (typeof a.download === 'undefined') {
                                        window.location = downloadUrl;
                                    } else {
                                        a.href = downloadUrl;
                                        a.download = filename;
                                        document.body.appendChild(a);
                                        a.click();
                                    }
                                } else {
                                    window.location = downloadUrl;
                                }

                                setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
                                instance.blockFN.call(instance.blockTarget, this.status, null, null);                                
                            }
                        }
                        else {
                            var arr = new Array();
                            for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                            var bstr = arr.join("");
                            instance.blockFN.call(instance.blockTarget, this.status, null, bstr);                                
                        }                            
                    }
                    else
                        instance.blockFN.call(instance.blockTarget, this.status, this.responseText);
                }
            }
            else
            {
                // something went wrong
                if (instance.delegate != null)
                    instance.delegate.connectionDidFail(instance);
                else if (instance.blockFN != null)
                    instance.blockFN.call(instance.blockTarget, this.status, this.responseText);
            }
        };

        var urlString = this.request.url.absoluteString;
        this.xmlHttpRequest.open(this.request.httpMethod, urlString);

        // Add headers
        for (var count = 0; count < this.request.headers.length; count++)
        {
            var item = this.request.headers[count];
            this.xmlHttpRequest.setRequestHeader(item["Field"], item["Value"]);
        }
        if (this.request.binary == true)
            this.xmlHttpRequest.responseType = "arraybuffer";
        if (this.request.httpMethod == "GET" || this.request.body == null)
            this.xmlHttpRequest.send();
        else             
            this.xmlHttpRequest.send(this.request.body);
        
    }
}
