
export enum MIOCoreEventKeyCode
{    
    Enter = 13,
    Escape = 27,
    ArrowLeft = 37,
    ArrowUp = 38,
    ArrowRight = 39,
    ArrowDown = 40
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

export class MIOCoreKeyEvent extends MIOCoreEvent 
{
    keyCode = null;

    initWithKeyCode(eventType:MIOCoreEventType,  eventKeyCode:MIOCoreEventKeyCode, event:Event){

        super.initWithType(eventType, event);
        this.keyCode = eventKeyCode;
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

        var touch = coreEvent.changedTouches[0] // reference first touch point for this event
        this.target = coreEvent.target;
        this.x = touch.clientX;
        this.y = touch.clientY;
    }
}