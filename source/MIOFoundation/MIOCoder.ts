
import { MIOObject } from "./MIOObject";


export interface MIOCoding
{
    initWithCoder?(coder:MIOCoder);
    encodeWithCoder?(coder:MIOCoder);
}

export class MIOCoder extends MIOObject
{
    decodeIntegerForKey(key:string){

    }

    decodeObjectForKey(key:string){

    }
}