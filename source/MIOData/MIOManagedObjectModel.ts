import { MIOObject, MIOURL, MIOURLConnection, MIOXMLParser, MIOURLRequest, MIODateFromString, MIOLog, MIONotificationCenter, MIOBundle, MIOPropertyListSerialization } from "../MIOFoundation";
import { MIORelationshipDescription, MIODeleteRule } from "./MIORelationshipDescription";
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
            throw new Error(`MIOManagedObjectModel: Unknown entity (${entityName})`);
        }
        
        return entity;
    }

    private _namespace:string = null;
    initWithContentsOfURL(url:MIOURL){

        // check if we already have it
        let type = url.absoluteString.match(/\.[0-9a-z]+$/i)[0].substring(1);
        let resource = url.absoluteString.substring(0, url.absoluteString.length - type.length - 1);

        if (type == "xcdatamodeld") {
            // Core Data Bundle
            let versionFile = url.absoluteString + "/xccurrentversion";
            let versionData = MIOBundle.mainBundle().pathForResourceOfType(versionFile, null);
            let versionInfo = MIOPropertyListSerialization.propertyListWithData(versionData, 0, 0, null);
            
            resource = url.absoluteString + "/" + versionInfo["_XCCurrentVersionName"] + "/contents";
            type = "xml";

            const components = versionInfo["_XCCurrentVersionName"].split(".");
            this._namespace = components[0];
        }

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
            let classname = attributes["representedClassName"] || name;
            let parentName = attributes["parentEntity"]; 
            let is_abstract = attributes["isAbstract"] ? attributes["isAbstract"] : "NO";

            this.currentEntity = new MIOEntityDescription();
            let cs = this._namespace == null ? classname : this._namespace + "." + classname;
            this.currentEntity.initWithEntityName(name, null, this, cs);
            this.currentEntity.parentEntityName = parentName;
            this.currentEntity.isAbstract = (is_abstract.toLowerCase() == "yes");            

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
            let deleteRule = attributes["deletionRule"];
            this._addRelationship(name, destinationEntityName, toMany, serverName, inverseName, inverseEntity, optional, deleteRule);
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
            this._entitiesByName[entity.name] = entity;
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
                if (defaultValueString != null) defaultValue = (defaultValueString.toLocaleLowerCase() == "true" || defaultValueString.toLocaleLowerCase() == "yes") ? true : false;
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
            case "Double":
            case "Decimal":
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

            case "Transformable":
                attrType = MIOAttributeType.Transformable;
                if (defaultValueString != null) defaultValue = defaultValueString;
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

    private _addRelationship(name:string, destinationEntityName:string, toMany:string, serverName:string, inverseName:string, inverseEntity:string, optional:string, deletionRule:string){

        MIOLog((serverName != null ? serverName : name) + " (" + destinationEntityName + ", optional=" + optional + ", inverseEntity: " + inverseEntity + ", inverseName: "  + inverseName + ")");

        let isToMany = false;
        if (toMany != null && (toMany.toLocaleLowerCase() == "yes" || toMany.toLocaleLowerCase() == "true")){
            isToMany = true;
        }        

        let opt = true;
        if (optional != null && (optional.toLocaleLowerCase() == "no" || optional.toLocaleLowerCase() == "false")) opt = false;

        let del_rule = MIODeleteRule.noActionDeleteRule;
        switch(deletionRule){
            case "Nullify": del_rule = MIODeleteRule.nullifyDeleteRule; break;
            case "Cascade": del_rule = MIODeleteRule.cascadeDeleteRule; break;
        }

        this.currentEntity.addRelationship(name, destinationEntityName, isToMany, serverName, inverseName, inverseEntity, opt, del_rule);
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
