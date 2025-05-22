import { MIOPropertyDescription } from "./MIOPropertyDescription";
import { MIOEntityDescription } from "./MIOEntityDescription";

export enum MIODeleteRule {
    noActionDeleteRule,
    nullifyDeleteRule,
    cascadeDeleteRule,
    denyDeleteRule
}

export class MIORelationshipDescription extends MIOPropertyDescription
{
    destinationEntityName:string;
    destinationEntity:MIOEntityDescription|null = null;
    inverseRelationship:MIORelationshipDescription|null = null;
    isToMany = false;
    deleteRule = MIODeleteRule.noActionDeleteRule;

    private _serverName:string|null = null;

    inverseName:string|null = null;
    inverseEntityName:string|null = null;

    initWithName(name:string, destinationEntityName:string, isToMany:boolean, serverName?:string|null, inverseName?:string|null, inverseEntityName?:string|null){

        this.init();
        this.name = name;
        this.destinationEntityName = destinationEntityName;
        this.isToMany = isToMany;        
        this._serverName = serverName ?? null;
        this.inverseName = inverseName ?? null;
        this.inverseEntityName = inverseEntityName ?? null;
        // if (inverseName != null && inverseEntityName != null){
        //     let ir = new MIORelationshipDescription();
        //     ir.initWithName(inverseName, inverseEntityName, false); 
        //     this.inverseRelationship = ir;
        // }
    }

    get serverName(){
        if (this._serverName == null) {    
            return this.name;
        }
        
        return this._serverName;
    }
}