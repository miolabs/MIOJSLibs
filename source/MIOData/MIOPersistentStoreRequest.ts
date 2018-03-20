import { MIOObject } from "../MIOFoundation";



export enum MIORequestType{
    Fetch,
    Save
}

export class MIOPersistentStoreRequest extends MIOObject
{    
    requestType:MIORequestType;
}