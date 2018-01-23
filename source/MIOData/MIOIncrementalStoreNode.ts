/// <reference path="../MIOFoundation/MIOFoundation.ts" />

class MIOIncrementalStoreNode extends MIOObject {

    private _objectID:MIOManagedObjectID = null;
    get objectID():MIOManagedObjectID {return this._objectID;}
    
    private _version = 0;
    get version(){return this._version;}

    initWithObjectID(objectID:MIOManagedObjectID, values, version){
        this._objectID = objectID;
        this._values = values;
        this._version = version;
    }

    updateWithValues(values, version) {
        this._values = values;
        this._version = version;
    }

    private _values = null;
    valueForPropertyDescription(property:MIOPropertyDescription) {

        var value = this._values[property.name];

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
                let attr = property as MIOAttributeDescription;
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
                return parseInt(value);
            }
            else if (type == MIOAttributeType.Float || type == MIOAttributeType.Number) {
                return parseFloat(value);
            }
            else if (type == MIOAttributeType.String) {
                return value;
            }
            else if (type == MIOAttributeType.Date) {
                return value;
            }
        }
        
        return value;
    }
    
}