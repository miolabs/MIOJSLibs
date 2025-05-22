import { MIOCoreUUID } from "../MIOCore/MIOCoreUUID";
import { MIOObject } from "./MIOObject";

/**
 * Created by godshadow on 15/3/16.
 */

export class MIOUUID extends MIOObject
{
    
    static UUID():MIOUUID {    
        let uuid = new MIOUUID();
        uuid.init();

        return uuid;
    }

    private _uuid:MIOCoreUUID;
    init(){
        this._uuid = new MIOCoreUUID();
        this._uuid.init();
    }

    initWithUUIDString(uuid:string){
        this._uuid = new MIOCoreUUID();
        this._uuid.initWithString(uuid);
    }

    get UUIDString():string{
        return this._uuid.UUIDString();
    }

    isEqualToUUID(uuid:MIOUUID):boolean {
        return this._uuid.isEqualToUUID(uuid._uuid);
    }

    isEqualToUUIDString(uuid:string):boolean {
        return this._uuid.isEqualToUUIDString(uuid);
    }
}
