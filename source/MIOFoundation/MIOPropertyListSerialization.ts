import { MIOObject } from "./MIOObject";
import { MIOError } from "./MIOError";
import { MIOXMLParser } from "./MIOXMLParser";

export enum MIOPropertyListReadOptions
{
    None
}

export enum MIOPropertyListFormatformat
{
    None
}

export class MIOPropertyListSerialization extends MIOObject
{        
    static _items = null;
    static propertyListWithData(data:string, options:MIOPropertyListReadOptions, format:MIOPropertyListFormatformat, error:MIOError){
                
        MIOPropertyListSerialization._items = [];
        MIOPropertyListSerialization._currentElement = null;
        let parser = new MIOXMLParser();
        parser.initWithString(data, this);
        parser.parse();

        let rootItem = MIOPropertyListSerialization._items[0];        
        return rootItem["Element"];
    }

    // #region XML Parser delegate 
    static _currentElement = null;
    static _currentElementType = null;
    static _currentValue = null;
    static _currentKey = null;
    static _currentString:string = null;
    static parserDidStartElement(parser:MIOXMLParser, element:string, attributes){
        
        if (element == "dict"){
            let item = {};
            if (MIOPropertyListSerialization._currentElement != null && MIOPropertyListSerialization._currentElementType == 0){
                let key = MIOPropertyListSerialization._currentKey;
                MIOPropertyListSerialization._currentElement[key] = item;
            }
            else if (MIOPropertyListSerialization._currentElement != null && MIOPropertyListSerialization._currentElementType == 1){
                MIOPropertyListSerialization._currentElement.push(item);
            }
            
            MIOPropertyListSerialization._currentElement = item;            
            MIOPropertyListSerialization._currentElementType = 0;
            MIOPropertyListSerialization._items.push({"Element": item, "Type":0});            
        }    
        else if (element == "array"){
            let item = [];
            if (MIOPropertyListSerialization._currentElement != null && MIOPropertyListSerialization._currentElementType == 0){
                let key = MIOPropertyListSerialization._currentKey;
                MIOPropertyListSerialization._currentElement[key] = item;
            }
            else if (MIOPropertyListSerialization._currentElement != null && MIOPropertyListSerialization._currentElementType == 1){
                MIOPropertyListSerialization._currentElement.push(item);
            }
            MIOPropertyListSerialization._currentElement = item;
            MIOPropertyListSerialization._currentElementType = 1;
            MIOPropertyListSerialization._items.push({"Element": item, "Type":1});
        }
        else if (element == "key"){
            MIOPropertyListSerialization._currentString = "";
        }        
        else if (element == "string"){
            MIOPropertyListSerialization._currentString = "";
        }
        else if (element == "number"){
            MIOPropertyListSerialization._currentString = "";             
        }
    }
    
    static parserFoundCharacters?(parser:MIOXMLParser, characters:string){
        MIOPropertyListSerialization._currentString += characters;
    }

    static parserDidEndElement(parser:MIOXMLParser, element:string){
                
        if (element == "key") {
            MIOPropertyListSerialization._currentKey = MIOPropertyListSerialization._currentString;
        }
        else if (element == "string") {
            MIOPropertyListSerialization._currentValue = MIOPropertyListSerialization._currentString;
            if (MIOPropertyListSerialization._currentElementType == 1) MIOPropertyListSerialization._currentElement.push(MIOPropertyListSerialization._currentValue);
            else if (MIOPropertyListSerialization._currentElementType == 0 && MIOPropertyListSerialization._currentKey != null){
                let key = MIOPropertyListSerialization._currentKey;
                let value = MIOPropertyListSerialization._currentValue;
                MIOPropertyListSerialization._currentElement[key] = value;
            }
        }
        else if (element == "dict" || element == "array"){
            let lastItem = MIOPropertyListSerialization._items[MIOPropertyListSerialization._items.length - 2];            
            MIOPropertyListSerialization._currentElement = lastItem["Element"];
            MIOPropertyListSerialization._currentElementType = lastItem["Type"];
        }
    }    
    
    static parserDidEndDocument(parser:MIOXMLParser){

    }

    // #endregion
}