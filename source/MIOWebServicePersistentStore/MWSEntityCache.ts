import { MIOEntityDescription, MIOIncrementalStoreNode, MIOManagedObject, MIOManagedObjectID } from "../MIOData";
import { MIOUUID, MIOLog } from "../MIOFoundation";

export class MWSEntityCacheObject
{
    hash:string = MIOUUID.UUID().UUIDString;    
    entity:MIOEntityDescription;
    id:MIOUUID;
    version:number;
    values:any;
    
    get reference():string {
        return this.entity.name + "://" + this.id.UUIDString;
    }    

    private _objectID:MIOManagedObjectID|null = null;
    get objectID():MIOManagedObjectID {return this._objectID!;}
    set objectID(objID:MIOManagedObjectID){
        this._objectID = objID;
        this._incremental_node = null;
    }

    updateValues(values:any, version:number){
        if (this.values == null) this.values = values;
        else Object.assign(this.values, values );
        this.version = version;
        this._incremental_node = null;
    }

    private _incremental_node:MIOIncrementalStoreNode|null = null;
    incrementalNode():MIOIncrementalStoreNode {
        if (this._incremental_node == null) {
            this._incremental_node = new MIOIncrementalStoreNode();
            this._incremental_node.initWithObjectID(this.objectID, this.values, this.version);
        }

        return this._incremental_node;
    }
}

export class MWSEntityCache
{
    private _entity_graph = {};
    private _entities_by_hash = {};

    private _hash_key(entity: MIOEntityDescription, id: MIOUUID):string {
        return entity.name + "#" + id.UUIDString;
    }

    private _uuid_from_string(str:string):MIOUUID {
        let uuid = new MIOUUID();
        uuid.initWithUUIDString(str);
        return uuid;
    }

    
    public insertEntity(entity: MIOEntityDescription, id: MIOUUID|string, version:number, values: any): MWSEntityCacheObject 
    {        
        let uuid = typeof id == "string" ? this._uuid_from_string(id) : id as MIOUUID;

        let obj = this.entityForID(entity, uuid);
        if (obj != null) { return obj; }

        obj = new MWSEntityCacheObject();
        obj.id = uuid;
        obj.entity = entity;        
        obj.values = values;
        obj.version = version;

        this._entities_by_hash[obj.hash] = obj;

        let parent:MIOEntityDescription|null = entity;
        while (parent != null) {
            this._entity_graph[ this._hash_key( parent, obj.id ) ] = obj.hash;
            MIOLog("Inserting REFID: " + parent.name + "://" + uuid.UUIDString);
            parent = parent.superentity;
            if (parent?.isAbstract == true) break;
        }        

        return obj;
    }

    public removeEntity(entity: MIOEntityDescription, id: MIOUUID|string): void 
    {
        let uuid = typeof id == "string" ? this._uuid_from_string(id) : id as MIOUUID;
        
        let entity_key = this._hash_key( entity, uuid );
        let hash = this._entity_graph[ entity_key ];
        if (hash == null) return;

        delete this._entities_by_hash[hash];
        delete this._entity_graph[ entity_key ];

        MIOLog("Removing REFID: " + entity.name + "://" + uuid.UUIDString);

        // remove parent entities
        let parent = entity.superentity;
        while (parent != null) {
            let key = this._hash_key( parent, uuid )
            delete this._entity_graph[key];
            MIOLog("Removing REFID: " + parent.name + "://" + uuid.UUIDString);
            parent = parent.superentity;
            if (parent?.isAbstract == true) break;
        }

        // TODO: Check if we relaly need to remove subentities
        // remove super entities
        // for (let child of entity.subentities) {
        //     let key = child.name + "#" + id.UUIDString;
        //     delete this._entity_graph[key];            
        // }        
        
    }

    public entityForID(entity: MIOEntityDescription, id: MIOUUID|string): MWSEntityCacheObject|null 
    {
        let uuid = typeof id == "string" ? this._uuid_from_string(id) : id as MIOUUID;        
        
        let parent:MIOEntityDescription|null = entity;
        let hash:string|null = null;
        while (parent != null) {
            let key = this._hash_key( parent, uuid );
            hash = this._entity_graph[key];
            if (hash != null) break;
            parent = parent.superentity;
            if (parent?.isAbstract == true) break;
        }        

        if (hash == null) return null;
        let obj = this._entities_by_hash[hash];
        if (obj != null) return obj;

        // Could not exits a hash value but not the object value
        // so we have an unlink hash object in the graph
        // we remove the object from the graph
        this.removeEntity(entity, id);

        return null;
    }

    public updateEntity(entity: MIOEntityDescription, id: MIOUUID|string, version:number, values: any): void 
    {
        let uuid = typeof id == "string" ? this._uuid_from_string(id) : id as MIOUUID;
        
        let entity_key = this._hash_key( entity, uuid );
        let hash = this._entity_graph[ entity_key ];
        let update_graph = false;
        if (hash == null) {
            // Find the super entity
            update_graph = true;
            let parent = entity.superentity;        
            while (parent != null) {
                let key = this._hash_key( parent, uuid );
                hash = this._entity_graph[key];
                if (hash != null) break;
                parent = parent.superentity;
                if (parent?.isAbstract == true) break;
            }
        }

        if (hash == null) { 
            console.log("MWSEntityCache: updateEntity: Entity not found");
            return;
        }

        let obj = this._entities_by_hash[hash];
        obj.updateValues(values, version);

        // Update new graph
        if (update_graph) {
            obj.entity = entity;
            let parent:MIOEntityDescription|null = entity;
            while (parent != null) {
                let key = this._hash_key( parent, uuid );
                hash = this._entity_graph[key];
                if (hash != null) break;
                this._entity_graph[key] = obj.hash;
                parent = parent.superentity;
                if (parent?.isAbstract == true) break;
            }
        }        
    }
}
