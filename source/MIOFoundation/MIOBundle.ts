/**
 * Created by godshadow on 9/4/16.
 */

/// <reference path="MIOObject.ts" />
/// <reference path="MIOURL.ts" />

class MIOBundle extends MIOObject
{
    url:MIOURL = null;

    private static _mainBundle = null;

    private _webBundle:MIOCoreBundle = null;

    public static mainBundle():MIOBundle
    {
        if (this._mainBundle == null)
        {
            // Main url. Getting from broser window url search field

            var urlString = MIOCoreGetMainBundleURLString();

            this._mainBundle = new MIOBundle();
            this._mainBundle.initWithURL(MIOURL.urlWithString(urlString));
        }

        return this._mainBundle;
    }

    initWithURL(url:MIOURL)
    {
        this.url = url;
    }

    loadHTMLNamed(path, layerID, target?, completion?)
    {            

        if (MIOCoreGetAppType() == MIOCoreAppType.Web)
        {
            if (this._webBundle == null){
                this._webBundle = new MIOCoreBundle();
                this._webBundle.baseURL = this.url.absoluteString;
            }

            this._webBundle.loadHMTLFromPath(path, layerID, this, function(layerData){
                                
                let parser = new BundleFileParser(layerData, layerID);
                let result = parser.parse();
        

                var domParser = new DOMParser();
                var items = domParser.parseFromString(result, "text/html");
                var layer = items.getElementById(layerID);

                if (target != null && completion != null)
                    completion.call(target, layer);
            });
        }
    }

    private _loadResourceFromURL(url:MIOURL, target, completion)
    {
        var request = MIOURLRequest.requestWithURL(url);
        var conn =  new MIOURLConnection();
        conn.initWithRequestBlock(request, this, function(error, data){

            completion.call(target, data);
        });
    }


}

class BundleFileParser {

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
        let parser = new MIOXMLParser();
        parser.initWithString(this.text, this);

        parser.parse();

        return this.result;
    }

    private exceptionsTags = ["area", "base", "br", "col", "hr", "img", "input", "link", "meta", "param", "keygen", "source"];

    // XML Parser delegate
    parserDidStartElement(parser:MIOXMLParser, element:string, attributes){

        if (element.toLocaleLowerCase() == "div"){
            
            if (attributes["id"] == this.layerID) {
                // Start capturing   
                this.isCapturing = true;
            }
        }
        else if (element.toLocaleLowerCase() == "span") {
            // Translate text if there is a localized key
        }

        if (this.isCapturing == true) {            
            this.openTag(element, attributes);
            if (this.exceptionsTags.containsObject(element.toLocaleLowerCase()) == false) {
                this.elementCapturingCount++;
            }
        }
    }

    parserFoundCharacters(parser:MIOXMLParser, characters:string){
        if (this.isCapturing == true) {
            this.result += characters;
        }
    }

    parserFoundComment(parser:MIOXMLParser, comment:string) {
        if (this.isCapturing == true) {
            this.result += "<!-- " + comment + "-->";
        }
    }

    parserDidEndElement(parser:MIOXMLParser, element:string){

        if (element.toLocaleLowerCase() == "span"){
        }

        if (this.isCapturing == true) {            
                this.closeTag(element);                
                if (this.exceptionsTags.containsObject(element.toLocaleLowerCase()) == false) {                
                this.elementCapturingCount--;            
            }
        }

        if (this.elementCapturingCount == 0) this.isCapturing = false;
    }

    parserDidEndDocument(parser:MIOXMLParser){
        //console.log("datamodel.xml parser finished");
    }

    private openTag(element, attributes){

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
    }

    private closeTag(element){
        this.result += "</" + element + ">";        
    }

}