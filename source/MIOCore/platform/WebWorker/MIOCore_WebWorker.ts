
export function MIOCoreLoadFileFromURL(url, callback){
    
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

export function MIOClassFromString(name){
    return null
}

export class MIOCoreEvent
{
    coreEvent:Event;
    eventType = null;
    target = null;
    completion = null;

    initWithType(eventType:MIOCoreEventType, coreEvent:Event) {

        this.coreEvent = coreEvent;
        this.eventType = eventType;
    }

    cancel(){        
        this.coreEvent.preventDefault();
    }
}

export class MIOCoreEventInput extends MIOCoreEvent
{
    target = null;
    x = 0;
    y = 0;
    deltaX = 0;
    deltaY = 0;
} 

export enum MIOCoreEventType
{
    KeyUp,
    KeyDown,
    
    MouseUp,
    MouseDown,
    TouchStart,
    TouchEnd,
    Click,
    
    Resize
}