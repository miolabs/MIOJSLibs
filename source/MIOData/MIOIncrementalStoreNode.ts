import { MIOObject, MIOISO8601DateFormatter } from "../MIOFoundation";
import { MIOManagedObjectID } from "./MIOManagedObjectID";
import { MIOPropertyDescription } from "./MIOPropertyDescription";
import { MIORelationshipDescription } from "./MIORelationshipDescription";
import { MIOAttributeDescription, MIOAttributeType } from "./MIOAttributeDescription";



export class _MIOIncrementalStoreNodeDateTransformer {
    static sdf:MIOISO8601DateFormatter = MIOISO8601DateFormatter.iso8601DateFormatter();
}

export class MIOIncrementalStoreNode extends MIOObject {

    private _objectID:MIOManagedObjectID = null;
    get objectID():MIOManagedObjectID {return this._objectID;}
    
    private _version = 0;
    get version(){return this._version;}

    initWithObjectID(objectID:MIOManagedObjectID, values, version){
        this._objectID = objectID;
        this._values = values;
        this._version = version;
    }

    updateWithValues(values:any, version:number) {
        for (let property of Object.keys(values))
            this._values[property] = values[property]
        this._version = version;
    }

    private _values = null;
    valueForPropertyDescription(property:MIOPropertyDescription) {

        let value = this._values[property.name];

        if (property instanceof MIORelationshipDescription) {
            let rel = property as MIORelationshipDescription;
            if (value == null) {
                value = this._values[rel.serverName];
            }
            return value;
        }
        else if (property instanceof MIOAttributeDescription) {
            let attr = property as MIOAttributeDescription;
            let type = attr.attributeType;

            if (value == null){
                value = this._values[attr.serverName];
            }        
    
            if (type == MIOAttributeType.Boolean) {
                if (typeof (value) === "boolean") {
                    return value;
                }
                else if (typeof (value) === "string") {
                    let lwValue = value.toLocaleLowerCase();
                    if (lwValue == "yes" || lwValue == "true" || lwValue == "1")
                        return true;
                    else
                        return false;
                }
                else {
                    let v = value > 0 ? true : false;
                    return v;
                }
            }
            else if (type == MIOAttributeType.Integer) {
                let v = parseInt(value);
                return isNaN(v) ? null : v;
            }
            else if (type == MIOAttributeType.Float || type == MIOAttributeType.Number) {
                let v = parseFloat(value); 
                return isNaN(v) ? null : v;
            }
            else if (type == MIOAttributeType.String) {
                return value;
            }
            else if (type == MIOAttributeType.Date) {                
                let date = _MIOIncrementalStoreNodeDateTransformer.sdf.dateFromString(value);
                return date;
            }
            else if (type == MIOAttributeType.Transformable) {                
                let v = value != null ? JSON.parse(value) : null;
                return v;
            }

        }
        
        return value;
    }
    
}