
export class UIEdgeInsets
{
    static zero():UIEdgeInsets {
        return new UIEdgeInsets(0, 0, 0, 0);
    }

    top:number;
    bottom:number;
    right:number;
    left:number;

    constructor(top:number, left:number, bottom:number, right:number){
        this.top = top;
        this.left = left;
        this.bottom = bottom;
        this.right = right;
    }
}