
/// <reference path="MIOPersistentStore.ts" />
/// <reference path="MIOFetchRequest.ts" />

let MIOWebServicePersistentStoreType = "kMIOWebServicePersistentStoreType";

enum MIOWebServicePersistentStoreStatus{
    None,
    Downloading,    
    Ready
}

class MIOWebServicePersistentStore extends MIOPersistentStore
{ 
    get type(){ return MIOWebServicePersistentStoreType;}
    private entities = {};

    // HACK: token must be removed and change for setMedata function instead
    token = null;    

    didAddToPersistentStoreCoordinator(psc:MIOPersistentStoreCoordinator){
        //TODO: Open miorpc to get notification when some the server update his data from other instances
    }

    removePersistentStore(psc:MIOPersistentStoreCoordinator){
        //TODO: Close miorpc
    }

    executeRequest(persistentStoreRequest:MIOPersistentStoreRequest, context:MIOManagedObjectContext){
     
        if(persistentStoreRequest.requestType == MIORequestType.Fetch) {            
            let request = persistentStoreRequest as MIOFetchRequest;
            
            if (request.resultType == MIOFetchRequestResultType.MIOManagedObject) {
               return this.fetchObjects(request, context);
            }
        }
        return [];
    }

    private fetchObjects(request:MIOFetchRequest, context:MIOManagedObjectContext){

        var entity = this.entities[request.entityName];

        if (entity == null){
            // Create empty entity
            entity = {};
            entity["Name"] = request.entityName;
            entity["Status"] = MIOWebServicePersistentStoreStatus.None;
            entity["Objects"] = [];
            this.entities[request.entityName] = entity;
            this.downloadObjectsByEntity(entity, context);
            return [];
        }
        
        if (entity["Status"] = MIOWebServicePersistentStoreStatus.Downloading){
            return [];
        }

        // TODO: Check with the server the last update fo the entity!

        // Means the status is Ready
        var objs = entity["Objects"];
        objs = this.filterObjects(objs, request.predicate);
        objs = this.sortObjects(objs, request.sortDescriptors);
        
        return objs;
    }

    private filterObjects(objs, predicate)
    {
        if (objs == null)
            return [];

        var resultObjects = null;

        if (predicate == null)
            resultObjects = objs;
        else
        {
            resultObjects = objs.filter(function(obj){

                var result = predicate.evaluateObject(obj);
                if (result)
                    return obj;
            });
        }

        return resultObjects;
    }

    private sortObjects(objs, sortDescriptors)
    {
        if (sortDescriptors == null)
            return objs;

        var instance = this;
        var resultObjects = objs.sort(function(a, b){

            return instance.sortObjects2(a, b, sortDescriptors, 0);
        });

        return resultObjects;
    }

    private sortObjects2(a, b, sortDescriptors, index)
    {
        if (index >= sortDescriptors.length)
            return 0;

        var sd = sortDescriptors[index];
        var key = sd.key;

        if (a[key] == b[key]) {

            if (a[key]== b[key])
            {
                return this.sortObjects2(a, b, sortDescriptors, ++index);
            }
            else if (a[key] < b[key])
                return sd.ascending ? -1 : 1;
            else
                return sd.ascending ? 1 : -1;
        }
        else if (a[key] < b[key])
            return sd.ascending ? -1 : 1;
        else
            return sd.ascending ? 1 : -1;

    }

    private downloadObjectsByEntity(entity, context:MIOManagedObjectContext){

        let entityName = entity["Name"];
        let url = this.url + "/" + entityName;
        let request = MIOURLRequest.requestWithURL(MIOURL.urlWithString(url));
        request.httpMethod = "GET";
        
        // HACK: token must be removed and change for setMedata function instead
        if (this.token != null)
            request.setHeaderField("Authorization", "Bearer " + this.token);
        
        //request.body = JSON.stringify(this.params);

        var urlConnection = new MIOURLConnection();
        urlConnection.initWithRequestBlock(request, this, function(statusCode, data){
                        
            entity["Status"] = MIOWebServicePersistentStoreStatus.None;
            
            var json = null;
            if (data != null)
                json = JSON.parse(data.replace(/(\r\n|\n|\r)/gm, ""));
            if (statusCode == 200){
                this.parseServerObjects(entity, json, context);
                entity["Status"] = MIOWebServicePersistentStoreStatus.Ready;
            }                
            else if (statusCode == 401) {                
                let error = {"Code": statusCode, "error" : "Invalid token. The user need to login again"};
                MIONotificationCenter.defaultCenter().postNotification("MIOWebServicePersistentStoreError", error);
            }
            else if (statusCode == 422) {
                let error = {"Code": statusCode, "error" : "Unprocessable Entity. Check the value of the parameters you send it"};
                MIONotificationCenter.defaultCenter().postNotification("MIOWebServicePersistentStoreError", error);
            }
            else {            
                let error = {"Code": statusCode, "error" : "Conection error. Check internet and server conections"};                
                MIONotificationCenter.defaultCenter().postNotification("MIOWebServicePersistentStoreError", error);
            }                        
        });    
    }

    private parseServerObjects(entity, json, context:MIOManagedObjectContext){

        let entityName = entity["Name"];
        let psc = this.persistentStoreCoordinator;
        let mom = psc.managedObjectModel;
        let ed:MIOEntityDescription = mom.entitiesByName[entityName];
        
        var items = json["data"];
        for(var i = 0; i < items.length; i++) {
            var item = items[i];
            var mo:MIOManagedObject = MIOEntityDescription.insertNewObjectForEntityForName(entityName, context);
            for (var j = 0; j < ed.attributes.length; j++){
                let attr:MIOAttributeDescription = ed.attributes[j];
                this.parseValueForAttribute(attr, item[attr.serverName], mo);
            }
        }
    }

    private parseValueForAttribute(attribute:MIOAttributeDescription, value:string, object){
        
        if (value == null) return;
        let type = attribute.attributeType;
        
        if (type = MIOAttributeType.Boolean) {
            let lwValue = value.toLocaleLowerCase();
            if (lwValue == "yes" || lwValue == "true" || lwValue == "1") 
                object[attribute.name] = true;
            else 
                object[attribute.name] = false;
        }
        else if (type = MIOAttributeType.Integer) {
            object[attribute.name] = parseInt(value);
        }
        else if (type = MIOAttributeType.Float) {
            object[attribute.name] = parseFloat(value);
        }
        else if (type = MIOAttributeType.String) {
            object[attribute.name] = value;
        }
    }

}