import { MUIView } from "./MUIView";

export enum MUIProgressViewStyle
{
    default = 0,
    bar = 1
}

export class MUIProgressView extends MUIView
{
    progressViewStyle = MUIProgressViewStyle.default;    

    initWithStyle(style: MUIProgressViewStyle) {
        this.progressViewStyle = style;
    }

    private _progress = 0;
    setProgress(progress:number, animated:boolean){
        this._progress = progress;
    }

    set progress(progress:number) { this.setProgress(progress, true); }
    get progress():number { return this._progress; }
}