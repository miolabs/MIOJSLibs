import { MIOCoreUUIDcreate } from "../MIOCore/MIOCoreUUID";
import { MIOObject } from "./MIOObject";

/**
 * Created by godshadow on 15/3/16.
 */

export class MIOUUID extends MIOObject
{
    // Deprecated
    static UUID():MIOUUID{
        let uuid = new MIOUUID();
        uuid.init();

        return uuid;
    }

    private _uuid = null;
    init(){
        this._uuid = MIOCoreUUIDcreate();
    }

    get UUIDString():string{
        return this._uuid;
    }

}
