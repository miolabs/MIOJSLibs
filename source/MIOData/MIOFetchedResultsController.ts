import { MIOObject, MIONotificationCenter, MIONotification, MIOSet, MIOIndexPath } from "../MIOFoundation";
import { MIOFetchRequest } from "./MIOFetchRequest";
import { MIOManagedObjectContext, MIOManagedObjectContextDidSaveNotification, MIOManagedObjectContextObjectsDidChange, MIOUpdatedObjectsKey, MIOInsertedObjectsKey, MIODeletedObjectsKey, MIORefreshedObjectsKey } from "./MIOManagedObjectContext";
import { MIOManagedObject } from "./MIOManagedObject";
import { _MIOSortDescriptorSortObjects } from "../MIOFoundation/MIOSortDescriptor";

/**
 * Created by godshadow on 12/4/16.
 */

export enum MIOFetchedResultsChangeType {
    Insert,
    Delete,
    Update,
    Move
}

export interface MIOFetchedResultsControllerDelegate {
    controllerWillChangeContent?(controller:MIOFetchedResultsController);
    controllerDidChangeContent?(controller:MIOFetchedResultsController);

    didChangeSection?(controller:MIOFetchedResultsController, sectionInfo, sectionIndex, changeType:MIOFetchedResultsChangeType);
    didChangeObject?(controller:MIOFetchedResultsController, object, indexPath:MIOIndexPath, changeType:MIOFetchedResultsChangeType, newIndexPath:MIOIndexPath);
}

export class MIOFetchSection extends MIOObject
{
    objects = [];

    numberOfObjects(){
        return this.objects.length;
    }
}

export class MIOFetchedResultsController extends MIOObject
{
    sections = [];
    
    fetchRequest:MIOFetchRequest = null;
    managedObjectContext:MIOManagedObjectContext  = null;
    sectionNameKeyPath = null;
    
    private registerObjects = {};

    initWithFetchRequest(request, managedObjectContext, sectionNameKeyPath?){
        this.fetchRequest = request;
        this.managedObjectContext = managedObjectContext;
        this.sectionNameKeyPath = sectionNameKeyPath;
    }

    private _delegate:MIOFetchedResultsControllerDelegate = null;
    get delegate():MIOFetchedResultsControllerDelegate{
        return this._delegate;
    }
    set delegate(delegate:MIOFetchedResultsControllerDelegate){
        this._delegate = delegate;

        // TODO: Add and remove notification observer

        if (delegate != null) {
            MIONotificationCenter.defaultCenter().addObserver(this, MIOManagedObjectContextDidSaveNotification, function(notification:MIONotification){

                let moc:MIOManagedObjectContext = notification.object;
                if (moc !== this.managedObjectContext) return;

                let ins_objs = notification.userInfo[MIOInsertedObjectsKey];
                let upd_objs = notification.userInfo[MIOUpdatedObjectsKey];
                let del_objs = notification.userInfo[MIODeletedObjectsKey];
                
                let entityName = this.fetchRequest.entityName;                
                
                if (ins_objs[entityName] != null || upd_objs[entityName] != null || del_objs[entityName] != null)
                    this.updateContent(ins_objs[entityName]?ins_objs[entityName]:[], 
                                        upd_objs[entityName]?upd_objs[entityName]:[], 
                                        del_objs[entityName]?del_objs[entityName]:[]);
            });

            MIONotificationCenter.defaultCenter().addObserver(this, MIOManagedObjectContextObjectsDidChange, function(notification:MIONotification) {

                let moc:MIOManagedObjectContext = notification.object;
                if (moc !== this.managedObjectContext) return;

                let refreshed = notification.userInfo[MIORefreshedObjectsKey];
                if (refreshed == null) return;
                let entityName = this.fetchRequest.entityName;                
                
                let objects = refreshed[entityName];
                if (objects == null) return;

                this.refreshObjects(objects);
            });
        }
        else {
            MIONotificationCenter.defaultCenter().removeObserver(this, MIOManagedObjectContextDidSaveNotification);
            MIONotificationCenter.defaultCenter().removeObserver(this, MIOManagedObjectContextObjectsDidChange);
        }
    }

    // TODO: Replace resultObjects to fetchedObjects
    resultObjects = [];
    get fetchedObjects(){
        return this.resultObjects;
    }

    performFetch(){
        this.resultObjects = this.managedObjectContext.executeFetch(this.fetchRequest);
        this._splitInSections();

        return this.resultObjects;
    }

    private processObject(object:MIOManagedObject, result:boolean){

        if (result == true) {
            let ref = object.objectID._getReferenceObject();
            if (this.registerObjects[ref] == null){
                this.resultObjects.push(object);
                this.registerObjects[ref] = object;
            }    
        }
        else {
            let ref = object.objectID._getReferenceObject();
            if (this.registerObjects[ref] != null){
                this.resultObjects.removeObject(object);
                delete this.registerObjects[ref];
            }
        }
    }

    private checkObjects(objects){
        let predicate = this.fetchRequest.predicate;        
        for (let count = 0; count < objects.length; count++){
            let obj = objects.objectAtIndex(count);
            if (predicate != null) {
                let result = predicate.evaluateObject(obj);
                this.processObject(obj, result);
            }
            else {
                this.processObject(obj, true);
            }
        }        
    }

    private refreshObjects(objects:MIOSet){        
        this.checkObjects(objects);
        this.resultObjects = _MIOSortDescriptorSortObjects(this.resultObjects, this.fetchRequest.sortDescriptors);
        this._splitInSections();
        this._notify();
    }

    private updateContent(inserted, updated, deleted){
        
        this.checkObjects(inserted);
        this.checkObjects(updated);        
                
        // Process inserted objects        
        // for(var i = 0; i < inserted.length; i++) {
        //     let o = inserted[i];
        //     this.resultObjects.push(o);
        // }

        // Process updated objects
        // TODO: Check if the sort descriptor keys changed. If not do nothing becuse the objects are already
        //       in the fetched objects array

        // Process delete objects
        for(let i = 0; i < deleted.length; i++) {
            let o = deleted[i];
            let index = this.resultObjects.indexOf(o);
            if (index != -1){
                this.resultObjects.splice(index, 1);
                let ref = o.objectID._getReferenceObject();
                delete this.registerObjects[ref];
            }
        }        

        this.resultObjects = _MIOSortDescriptorSortObjects(this.resultObjects, this.fetchRequest.sortDescriptors);        
        this._splitInSections();
        this._notify();
    }

    private _notify(){
        if (this._delegate == null) return;
        
        if (typeof this._delegate.controllerWillChangeContent === "function")
            this._delegate.controllerWillChangeContent(this);

        for (let sectionIndex = 0; sectionIndex < this.sections.length; sectionIndex++){
            let sectionInfo = this.sections[sectionIndex];
            if (typeof this._delegate.didChangeSection === "function")
                this._delegate.didChangeSection(this, sectionInfo, sectionIndex, MIOFetchedResultsChangeType.Insert);

            if (typeof this._delegate.didChangeObject === "function") {                    
                let items = sectionInfo.objects;
                for (let index = 0; index < items.length; index++) {
                    let obj = items[index];
                    let newIndexPath = MIOIndexPath.indexForRowInSection(index, sectionIndex);
                    this._delegate.didChangeObject(this, obj, null, MIOFetchedResultsChangeType.Insert, newIndexPath);
                }
            }
        }

        if (typeof this._delegate.controllerDidChangeContent === "function")
            this._delegate.controllerDidChangeContent(this);
    }

    private _splitInSections(){
        this.sections = [];

        if (this.sectionNameKeyPath == null){
            let section = new MIOFetchSection();
            //section.objects = this.resultObjects;
            for (let index = 0; index < this.resultObjects.length; index++){
                let obj:MIOManagedObject = this.resultObjects[index];                
                // Cache to for checking updates
                let ref = obj.objectID._getReferenceObject();
                this.registerObjects[ref] = obj;  
                section.objects.push(obj);              
            }

            this.sections.push(section);
        }
        else{
            let currentSection = null;
            let currentSectionKeyPathValue = null;

            if (this.resultObjects.length == 0) return;

            // Set first object
            let firstObj:MIOManagedObject = this.resultObjects[0];  
            currentSection = new MIOFetchSection();
            this.sections.push(currentSection);
            currentSectionKeyPathValue = firstObj.valueForKey(this.sectionNameKeyPath);                ;    
            // Cache to for checking updates
            let reference = firstObj.objectID._getReferenceObject();
            this.registerObjects[reference] = firstObj;
            currentSection.objects.push(firstObj);
            
            for (let index = 1; index < this.resultObjects.length; index++){
                let obj:MIOManagedObject = this.resultObjects[index];                
                // Cache to for checking updates
                let ref = obj.objectID._getReferenceObject();
                this.registerObjects[ref] = obj;

                let value = obj.valueForKey(this.sectionNameKeyPath);                

                if (currentSectionKeyPathValue != value) {
                    currentSection = new MIOFetchSection();
                    this.sections.push(currentSection);
                    currentSectionKeyPathValue = value;
                }

                currentSection.objects.push(obj);
            }
        }
    }

    objectAtIndexPath(indexPath:MIOIndexPath){
        let section = this.sections[indexPath.section];
        let object = section.objects[indexPath.row];
        return object;
    }

}
