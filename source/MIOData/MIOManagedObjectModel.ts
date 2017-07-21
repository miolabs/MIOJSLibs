
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

class MIOManagedObjectModel extends MIOObject
{
    private _entitiesByName = {};

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
    }

    parserDidEndElement(parser:MIOXMLParser, element:string){
        
        console.log("XMLParser: End element (" + element + ")");
    }

    private _parseEntity(entity){

        var e = new MIOEntityDescription();
        e.initWithEntityName("");
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
