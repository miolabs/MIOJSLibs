
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

class MIOManagedObjectModel extends MIOObject
{
    private _entitiesByName = {};

    static entityForNameInManagedObjectContext(entityName, context:MIOManagedObjectContext):MIOEntityDescription{
        
        // HACK!
        // TODO: We need to build a object model file to read tihs values

        var mom = context.persistentStoreCoordinator.managedObjectModel;
        var entity = mom.entitiesByName[entityName];
        if (entity == null) {
            
            entity = new MIOEntityDescription();
            entity.initWithEntityName(entityName);

            mom._setEntity(entity);
        }

        return entity;
    }

    //TODO: Remove this function
    _setEntity(entity:MIOEntityDescription) {

        this._entitiesByName[entity.managedObjectClassName] = entity;
    }

    setEntitiesForConfiguration(entities, configuration:string) {

        //TODO
    }

    get entitiesByName() {
        return this._entitiesByName;
    }
}
