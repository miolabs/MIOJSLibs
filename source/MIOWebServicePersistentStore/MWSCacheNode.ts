import { MIOObject, MIOSet } from "../MIOFoundation"
import { MIOEntityDescription, MIOManagedObject, MIOManagedObjectID, MIORelationshipDescription, MIOIncrementalStoreNode } from "../MIOData"

class MWSCacheNode extends MIOObject
{
/*    static referenceID(identifier:string, entity:MIOEntityDescription) : string {
        return entity.name + "://" + identifier;
    }
    
    private _identifier:string = null;
    private _entity:MIOEntityDescription;
    private _values = null;
    private _version:number = 0;
    private _objectID:MIOManagedObjectID = null;
 
    get version():number { return this._version; }
    get referenceID():string { return this._entity.name + "://" + this._identifier }
    get objectID():MIOManagedObjectID { return this._objectID }
    
    initWithIdentifier(identifier:string, entity:MIOEntityDescription, values, version:number, objectID:MIOManagedObjectID){
        this._identifier = identifier;
        this._values = values; //MPSCacheNode.parseValues(values, entity);
        this._version = version;
        this._entity = entity;
        this._objectID = objectID;
    }
    
    update(values, version: number) {
        let parse_values = values; //MPSCacheNode.parseValues(values, this._entity);
        for (let k in parse_values) {
            this._values[k] = parse_values[k];
        }        
        this._node = null;
        this._attributeValues = null;
        this._version = version;
    }
    
    // static parseValues(values, entity:MIOEntityDescription): any {
        
    //     const referenceFromValue = (value:any): any => {
    //         if (value instanceof MIOManagedObjectID) {
    //             return (value as MIOManagedObjectID)._getReferenceObject();
    //         }
    //         else if (value instanceof MIOManagedObject) {
    //             return (value as MIOManagedObject).objectID._getReferenceObject();
    //         }
    //         else if (value instanceof String) {
    //             return value;
    //         }
            
    //         return null;
    //     }
        
    //     let new_values = {}
        
    //     for (let key in values) {
    //         let v = values[key];

    //         let rel = entity.propertiesByName[key] as? MIORelationshipDescription;
    //         if (rel instanceof MIORelationshipDescription) {
    //             if (rel.isToMany == false) {
    //                 new_values[key] = referenceFromValue(v);
    //             }
    //             else {
    //                 if (v instanceof MIOSet) {
    //                     new_values[key] = (v as! Set<NSManagedObject>).map { reference(from: $0) }
    //                 }
    //                 else if v is Set<NSManagedObjectID> {
    //                     new_values[key] = (v as! Set<NSManagedObjectID>).map { reference(from: $0) }
    //                 }
    //                 else if v is Set<String> {
    //                     new_values[key] = (v as! Set<String>).map { reference(from: $0) }
    //                 }
    //                 else if v is Array<NSManagedObject> {
    //                     new_values[key] = (v as! Array<NSManagedObject>).map { reference(from: $0) }
    //                 }
    //                 else if v is Array<NSManagedObjectID> {
    //                     new_values[key] = (v as! Array<NSManagedObjectID>).map { reference(from: $0) }
    //                 }
    //                 else if v is Array<String> {
    //                     new_values[key] = (v as! Array<String>).map { reference(from: $0) }
    //                 }
    //             }
    //         }
    //         else {
    //             new_values[key] = v
    //         }
    //     }
        
    //     return new_values
    // }
    
    private _node:MIOIncrementalStoreNode = null;
    storeNode(): MIOIncrementalStoreNode {
        if (this._node != null) { return this._node; }
        this._node = MIOIncrementalStoreNode(this._objectID, this.attributeValues(), this._version);
        return this._node;
    }
        
    private _attributeValues = null;
    get attributeValues(): any {
        if (this._attributeValues != null) { return this._attributeValues; }
        
        this._attributeValues = {};
        for (let key in this._entity.attributesByName) {
            let value = this._values[key];
            if (value != null) {
                this._attributeValues[key] = value
            }
        }
        
        return this._attributeValues;
    }
    
    valueForRelationship(relationship: MIORelationshipDescription): any {
        return this._values[relationship.name]
    }
    
    invalidate(){
        this._version = 0;
    }*/
}
