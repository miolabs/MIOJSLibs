
/// <reference path="../MIOFoundation/MIOFoundation.ts" />


enum MIOAttributeType {

    Undefined,
    Boolean,
    Integer,
    Float,
    Number,
    String,
    Date   
}

class MIOAttributeDescription extends MIOObject
{
    private _name:string = null;
    private _attributeType = MIOAttributeType.Undefined;
    private _defaultValue = null;
    private _serverName:string = null;

    optional = true;

    initWithName(name:string, type:MIOAttributeType, defaultValue, optional:boolean, serverName?:string){

        super.init();

        this._name = name;
        this._attributeType = type;
        this._defaultValue = defaultValue;
        this._serverName = serverName;
        this.optional = optional;
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
        if (this._serverName == null) {    
            return this._name;
        }
        
        return this._serverName;
    }
}