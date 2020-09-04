import { MIOObject } from "../MIOFoundation";


export class MUIEvent extends MIOObject
{
    static eventWithSysEvent(sysEvent){
        let ev = new MUIEvent();
        ev.initWithSysEvent(sysEvent);
        return ev;
    }

    x = 0;
    y = 0;
    sysEvent = null;
    initWithSysEvent(e){
        super.init();

        this.sysEvent = e;
        this.x = e.clientX;
        this.y = e.clientY;
    }
}