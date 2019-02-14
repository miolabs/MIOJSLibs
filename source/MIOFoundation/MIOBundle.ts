
import { MIOCoreGetMainBundleURLString, MIOCoreBundle } from "../MIOCore/platform";
import { MIOCoreAppType, MIOCoreGetAppType, MIOCoreHTMLParser, MIOCoreHTMLParserDelegate, MIOLocalizeString } from "../MIOCore";
import { MIOObject } from "./MIOObject";
import { MIOURL } from "./MIOURL";
import { MIOURLRequest } from "./MIOURLRequest";
import { MIOURLConnection } from "./MIOURLConnection";

/**
 * Created by godshadow on 9/4/16.
 */

export class MIOBundle extends MIOObject
{
    url:MIOURL = null;

    private static _mainBundle = null;

    private _webBundle:MIOCoreBundle = null;

    public static mainBundle():MIOBundle
    {
        if (this._mainBundle == null){
            // Main url. Getting from broser window url search field

            let urlString = MIOCoreGetMainBundleURLString();

            this._mainBundle = new MIOBundle();
            this._mainBundle.initWithURL(MIOURL.urlWithString(urlString));
        }

        return this._mainBundle;
    }

    initWithURL(url:MIOURL){
        this.url = url;
    }

    loadHTMLNamed(path, layerID, target?, completion?){            
        if (MIOCoreGetAppType() == MIOCoreAppType.Web){
            if (this._webBundle == null){
                this._webBundle = new MIOCoreBundle();
                this._webBundle.baseURL = this.url.absoluteString;
            }

            this._webBundle.loadHMTLFromPath(path, layerID, this, function(layerData){
                                
                // let parser = new BundleFileParser(layerData, layerID);
                // let result = parser.parse();

                let domParser = new DOMParser();
                let items = domParser.parseFromString(layerData, "text/html");
                let layer = items.getElementById(layerID);

                if (target != null && completion != null)
                    completion.call(target, layer);
            });
        }
    }

    private _loadResourceFromURL(url:MIOURL, target, completion){
        let request = MIOURLRequest.requestWithURL(url);
        let conn =  new MIOURLConnection();
        conn.initWithRequestBlock(request, this, function(error, data){
            completion.call(target, data);
        });
    }

    pathForResourceOfType(resource:string, type:string){
        return _MIOBundleAppGetResource(resource, type);
    }


}

var _MIOAppBundleResources = {};

export function _MIOBundleAppSetResource(resource:string, type:string, content:string){
    let files = _MIOAppBundleResources[type];
    if (files == null) {
        files = {};
        _MIOAppBundleResources[type] = files;
    }

    files[resource] = content;
}

export function _MIOBundleAppGetResource(resource:string, type:string){
    let files = _MIOAppBundleResources[type];
    if (files == null) return null;

    let content = files[resource];
    return content;
}



/*
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

} */