

export function MIOHTTPRequest(instance, urlString, headers, method, body, binary, delegate, target, completion, download: boolean, fileName?:string) {

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
                let type_response = xhr.getResponseHeader('Content-Type');
                let type = type_response != null ? type_response.split(';')[0] : null;
                if (type != null && type != 'application/json' && type != 'text/html') {
                    //xhr.overrideMimeType('text/plain; charset=x-user-defined');
                    let filename = fileName;

                    // if (fileName == null) {
                    //     let disposition = xhr.getResponseHeader('Content-Disposition');
                    //     if (disposition && disposition.indexOf('attachment') !== -1) {
                    //         let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    //         let matches = filenameRegex.exec(disposition);
                    //         if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                    //     }    
                    // }
                    
                    if (fileName == null) {
                        switch (type) {
                            case "application/pdf": filename = 'document.pdf'; break;
                            case "application/csv": filename = 'document.csv'; break;
                            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": filename = 'document.xlsx'; break;
                            case "application/vnd.ms-excel": filename = 'document.xls'; break;
                            default: filename = "document"; break;
                        }
                    }

                    let data = new Uint8Array(this.response);
                    if (download == true) {
                        
                        let blob = new Blob([data], { type: type });
                        if (typeof (window.navigator as any).msSaveBlob !== 'undefined') {
                            // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                            (window.navigator as any).msSaveBlob(blob, filename);
                        } else {
                            let URL = window.URL || window.webkitURL;
                            let downloadUrl = URL.createObjectURL(blob);

                            if (filename) {
                                // use HTML5 a[download] attribute to specify filename
                                let a = document.createElement("a");
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
                        let arr = new Array();
                        for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                        let bstr = arr.join("");
                        completion.call(target, this.status, null, bstr);
                    }
                }
                else { 
                    let res = this.responseType != 'arraybuffer' ? this.responseText : "ERROR";
                    completion.call(target, this.status, res);
                }
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

    xhr.onerror = function(error){
        // something went wrong
        if (delegate != null)
            delegate.connectionDidFail(instance);
        else if (target != null)
            completion.call(target, this.status, this.responseText);
    }

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
    