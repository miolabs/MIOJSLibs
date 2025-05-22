export class MIOCoreUUID
{
    private bytes:Uint8Array;
        
    init() {
        this.bytes = new Uint8Array(36);
    
        let d = new Date().getTime();    
        let hexDigits = "0123456789abcdef";
        for (let i = 0; i < 36; i++) {
            this.bytes[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1).charCodeAt(0);
        }
        this.bytes[14] = "4".charCodeAt(0);  // bits 12-15 of the time_hi_and_version field to 0010
        this.bytes[19] = hexDigits.substr((this.bytes[19] & 0x3) | 0x8, 1).charCodeAt(0);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        this.bytes[8] = this.bytes[13] = this.bytes[18] = this.bytes[23] = "-".charCodeAt(0);
    }

    initWithString(uuid:string) {
        this.bytes = new Uint8Array(36);
        let lower_string = uuid.toLowerCase();
        for (let i = 0; i < 36; i++) {
            this.bytes[i] = lower_string.charCodeAt(i);
        }
    }

    isEqualToUUID(uuid:MIOCoreUUID):boolean {
        for (let i = 0; i < 36; i++) {
            if (this.bytes[i] != uuid.bytes[i]) return false;
        }
        return true;
    }

    isEqualToUUIDString(str:string):boolean {
        let lower_string = str.toLowerCase();
        for (let i = 0; i < 36; i++) {
            if (this.bytes[i] != lower_string.charCodeAt(i) ) return false;
        }
        return true;
    }

    UUIDString():string {
        let s = "";
        for (let i = 0; i < 36; i++) {
            s += String.fromCharCode(this.bytes[i]);
        }
        return s;
    }
}

/*
export function MIOCoreUUIDcreate() : string {
    let d = new Date().getTime();
    let s = [];
    let hexDigits = "0123456789abcdef";
    for (let i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    let uuid = s.join("");
    return uuid.toUpperCase();
}
    */
