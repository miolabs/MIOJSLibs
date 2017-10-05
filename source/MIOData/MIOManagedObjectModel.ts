
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

class MIOManagedObjectModel extends MIOObject
{
    private _entitiesByName = {};

    private currentEntity:MIOEntityDescription = null;

    static entityForNameInManagedObjectContext(entityName, context:MIOManagedObjectContext):MIOEntityDescription{
        
        var mom = context.persistentStoreCoordinator.managedObjectModel;
        var entity = mom.entitiesByName[entityName];
        if (entity == null) {
        
            // HACK!
            // TODO: We need to build a object model file to read this values

            entity = new MIOEntityDescription();
            entity.initWithEntityName(entityName);

            mom._setEntity(entity);
        }

        return entity;
    }

    initWithContentsOfURL(url:MIOURL){

        let request = MIOURLRequest.requestWithURL(url);

        let uc = new MIOURLConnection();
        uc.initWithRequest(request, this);
    }

    connectionDidReceiveText(urlConnection, text){
        
        let parser = new MIOXMLParser();
        parser.initWithString(text, this);
        parser.parse();        
    }

    // XML Parser delegate
    parserDidStartElement(parser:MIOXMLParser, element:string, attributes){

        console.log("XMLParser: Start element (" + element + ")");        
        
        if (element == "entity"){

            let name = attributes["name"];
            
            this.currentEntity = new MIOEntityDescription();
            this.currentEntity.initWithEntityName(name);
        }
        else if (element == "attribute") {

            let name = attributes["name"];
            let type = attributes["attributeType"];
            let serverName = attributes["serverName"];            
            let optional = attributes["optional"] != null ? attributes["optional"].toLowerCase() : "yes";            
            let optionalValue = optional == "no" ? false : true;

            this._addAttribute(name, type, optionalValue, serverName);
        }        
        else if (element == "relationship") {
        
            let name = attributes["name"];
            let destinationEntityName = attributes["destinationEntity"];
            let toMany = attributes["toMany"];
            let serverName = attributes["serverName"];            
            this._addRelationship(name, destinationEntityName, toMany, serverName);
        }
    }

    parserDidEndElement(parser:MIOXMLParser, element:string){
        
        console.log("XMLParser: End element (" + element + ")");

        if (element == "entity") {
            let entity = this.currentEntity;
            this._entitiesByName[entity.managedObjectClassName] = entity;
            this.currentEntity = null;
        }
    }

    parserDidEndDocument(parser:MIOXMLParser){

        // Check every relation ship and assign the right destination entity
        for (var entityName in this._entitiesByName) {

            let e:MIOEntityDescription = this._entitiesByName[entityName];
            for (var index = 0; index < e.relationships.length; index++) {
                let r:MIORelationshipDescription = e.relationships[index];
                
                if (r.destinationEntity == null){
                    let de = this._entitiesByName[r.destinationEntityName];
                    r.destinationEntity = de;
                }
            }
        }

        console.log("datamodel.xml parser finished");
    }

    private _addAttribute(name, type, optional, serverName){

        var attrType = null;
        switch(type){

            case "Boolean":
                attrType = MIOAttributeType.Boolean;
                break;

            case "Integer":
                attrType = MIOAttributeType.Integer;
                break;

            case "Float":
                attrType = MIOAttributeType.Float;
                break;

            case "Number":
                attrType = MIOAttributeType.Number;
                break;

            case "String":
                attrType = MIOAttributeType.String;
                break;

            case "Date":
                attrType = MIOAttributeType.Date;
                break;
        }
        
        this.currentEntity.addAttribute(name, attrType, null, optional, serverName);
    }

    private _addRelationship(name:string, destinationEntityName:string, toMany:string, serverName:string){

        var isToMany = false;
        if (toMany.toLocaleLowerCase() == "yes" || toMany.toLocaleLowerCase() == "true"){
            isToMany = true;
        }
        this.currentEntity.addRelationship(name, destinationEntityName, isToMany, serverName);
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
