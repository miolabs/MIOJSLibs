import { MUIView } from "./MUIView";

/**
 * Created by godshadow on 21/5/16.
 */

 export enum MUIActivityIndicatorViewStyle {
    White,
    WhiteLarge,
    Gray
 }

export class MUIActivityIndicatorView extends MUIView
{    
    initWithLayer(layer, owner, options){
        super.initWithLayer(layer, owner, options);
        this.setHidden(true);
    }

    startAnimating(){
        this.setHidden(false);
    }

    stopAnimating(){
        this.setHidden(true);
    }
    
    private _hidesWhenStopped = true;
    set hidesWhenStopped(value:boolean){
        this._hidesWhenStopped = value;
    }

    get hidesWhenStopped():boolean{
        return this._hidesWhenStopped;
    }

    private isAnimating = false;
    get animating():boolean{
        return this.isAnimating;
    }

    private _activityIndicatorViewStyle = MUIActivityIndicatorViewStyle.White;
    set activityIndicatorViewStyle(value:MUIActivityIndicatorViewStyle){

    }

    get activityIndicatorViewStyle(){
        return this._activityIndicatorViewStyle;
    }
}