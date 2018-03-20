import { MIOObject } from "../MIOFoundation";
import { MIOEntityDescription } from "./MIOEntityDescription";



export class MIOPropertyDescription extends MIOObject {
    
    entity:MIOEntityDescription = null;
    name:string = null;   
    optional = true;    
}