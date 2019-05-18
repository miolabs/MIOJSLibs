import { MIOObject } from "./MIOObject";
import { MIOError } from "./MIOError";
import { MIOXMLParser } from "./MIOXMLParser";

export enum MIOPropertyListFormat
{
    OpenStepFormat,
    XMLFormat_v1_0,
    BinaryFormat_v1_0,    
}

export enum MIOPropertyListReadOptions
{
    None
}

export enum MIOPropertyListWriteOptions
{
    None
}

export class MIOPropertyListSerialization extends MIOObject
{            
    static propertyListWithData(data:string, options:MIOPropertyListReadOptions, format:MIOPropertyListFormat, error:MIOError){
        let pl = new MIOPropertyListSerialization();
        pl.initWithData(data, options, format);

        let item = pl.parseData(error);
        return item;
    }

    static dataWithpropertyList(plist:any, format:MIOPropertyListFormat, options:MIOPropertyListReadOptions, error:MIOError){
        let pl = new MIOPropertyListSerialization();
        pl.initWithObject(plist, options, format);

        let data = pl.parsePList(error);
        return data;
    }


    private data:string = null;
    private initWithData(data:string, options:MIOPropertyListReadOptions, format:MIOPropertyListFormat){
        super.init();
        this.data = data;
    }

    private plist:any = null;
    private initWithObject(plist:any, options:MIOPropertyListReadOptions, format:MIOPropertyListFormat){
        super.init();
        this.plist = plist;
    }

    private rootItem = null;        
    private parseData(error:MIOError){
        this.currentElement = null;
        let parser = new MIOXMLParser();
        parser.initWithString(this.data, this);
        parser.parse();
        
        return this.rootItem;

    }

    // #region XML Parser delegate 
    private currentElement = null;
    private currentElementType = null;
    private currentValue = null;
    private currentKey = null;
    private currentString:string = null;
    private itemStack = [];
    
    parserDidStartElement(parser:MIOXMLParser, element:string, attributes){
        
        if (element == "dict"){            
            let item = {};
            if (this.currentElement != null && this.currentElementType == 0){
                let key = this.currentKey;
                this.currentElement[key] = item;
            }
            else if (this.currentElement != null && this.currentElementType == 1){
                this.currentElement.push(item);
            }
            
            this.currentElement = item;
            this.currentElementType = 0;
            this.itemStack.push({"Element": item, "Type":0});

            if (this.rootItem == null) this.rootItem = item;
        }    
        else if (element == "array"){
            let item = [];
            if (this.currentElement != null && this.currentElementType == 0){
                let key = this.currentKey;
                this.currentElement[key] = item;
            }
            else if (this.currentElement != null && this.currentElementType == 1){
                this.currentElement.push(item);
            }
            this.currentElement = item;
            this.currentElementType = 1;
            this.itemStack.push({"Element": item, "Type": 1});

            if (this.rootItem == null) this.rootItem = item;
        }
        
        this.currentString = "";
    }
    
    parserFoundCharacters(parser:MIOXMLParser, characters:string){
        this.currentString += characters;
    }

    parserDidEndElement(parser:MIOXMLParser, element:string){
                
        if (element == "key") {
            this.currentKey = this.currentString;            
        }
        else if (element == "string" || element == "integer" || element == "real" || element == "data") {
            this.currentValue = this.currentString;
            if (element == "integer") this.currentValue = parseInt(this.currentString);
            if (element == "real") this.currentValue = parseFloat(this.currentString);
            if (this.currentElementType == 1) this.currentElement.push(this.currentValue);
            else if (this.currentElementType == 0 && this.currentKey != null){
                let key = this.currentKey;
                let value = this.currentValue;
                this.currentElement[key] = value;
            }
        }
        else if (element == "dict" || element == "array"){
            if (this.itemStack.length > 1) {
                let lastItem = this.itemStack[this.itemStack.length - 2];            
                this.currentElement = lastItem["Element"];
                this.currentElementType = lastItem["Type"];                
            }
            else {                
                this.currentElement = null;
                this.currentElementType = null;
            }
            this.itemStack.splice(-1,1);
        }
    }    
    
    parserDidEndDocument(parser:MIOXMLParser){

    }

    private contentString:string = null;
    private parsePList(error:MIOError){
        this.contentString = '<?xml version="1.0" encoding="UTF-8"?>';
        this.contentString += '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">';
        this.contentString += '<plist version="1.0">';
        
        this.parseObject(this.plist);

        this.contentString += '</plist>';

        return this.contentString;
    }

    private parseObject(object:any){
        
        if (typeof object === "string") this.parseString(object);
        else if (typeof object === "number") this.parseNumber(object);
        //else if (typeof object === "Date") this.parseDate(object);
        else if (object instanceof Array) this.parseArray(object);
        else this.parseDictionary(object);
    }

    private parseString(object:string){
        this.contentString += "<string>";
        this.contentString += object;
        this.contentString += "</string>";
    }

    private parseNumber(object:number){
        if (object % 1 === 0) {
            this.contentString += "<integer>";
            this.contentString += object;
            this.contentString += "</integer>";    
        }
        else {
            this.contentString += "<real>";
            this.contentString += object;
            this.contentString += "</real>";    
        }        
    }

    private parseArray(objects:any){
        this.contentString += "<array>";

        for (let index = 0; index < objects.length; index++){
            let obj = objects[index];
            this.parseObject(obj);
        }

        this.contentString += "</array>";
    }

    private parseDictionary(objects:any){
        this.contentString += "<dict>";

        for (let key in objects){            
            this.contentString += "<key>";
            this.contentString += key;
            this.contentString += "</key>";

            let obj = objects[key];
            this.parseObject(obj);
        }

        this.contentString += "</dict>";
    }

}