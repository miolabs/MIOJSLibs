

export function MIOHTTPRequest(instance, urlString, headers, method, body, binary, delegate, target, completion, download: boolean) {

    let xhr = new XMLHttpRequest();

    xhr.onload = function () {

        if (this.status >= 200 && this.status <= 300) {
            // success!
            if (delegate != null)
                delegate.connectionDidReceiveText(instance, this.responseText);
            else if (binary == false || download == false) {
                completion.call(target, this.status, this.responseText);
            }
            else if (target != null) {
                var type = xhr.getResponseHeader('Content-Type').split(';')[0];
                if (type != 'application/json' && type != 'text/html') {
                    //xhr.overrideMimeType('text/plain; charset=x-user-defined');
                    var filename;
                    if (type == 'application/pdf')
                        filename = 'document.pdf';
                    else if (type == 'application/csv')
                        filename = 'document.csv';
                    else
                        filename = "manager_document.xls";

                    var disposition = xhr.getResponseHeader('Content-Disposition');
                    if (disposition && disposition.indexOf('attachment') !== -1) {
                        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        var matches = filenameRegex.exec(disposition);
                        if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                    }

                    var data = new Uint8Array(this.response);

                    if (download == true) {
                        
                        var blob = new Blob([data], { type: type });
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
                                    window.location.href = downloadUrl; // TODO: maybe location.href
                                } else {
                                    a.href = downloadUrl;
                                    a.download = filename;
                                    document.body.appendChild(a);
                                    a.click();
                                }
                            } else {
                                window.location.href = downloadUrl; // TODO: maybe location.href
                            }

                            setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
                            completion.call(target, this.status, null, null);
                        }
                        /// #endif
                    }
                    else {
                        var arr = new Array();
                        for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                        var bstr = arr.join("");
                        completion.call(target, this.status, null, bstr);
                    }
                }
                else
                    completion.call(target, this.status, this.responseText);
            }
        }
        else {
            // something went wrong
            if (delegate != null)
                delegate.connectionDidFail(instance);
            else if (target != null)
                completion.call(target, this.status, this.responseText);
        }
    };

    xhr.open(method, urlString);

    // Add headers
    for (let count = 0; count < headers.length; count++) {
        let item = headers[count];
        xhr.setRequestHeader(item["Field"], item["Value"]);
    }
    if (binary == true)
       xhr.responseType = "arraybuffer";
    if (method == "GET" || body == null)
        xhr.send();
    else
        xhr.send(body);

}
    