


enum MIORequestType{
    Fetch,
    Save
}

class MIOPersistentStoreRequest extends MIOObject
{    
    requestType:MIORequestType;
}