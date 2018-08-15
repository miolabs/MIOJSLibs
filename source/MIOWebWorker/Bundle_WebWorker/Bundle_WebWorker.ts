import { MIOCoreLoadFileFromURL } from "../../MIOCore/platform/WebWorker/MIOCore_WebWorker";
import { setMIOLocalizedStrings, MIOLocalizeString } from "../../MIOCore/MIOCoreString";
import { MIOCoreHTMLParser, MIOCoreHTMLParserDelegate } from "../../MIOCore";

var ww = (self as DedicatedWorkerGlobalScope)
var _languageStrings = null;
ww.addEventListener('message', function(e) {

    var item = e.data;

    var cmd = item["CMD"];

    if (cmd == "SetLanguageStrings"){
        setMIOLocalizedStrings(item["LanguageStrings"]);
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
    
    MIOCoreLoadFileFromURL(url, function(code, data){
        parseHTML(url, data, layerID, path);
    });
}

function parseHTML(url, data, layerID, path)
{
    if (data == null) {
        ww.postMessage({"Error" : "Couldn't download resource: " + url});
    }
    else
    {
        let parser = new BundleFileParser(data, layerID);
        let result = parser.parse();

        // var result = MIOHTMLParser(data, layerID, path, function(css) {

        //     // Found link
        //     // var item = [];
        //     // item["Type"] = "CSS";
        //     // item["CSSURL"] = css["url"];
        //     // item["BaseURL"] = url;
        //     // item["Path"] = path;
        //     // item["Media"] = css["media"];
        //     // ww.postMessage(item);
        // });

        var item = [];
        item["Type"] = "HTML";
        item["Result"] = result;
        //item["Result"] = data;
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

    for (let index = 0; index < string.length; index++)
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

export class BundleFileParser implements MIOCoreHTMLParserDelegate {

    private text = null;
    private layerID = null;

    private result = "";
    private isCapturing = false;
    private elementCapturingCount = 0;

    constructor(text, layerID) {
        this.text = text;
        this.layerID = layerID;
    }

    parse(){
        let parser = new MIOCoreHTMLParser();
        parser.initWithString(this.text, this);

        parser.parse();

        return this.result;
    }    

    // HTML Parser delegate
    parserDidStartElement(parser:MIOCoreHTMLParser, element:string, attributes){
        
        if (element.toLocaleLowerCase() == "div"){
            
            if (attributes["id"] == this.layerID) {
                // Start capturing   
                this.isCapturing = true;
            }
        }

        if (this.isCapturing == true) {            
            this.openTag(element, attributes);
            this.elementCapturingCount++;
        }
    }

    private currentString = null;
    private currentStringLocalizedKey = null;
    parserFoundCharacters(parser:MIOCoreHTMLParser, characters:string){
        if (this.isCapturing == true) {
            if (this.currentString == null) {
                this.currentString = characters;
            }
            else 
                this.currentString += " " + characters;
            
            //this.result += " " + characters;
        }
    }

    parserFoundComment(parser:MIOCoreHTMLParser, comment:string) {
        if (this.isCapturing == true) {
            this.result += "<!-- " + comment + "-->";
        }
    }

    parserDidEndElement(parser:MIOCoreHTMLParser, element:string){        

        if (this.isCapturing == true) {            
                this.closeTag(element);                
                this.elementCapturingCount--;            
        }

        if (this.elementCapturingCount == 0) this.isCapturing = false;

        this.currentString = null;        
    }

    parserDidStartDocument(parser:MIOCoreHTMLParser){
        console.log("parser started");
    }

    parserDidEndDocument(parser:MIOCoreHTMLParser){
        console.log("datamodel.xml parser finished");
        console.log(this.result);
    }

    private openTag(element, attributes){

        this.translateCharacters();

        this.result += "<" + element;        

        for (let key in attributes){            
            let value = attributes[key];
            if (value != null) {
                this.result += " " + key + "='" + value + "'";
            }
            else {
                this.result += " " + key;
            }
        }

        this.result += ">";

        if (element == "span") {
            this.currentStringLocalizedKey = attributes["localized-key"] || attributes["data-localized-key"];
        }
    }

    private closeTag(element){
        this.translateCharacters();
        this.result += "</" + element + ">";        
    }

    private translateCharacters(){
        if (this.currentString != null) {
            if (this.currentStringLocalizedKey == null) {
                this.result += this.currentString;
            }else {
                this.result += MIOLocalizeString(this.currentStringLocalizedKey, this.currentString);
            }
        }
        this.currentString = null;
        this.currentStringLocalizedKey = null;        
    }

}