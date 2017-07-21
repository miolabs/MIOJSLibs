
/// <reference path="../MIOFoundation/MIOFoundation.ts" />


enum MIOAttributeType {

    UndefinedAttributeType,
    BooleanAttributeType,
    NumberAttributeType,
    StringAttributeType    
}

class MIOAttributeDescription extends MIOObject
{
    private _name:string = null;
    private _attributeType = MIOAttributeType.UndefinedAttributeType;
    private _defaultValue = null;
    private _serverName:string = null;

    initWithName(name:string, type:MIOAttributeType, defaultValue, serverName?:string){

        super.init();

        this._name = name;
        this._attributeType = type;
        this._defaultValue = defaultValue;
        this._serverName = serverName;
    }

    get name(){
        return this._name;
    }

    get attributeType(){
        return this._attributeType;
    }

    get defaultValue(){
        return this._defaultValue;
    }

    get serverName(){
        return this._serverName;
    }
}