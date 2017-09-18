
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
            
            this._addAttribute(name, type, serverName);
        }        
        else if (element == "relationship") {
        
            let name = attributes["name"];
            this._addRelationship(name);
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

    private _addAttribute(name, type, serverName){

        var attrType = null;
        switch(type){

            case "Boolean":
                attrType = MIOAttributeType.Boolean;
                break;

            case "Number":
                attrType = MIOAttributeType.Number;
                break;

            case "String":
                attrType = MIOAttributeType.String;
                break;
        }
        
        this.currentEntity.addAttribute(name, attrType, null, serverName);
    }

    private _addRelationship(name){

        this.currentEntity.addRelationship(name);
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
