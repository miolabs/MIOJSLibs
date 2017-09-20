
/// <reference path="../MIOFoundation/MIOFoundation.ts" />


class MIORelationshipDescription extends MIOObject
{
    name:string = null;

    destinationEntityName:string = null;
    destinationEntity:MIOEntityDescription = null;
    inverseRelationship:MIORelationshipDescription = null;
    isToMany = false;

    private _serverName:string = null;

    initWithName(name:string, destinationEntityName:string, isToMany:boolean, serverName?:string){

        this.init();
        this.name = name;
        this.destinationEntityName = destinationEntityName;
        this.isToMany = isToMany;
        if (serverName != null)
            this._serverName = serverName;
    }

    get serverName(){
        if (this._serverName == null) {    
            return this.name;
        }
        
        return this._serverName;
    }
}