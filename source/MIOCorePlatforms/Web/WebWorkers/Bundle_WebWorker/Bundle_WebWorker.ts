// Reference the dependencies relative to the runtime location
importScripts("../../libs/miojs/miocore/index.js");
importScripts("../../libs/miojs/miocoreplatformww/index.js");
importScripts("../../libs/miojs/miofoundation/index.js");

// workaround for typescript webworker self

// "the issue occurs because postMessage is not in the WorkerGlobalScope interface but --lib 'webworker' makes self of type WorkerGlobalScope"
// Source: https://github.com/Microsoft/TypeScript/issues/12657#issuecomment-365633337
const ww = (self as DedicatedWorkerGlobalScope)

var _languageStrings = null;

ww.addEventListener('message', function(e) {

    var item = e.data;

    var cmd = item["CMD"];

    if (cmd == "SetLanguageStrings"){
        _languageStrings = item["LanguageStrings"];
    }
    else if (cmd == "DownloadHTML")
    {
        var url = item["URL"];
        var layerID = item["LayerID"];
        var path = item["Path"];

        downloadHTML(url, layerID, path);
    }

}, false);


function downloadHTML(url, layerID, path) {
    
    var conn = new MIOURLConnection();
    conn.initWithRequestBlock(MIOURLRequest.requestWithURL(MIOURL.urlWithString(url)), this, function(code, data){
        this.parseHTML(url, data, layerID, path);
    });
    
    // var instance = this;

    // var xhr = new XMLHttpRequest();
    // xhr.onload = function(){

    //     if(this.status == 200 && this.responseText != null)
    //     {
    //         // success!
    //         instance.parseHTML.call(instance, url, this.responseText, layerID, path);
    //     }
    //     else
    //     {
    //         // something went wrong
    //         console.log("BUNDLE_WORKER: Error downloading resource at " + url + " (Code: " + this.status + ")");
    //         instance.parseHTML.call(instance);
    //     }
    // };

    // console.log("BUNDLE_WORKER: Downloading resource at " + url);
    // xhr.open("GET", url);
    // xhr.send();
}

function parseHTML(url, data, layerID, path)
{
    if (data == null) {
        ww.postMessage({"Error" : "Couldn't download resource"});
    }
    else
    {
        var result = MIOHTMLParser(data, layerID, path, function(css) {

            // Found link
            // var item = [];
            // item["Type"] = "CSS";
            // item["CSSURL"] = css["url"];
            // item["BaseURL"] = url;
            // item["Path"] = path;
            // item["Media"] = css["media"];
            // ww.postMessage(item);
        });

        var item = [];
        item["Type"] = "HTML";
        item["Result"] = result;
        item["LayerID"] = layerID;
        ww.postMessage(item);
    }
}


function MIOHTMLParser(string, layerID, relativePath, callback)
{
    var tag = "";
    var attribute = "";
    var value = "";

    var token = "";

    var styles = [];
    var currentStyle = null;

    var tagContent = "";
    var layout = "";
    var isCapturing = false;
    var captureTag = null;

    var openTagCount = 0;

    console.log("*********************");
    console.log(string);

    var stepIndex = 0; // 0 -> None, 1 -> Tag, 2 -> Attribute, 3 -> value, 4 -> html

    for (var index = 0; index < string.length; index++)
    {
        var ch = string.charAt(index);
        if (isCapturing == true)
            layout += ch;

        if (ch == "<")
        {
            if (isCapturing && string.charAt(index + 1) != "/")
                openTagCount++;

            tagContent = "<";
            tag = "";
            attribute = "";
            var attributes = {} 
            value = "";

            stepIndex = 1;
            index++;
            for (var count = index; count < string.length; count++, index++)
            {
                var ch2 = string.charAt(index);
                tagContent += ch2;
                if (isCapturing == true)
                    layout += ch2;

                if (ch2 == "/")
                {
                    if (token.length > 0)
                    {
                        // something behind
                        value = token;
                        if (currentStyle != null)
                        {
                            currentStyle[attribute] = value;
                        }
                    }

                    if (isCapturing)
                    {
                        openTagCount--;
                        if (openTagCount == 0) {
                            isCapturing = false;
                            layout += captureTag + ">";
                        }
                    }
                    tagContent = "";
                }
                else if (ch2 == ">") {

                    if (currentStyle != null)
                    {
                        styles.push(currentStyle);
                        FoundLink(currentStyle, callback);
                    }

                    currentStyle = null;
                    break;
                }
                else if (ch2 == " ")
                {
                    if (token.length == 0)
                        continue;

                    switch (stepIndex)
                    {
                        case 1:
                            tag = token;
                            //console.log("<" + tag + ">");
                            stepIndex = 2;
                            if (tag == "link")
                            {
                                // add style
                                currentStyle = {};
                            }
                            break;

                        case 3:
                            value = token;
                            attributes[attribute] = value;
                            //console.log("<" + tag + " " + attribute + "=" + value + ">");
                            stepIndex = 2;
                            if (currentStyle != null)
                            {
                                currentStyle[attribute] = value;
                            }

                            break;
                    }

                    token = "";
                }
                else if (ch2 == "=")
                {
                    stepIndex = 3;
                    attribute = token;
                    token = "";
                }
                else if (ch2 == "\"")
                {
                    count++;
                    index++;
                    for (var count2 = index; count2 < string.length; count2++, count++, index++){

                        var ch3 = string.charAt(index);
                        tagContent += ch3;
                        if (isCapturing == true)
                            layout += ch3;

                        if (ch3 == "\"")
                            break;
                        else
                            token += ch3;
                    }
                }
                else
                {
                    token += ch2;
                }
            }

            // Last check
            if (token.length > 0) {
                switch (stepIndex) {

                    case 1:
                        tag = token;
                        //console.log("<" + tag + ">");
                        stepIndex = 2;
                        if (tag == "link")
                        {
                            // add style
                            currentStyle = {};
                        }
                        break;

                    case 2:
                        attribute = token;
                        //console.log("<" + tag + " " + attribute + ">");
                        break;

                    case 3:
                        value = token;
                        attributes[attribute] = value;
                        //console.log("<" + tag + " " + attribute + "=" + value + ">");
                        stepIndex = 2;
                        if (attributes["id"] == layerID)
                        {
                            // Record
                            isCapturing = true;
                            openTagCount = 1;
                            captureTag = tag;
                            layout += tagContent;
                        }

                        if (currentStyle != null)
                        {
                            currentStyle[attribute] = value;
                        }
                        break;
                }
                token = "";
            }

            stepIndex = 4;
        }
    }

    console.log("---------------------");
    console.log(layout);

    // filter link tags
    var styleFiles = [];
    for (let index = 0; index < styles.length; index++)
    {
        var s = styles[index];
        if (s["rel"] == "stylesheet")
        {
            // Add style
            var css ={"url": s["href"]};
            var media = s["media"];
            if (media != null) css["media"] = media;
            styleFiles.push(css);
            console.log("CSS: " + css);
        }
    }

    console.log("*********************");

    return {
        styles: styleFiles,
        layout: layout
    };
}

function FoundLink(link, callback)
{
    if (link["rel"] == "stylesheet")
    {
        // Add style
        var css ={"url": link["href"]};
        var media = link["media"];
        if (media != null) css["media"] = media;        
        callback(css);
        console.log("Send CSS: " + css);
    }
}