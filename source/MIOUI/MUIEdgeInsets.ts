import { MIOObject } from "../MIOFoundation";



export function MIOEdgeInsetsMake(top, left, bottom, rigth){

    let ei = new MUIEdgeInsets();
    ei.initWithValues(top, left, bottom, rigth);

    return ei;
}

export class MUIEdgeInsets extends MIOObject
{
    top = 0;
    left = 0;
    bottom = 0;
    right = 0;
    
    static Zero():MUIEdgeInsets {
        let ei = new MUIEdgeInsets();
        ei.init();

        return ei;
    }

    initWithValues(top, left, bottom, right){
        
        super.init();

        this.top = top;
        this.left = left;
        this.bottom = bottom;
        this.right = right;
    }
}