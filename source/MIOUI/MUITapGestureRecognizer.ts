
import { MUIEvent, MUIGestureRecognizer, MUIGestureRecognizerState } from ".";

export class MUITapGestureRecognizer extends MUIGestureRecognizer
{
    numberOfTapsRequired = 1;
    
    touchesBeganWithEvent(touches, ev:MUIEvent){
        super.touchesBeganWithEvent(touches, ev);
        this.state = MUIGestureRecognizerState.Began;
    }

    touchesEndedWithEvent(touches, ev:MUIEvent){
        super.touchesEndedWithEvent(touches, ev);
        this.state = MUIGestureRecognizerState.Ended;
    }

}