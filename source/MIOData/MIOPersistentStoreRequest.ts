/// <reference path="../MIOFoundation/MIOFoundation.ts" />


enum MIORequestType{
    Fetch,
    Save
}

class MIOPersistentStoreRequest extends MIOObject
{    
    requestType:MIORequestType;
}