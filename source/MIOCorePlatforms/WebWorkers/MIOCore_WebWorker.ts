
function MIOCoreLoadFileFromURL(url, callback){
    
    var instance = this;

    var xhr = new XMLHttpRequest();
    xhr.onload = function(){

        if(this.status == 200 && this.responseText != null){
            // Success!
            callback(this.status, this.responseText);
        }
        else{
            // something went wrong
            console.log("MIOCoreLoadURL: Error downloading resource at " + url + " (Code: " + this.status + ")");
            callback(this.status, null);
        }
    };

    console.log("MIOCoreLoadURL: Downloading resource at " + url);
    xhr.open("GET", url);
    xhr.send();    
}