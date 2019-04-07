// In the browser the 'window' holds all defined global variables, that is necessary for 'MIOClassFromString'
// Here we can access them by importing all the exported functions here to use.
import * as mioclasses from "../../../index.node";

export function MIOCoreGetMainBundleURLString(): string {
    return "";
}

export class MIOCoreBundle {
    baseURL: string;
    loadHMTLFromPath(path, layerID, instance, callback) {};
}

export enum MIOCoreBrowserType
{
    Safari,
    Chrome,
    IE,
    Edge,
    Other
}

export function MIOCoreGetBrowser(): MIOCoreBrowserType {
    return MIOCoreBrowserType.Other;
}

export function MIOClassFromString(name): any{
    let newClass: any = new mioclasses[name]();
    return newClass;
}

export function MIOCoreGetBrowserLanguage(){
    return null;
}

export function MIOCoreEventRegisterObserverForType(eventType, observer, completion){
}

export enum MIOCoreEventType
{
    None
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

export enum MIOCoreEventMouseButtonType{
    
    None,
    Left,
    Right,
    Middle
}

export class MIOCoreEventMouse extends MIOCoreEventInput
{
    button = MIOCoreEventMouseButtonType.None;

    initWithType(eventType:MIOCoreEventType, coreEvent:MouseEvent) {

        super.initWithType(eventType, event);
        //Get the button clicked
        this.button = MIOCoreEventMouseButtonType.Left;
        this.target = coreEvent.target;
        this.x = coreEvent.clientX;
        this.y = coreEvent.clientY;
    }
}

// Declare changedTouches interface for typescript
// interface Event {
//     touches:TouchList;
//     targetTouches:TouchList;
//     changedTouches:TouchList;
// };

export class MIOCoreEventTouch extends MIOCoreEventInput
{
    initWithType(eventType:MIOCoreEventType, coreEvent:TouchEvent) {   
        super.initWithType(eventType, event);
        let touch = coreEvent.changedTouches[0] // reference first touch point for this event
        this.target = coreEvent.target;
        this.x = touch.clientX;
        this.y = touch.clientY;
    }
}

export function MIOCoreIsPhone(){    
    return null;
}

export function MIOCoreIsMobile(){    
    return null;
}
export function MIOCoreDeviceOSString(){
    return "node";
}

export function MIOCoreLoadStyle(url, media, target?, completion?){
}




