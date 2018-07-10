// In the browser the 'window' holds all defined global variables, that is necessary for 'MIOClassFromString'
// Here we can access them by importing all the exported functions here to use.
import * as mioclasses from "../../index.core";

export function MIOCoreGetMainBundleURLString(): string {
    return "";
}

export class MIOCoreBundle {
    baseURL: string;
    loadHMTLFromPath(path, layerID, instance, callback) {};
}

export enum MIOCoreBrowserType
{
    Safari,
    Chrome,
    IE,
    Edge,
    Other
}

export function MIOCoreGetBrowser(): MIOCoreBrowserType {
    return MIOCoreBrowserType.Other;
}

export function MIOClassFromString(name): any{
    let newClass: any = new mioclasses[name]();
    return newClass;
}
