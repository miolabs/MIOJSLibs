
import { MUIEvent, MUIGestureRecognizer, MUIGestureRecognizerState } from ".";
import { MIOPoint } from "../MIOFoundation";
import { MUIView } from "./MUIView";

export class MUIPanGestureRecognizer extends MUIGestureRecognizer
{
    minimumNumberOfTouches = 1;
    maximumNumberOfTouches = 0;
    
    private initialX = null;
    private initialY = null;

    private touchDown = false;
    touchesBeganWithEvent(touches, ev:MUIEvent){        
        this.initialX = ev.x;
        this.initialY = ev.y;
        this.touchDown = true;
    }

    touchesEndedWithEvent(touches, ev:MUIEvent){
        super.touchesEndedWithEvent(touches, ev);
        this.initialX = null;
        this.initialY = null;
        this.hasStarted = false;
        this.touchDown = false;
    }

    private hasStarted = false;
    touchesMovedWithEvent(touches, ev:MUIEvent){
        if (this.touchDown == false) return;
        if (this.hasStarted == false) this.state = MUIGestureRecognizerState.Began;

        this.hasStarted = true;
        this.deltaX = this.initialX - ev.x;
        this.deltaY = this.initialY - ev.y;

        this.state = MUIGestureRecognizerState.Changed;
    }

    private deltaX = 0;
    private deltaY = 0;
    translationInView(view:MUIView):MIOPoint {
        return new MIOPoint(this.deltaX, this.deltaY);
    }

}