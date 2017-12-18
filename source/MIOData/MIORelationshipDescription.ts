
/// <reference path="../MIOFoundation/MIOFoundation.ts" />


class MIORelationshipDescription extends MIOPropertyDescription
{
    destinationEntityName:string = null;
    destinationEntity:MIOEntityDescription = null;
    inverseRelationship:MIORelationshipDescription = null;
    isToMany = false;

    private _serverName:string = null;

    initWithName(name:string, destinationEntityName:string, isToMany:boolean, serverName?:string, inverseName?:string, inverseEntity?:string){

        this.init();
        this.name = name;
        this.destinationEntityName = destinationEntityName;
        this.isToMany = isToMany;
        if (serverName != null)
            this._serverName = serverName;
        if (inverseName != null && inverseEntity != null){
            var ir = new MIORelationshipDescription();
            ir.initWithName(inverseName, inverseEntity, false);
            this.inverseRelationship = ir;
        }
    }

    get serverName(){
        if (this._serverName == null) {    
            return this.name;
        }
        
        return this._serverName;
    }
}