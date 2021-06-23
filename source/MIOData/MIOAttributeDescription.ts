import { MIOPropertyDescription } from "./MIOPropertyDescription";

export enum MIOAttributeType {

    Undefined,
    Boolean,
    Integer,
    Float,
    Number,
    String,
    Date,
    Transformable   
}

export class MIOAttributeDescription extends MIOPropertyDescription
{    
    private _attributeType = MIOAttributeType.Undefined;
    private _defaultValue = null;
    private _serverName:string = null;
    private _syncable = true;

    initWithName(name:string, type:MIOAttributeType, defaultValue, optional:boolean, serverName?:string, syncable?:boolean){

        super.init();

        this.name = name;
        this._attributeType = type;
        this._defaultValue = defaultValue;
        this._serverName = serverName;
        this.optional = optional;
        if (syncable == false) this._syncable = false;
    }

    get attributeType(){
        return this._attributeType;
    }

    get defaultValue(){
        return this._defaultValue;
    }

    get serverName(){
        if (this._serverName == null) {    
            return this.name;
        }
        
        return this._serverName;
    }

    get syncable(){
        return this._syncable;
    }
}