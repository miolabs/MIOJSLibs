import { MIOObject } from "./MIOObject";

/**
 * Created by godshadow on 21/3/16.
 */

export class MIOTimer extends MIOObject
{    
    private _timerInterval = 0;
    private _repeat = false;
    private _target = null;
    private _completion = null;

    private _coreTimer = null;

    static scheduledTimerWithTimeInterval(timeInterval, repeat, target, completion)
    {
        var timer = new MIOTimer();
        timer.initWithTimeInterval(timeInterval, repeat, target, completion);

        timer.fire();

        return timer;
    }

    initWithTimeInterval(timeInterval, repeat, target, completion)
    {
        this._timerInterval = timeInterval;
        this._repeat = repeat;
        this._target = target;
        this._completion = completion;
    }

    fire()
    {
        var instance = this;
        
        if (this._repeat){
            this._coreTimer = setInterval(function(){
                instance._timerCallback.call(instance);
            }, this._timerInterval);
        }
        else {
            this._coreTimer = setTimeout(function(){
                instance._timerCallback.call(instance);
            }, this._timerInterval);
        }
    }

    invalidate()
    {
        if (this._repeat)
            clearInterval(this._coreTimer);
        else 
            clearTimeout(this._coreTimer);
    }

    private _timerCallback()
    {
        if (this._target != null && this._completion != null)
            this._completion.call(this._target, this);

        if (this._repeat == true)
            this.invalidate();
    }
}