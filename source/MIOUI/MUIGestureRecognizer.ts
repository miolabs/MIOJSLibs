import { MIOObject } from "../MIOFoundation";
import { MUIView, MUIEvent } from ".";

export enum MUIGestureRecognizerState {
    Possible,
    Began,
    Changed,
    Ended,
    Cancelled,
    Failed,
    Recognized
}

export class MUIGestureRecognizer extends MIOObject
{
    delegate = null;

    set view(v:MUIView){this.setView(v);}
    get view(){ return this._view;}
    
    set state(value:MUIGestureRecognizerState) {this.setState(value);}
    get state() {return this._state;}
    isEnabled = true;

    name:string = null;
    
    private target = null;
    private block = null;
    initWithTarget(target, block){
        super.init();

        this.target = target;
        this.block = block;
    }

    private _view:MUIView = null;        
    setView(view:MUIView){                
        this._view = view;
    }
    
    private _state:MUIGestureRecognizerState = MUIGestureRecognizerState.Possible;
    private setState(state:MUIGestureRecognizerState){
        if (this.isEnabled == false) return;
        if (this._state == state && state != MUIGestureRecognizerState.Changed) return;
        this._state = state;
        this.block.call(this.target, this);
    }
    
    
    touchesBeganWithEvent(touches, ev:MUIEvent){
        this.state = MUIGestureRecognizerState.Began;
    }    

    touchesMovedWithEvent(touches, ev:MUIEvent){
        this.state = MUIGestureRecognizerState.Changed;
    }

    touchesEndedWithEvent(touches, ev:MUIEvent){
        this.state = MUIGestureRecognizerState.Ended;
    }

    reset(){
        this.state = MUIGestureRecognizerState.Possible;
    }

    // To call from MUIView. Only for internal use
    _viewTouchesBeganWithEvent(touches, ev:MUIEvent){
        this.reset();
        this.touchesBeganWithEvent(touches, ev);
    }

    _viewTouchesMovedWithEvent(touches, ev:MUIEvent){
        this.touchesMovedWithEvent(touches, ev);
    }

    _viewTouchesEndedWithEvent(touches, ev:MUIEvent){
        this.touchesEndedWithEvent(touches, ev);
    }

}