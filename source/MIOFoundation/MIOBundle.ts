
import { MIOCoreGetMainBundleURLString, MIOCoreBundle } from "../MIOCore/platform";
import { MIOCoreAppType, MIOCoreGetAppType, MIOCoreHTMLParser, MIOCoreHTMLParserDelegate, MIOLocalizeString } from "../MIOCore";
import { MIOObject } from "./MIOObject";
import { MIOURL } from "./MIOURL";
import { MIOURLRequest } from "./MIOURLRequest";
import { MIOURLConnection } from "./MIOURLConnection";
import { MIOLog } from "./MIOLog";

/**
 * Created by godshadow on 9/4/16.
 */

export class MIOBundle extends MIOObject
{
    url:MIOURL = null;

    private identifier:string = null;
    
    private static _mainBundle = null;

    private _webBundle:MIOCoreBundle = null;

    public static mainBundle():MIOBundle {
        
        if (this._mainBundle == null){
            // Main url. Getting from broser window url search field

            let urlString = MIOCoreGetMainBundleURLString();

            this._mainBundle = new MIOBundle();
            this._mainBundle.initWithURL(MIOURL.urlWithString(urlString));
            this._mainBundle.identifier = "MainBundle";
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
    
    pathForResourceOfType(resource:string, type:string){
        return _MIOBundleAppGetResource(this.identifier, resource, type);
    }
}


let _MIOCoreBundleLoadTarget = null;
let _MIOCoreBundleLoadCompltion = null;

export function _MIOBundleLoadBundles(url:MIOURL, target, completion) {
    // Download and create the App Bundles    

    _MIOCoreBundleLoadTarget = target;
    _MIOCoreBundleLoadCompltion = completion;

    let request = MIOURLRequest.requestWithURL(url);
    let conn =  new MIOURLConnection();
    conn.initWithRequestBlock(request, this, function(code, data){
        
        if (code != 200) {
            completion.call(target, data);
            return;
        }
        
        // Process the data
        let bundleJSON = null;
        try {
            bundleJSON = JSON.parse(data.replace(/(\r\n|\n|\r)/gm, ""));    
        } catch (error) {
            MIOLog ("BUNDLE JSON PARSER ERROR: " + error);            
            MIOLog ("BUNDLE JSON PARSER DATA: " + data);            
            completion.call(target, data);
            return;
        }

        // Keep going

        for (let key in bundleJSON) {
            let resources = bundleJSON[key];
            _MIOBundleCreateBundle(key, resources);
        }

    });

}

let _MIOBundleResourcesDownloadingCount = 0

export function  _MIOBundleCreateBundle(key:string, resources){    

    for (let urlString of resources) {
        
        let request = MIOURLRequest.requestWithURL(MIOURL.urlWithString(urlString));
        let conn =  new MIOURLConnection();
        
        _MIOBundleResourcesDownloadingCount++;
        conn.initWithRequestBlock(request, this, function(code, data){
            _MIOBundleResourcesDownloadingCount--;

            if (code == 200) {                
                let type = urlString.match(/\.[0-9a-z]+$/i);
                if (type != null && type.length > 0) type = type[0].substring(1);
                let resource = type != null ? urlString.substring(0, urlString.length - type.length - 1) : urlString ;
                _MIOBundleSetResource(key, resource, type, data);

            }

            _MIOBundleResourceDownloadCheck();
        });    
    }

}

export function  _MIOBundleResourceDownloadCheck(){
    if (_MIOBundleResourcesDownloadingCount > 0) return;
    
    _MIOCoreBundleLoadCompltion.call(_MIOCoreBundleLoadTarget);
    
    _MIOCoreBundleLoadCompltion = null;
    _MIOCoreBundleLoadTarget = null;
}

export function  _MIOBundleLoadResourceFromURL(url:MIOURL, target, completion){
    let request = MIOURLRequest.requestWithURL(url);
    let conn =  new MIOURLConnection();
    conn.initWithRequestBlock(request, this, function(error, data){
        completion.call(target, data);
    });
}


let _MIOAppBundles = {};

export function _MIOBundleSetResource(identifier:string, resource:string, type:string, content:string){

    let bundle = _MIOAppBundles[identifier];
    if (bundle == null) {
        bundle = {}
        _MIOAppBundles[identifier] = bundle;
    }

    let t = type;
    if (type == null) t = "NO_TYPE";
    let files = bundle[t];
    if (files == null) {
        files = {};
        bundle[t] = files;
    }

    files[resource] = content;
}

export function _MIOBundleAppGetResource(identifier:string, resource:string, type:string){

    let bundle = _MIOAppBundles[identifier];
    if (bundle == null) return null;    

    let t = type;
    if (type == null) t = "NO_TYPE";
    let files = bundle[t];
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