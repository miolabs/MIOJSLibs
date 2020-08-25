import { MIOObject, MIOURL, MIOURLConnection, MIOXMLParser, MIOURLRequest, MIODateFromString, MIOLog, MIONotificationCenter, MIOBundle } from "../MIOFoundation";
import { MIORelationshipDescription } from "./MIORelationshipDescription";
import { MIOEntityDescription } from "./MIOEntityDescription";
import { MIOAttributeType } from "./MIOAttributeDescription";
import { MIOManagedObjectContext } from "./MIOManagedObjectContext";


export class MIOManagedObjectModel extends MIOObject
{    
    private _entitiesByName = {};
    private _entitiesByConfigName = {};
    
    static entityForNameInManagedObjectContext(entityName, context:MIOManagedObjectContext):MIOEntityDescription{
        
        let mom = context.persistentStoreCoordinator.managedObjectModel;
        let entity = mom.entitiesByName[entityName];
        
        if (entity == null) {
            throw new Error(`MIOManagedObjectModel: Unkown entity (${entityName})`);
        }
        
        return entity;
    }

    initWithContentsOfURL(url:MIOURL){

        // check if we already have it
        let type = url.absoluteString.match(/\.[0-9a-z]+$/i)[0].substring(1)
        let resource = url.absoluteString.substring(0, url.absoluteString.length - type.length - 1);

        let data = MIOBundle.mainBundle().pathForResourceOfType(resource, type);
        if (data != null) {
            this.parseContents(data);
            return;
        }

        // Download the file
        let request = MIOURLRequest.requestWithURL(url);

        let uc = new MIOURLConnection();
        uc.initWithRequest(request, this);
    }

    connectionDidReceiveText(urlConnection, data){        
        this.parseContents(data)
    }

    private parseContents(contents) {
        let parser = new MIOXMLParser();
        parser.initWithString(contents, this);
        parser.parse();                
    }

    // #region XML Parser delegate
    private currentEntity:MIOEntityDescription = null;
    private currentConfigName:string = null;

    // XML Parser delegate
    parserDidStartElement(parser:MIOXMLParser, element:string, attributes){

        //console.log("XMLParser: Start element (" + element + ")");        
        
        if (element == "entity"){

            let name = attributes["name"];
            let parentName = attributes["parentEntity"];            

            this.currentEntity = new MIOEntityDescription();
            this.currentEntity.initWithEntityName(name, null, this);
            this.currentEntity.parentEntityName = parentName;

            MIOLog("\n\n--- " + name);
        }
        else if (element == "attribute") {

            let name = attributes["name"];
            let type = attributes["attributeType"];
            let serverName = attributes["serverName"];            
            let optional = attributes["optional"] != null ? attributes["optional"] : "YES";            
            let syncable = attributes["syncable"];
            let defaultValueString = attributes["defaultValueString"];
            this._addAttribute(name, type, optional, serverName, syncable, defaultValueString);
        }        
        else if (element == "relationship") {
        
            let name = attributes["name"];
            let destinationEntityName = attributes["destinationEntity"];
            let toMany = attributes["toMany"];
            let serverName = attributes["serverName"]; 
            let optional = attributes["optional"] != null ? attributes["optional"] : "YES";                                   
            let inverseName = attributes["inverseName"];
            let inverseEntity = attributes["inverseEntity"];            
            this._addRelationship(name, destinationEntityName, toMany, serverName, inverseName, inverseEntity, optional);
        }
        else if (element == "configuration") {
            this.currentConfigName = attributes["name"];
        }        
        else if (element == "memberEntity") {
            let entityName = attributes["name"];
            let entity = this._entitiesByName[entityName];
            this._setEntityForConfiguration(entity, this.currentConfigName);
        }        

    }

    parserDidEndElement(parser:MIOXMLParser, element:string){
        
        //console.log("XMLParser: End element (" + element + ")");

        if (element == "entity") {
            let entity = this.currentEntity;
            this._entitiesByName[entity.managedObjectClassName] = entity;
            this.currentEntity = null;
        }
    }

    parserDidEndDocument(parser:MIOXMLParser){

        // Check every relation ship and assign the right destination entity
        for (let entityName in this._entitiesByName) {
            let entity = this._entitiesByName[entityName] as MIOEntityDescription;
            entity.build();
            // for (var index = 0; index < e.relationships.length; index++) {
            //     let r:MIORelationshipDescription = e.relationships[index];
                
            //     if (r.destinationEntity == null){
            //         let de = this._entitiesByName[r.destinationEntityName];
            //         r.destinationEntity = de;
            //     }
            // }
        }

        //console.log("datamodel.xml parser finished");
        MIONotificationCenter.defaultCenter().postNotification("MIOManagedObjectModelDidParseDataModel", null);
    }

    // #endregion

    private _addAttribute(name:string, type:string, optional:string, serverName:string, syncable:string, defaultValueString:string){

        MIOLog((serverName != null ? serverName : name) + " (" + type + ", optional=" + optional + (defaultValue != null? ", defaultValue: " + defaultValue : "") + "): ");

        var attrType = null;
        var defaultValue = null;
        
        switch(type){
            case "Boolean":
                attrType = MIOAttributeType.Boolean;
                if (defaultValueString != null) defaultValue = defaultValueString.toLocaleLowerCase() == "true" ? true : false;
                break;

            case "Integer":
            case "Integer 8":
            case "Integer 16":
            case "Integer 32":
            case "Integer 64":
                attrType = MIOAttributeType.Integer;
                if (defaultValueString != null) defaultValue = parseInt(defaultValueString);
                break;

            case "Float":
                attrType = MIOAttributeType.Float;
                if (defaultValueString != null) defaultValue = parseFloat(defaultValueString);
                break;

            case "Number":
                attrType = MIOAttributeType.Number;
                if (defaultValueString != null) defaultValue = parseFloat(defaultValueString);
                break;

            case "String":
                attrType = MIOAttributeType.String;
                if (defaultValueString != null) defaultValue = defaultValueString;
                break;

            case "Date":
                attrType = MIOAttributeType.Date;
                if (defaultValueString != null) defaultValue = MIODateFromString(defaultValueString); 
                break;

            default:
                MIOLog("MIOManagedObjectModel: Unknown class type: " + type);
                if (defaultValueString != null) defaultValue = defaultValueString;
                break;
        }

        let opt = true;
        if (optional != null && (optional.toLocaleLowerCase() == "no" || optional.toLocaleLowerCase() == "false")) opt = false;
        
        let sync = true;
        if (syncable != null && (syncable.toLocaleLowerCase() == "no" || optional.toLocaleLowerCase() == "false")) sync = false;

        this.currentEntity.addAttribute(name, attrType, defaultValue, opt, serverName, sync);
    }

    private _addRelationship(name:string, destinationEntityName:string, toMany:string, serverName:string, inverseName:string, inverseEntity:string, optional:string){

        MIOLog((serverName != null ? serverName : name) + " (" + destinationEntityName + ", optional=" + optional + ", inverseEntity: " + inverseEntity + ", inverseName: "  + inverseName + ")");

        let isToMany = false;
        if (toMany != null && (toMany.toLocaleLowerCase() == "yes" || toMany.toLocaleLowerCase() == "true")){
            isToMany = true;
        }        

        let opt = true;
        if (optional != null && (optional.toLocaleLowerCase() == "no" || optional.toLocaleLowerCase() == "false")) opt = false;

        this.currentEntity.addRelationship(name, destinationEntityName, isToMany, serverName, inverseName, inverseEntity, opt);
    }

    private _setEntityForConfiguration(entity, configuration:string) {
        var array = this.entitiesForConfiguration[configuration];
        if (array == null){
            array = [];
            this.entitiesForConfiguration[configuration] = array;
        }     
        array.addObject(entity);
    }

    setEntitiesForConfiguration(entities, configuration:string) {
        for (var index = 0; index < entities.length; index++){
            let entity = entities[index];
            this._setEntityForConfiguration(entity, configuration);
        }
    }

    entitiesForConfiguration(configurationName:string){        
        return this.entitiesForConfiguration[configurationName];
    }

    get entitiesByName() {
        return this._entitiesByName;
    }
}
