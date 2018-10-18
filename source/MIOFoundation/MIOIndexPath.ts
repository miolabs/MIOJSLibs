import { MIOObject } from "./MIOObject";

export function MIOIndexPathEqual(indexPath1:MIOIndexPath, indexPath2:MIOIndexPath):boolean {

    //TODO: CHECK REAL INDEX PATH
    if (indexPath1 == null || indexPath2 == null) return false;

    if (indexPath1.section == indexPath2.section
        && indexPath1.row == indexPath2.row){
            return true;
    }

    return false;
}

export class MIOIndexPath extends MIOObject
{
    static indexForRowInSection(row:number, section:number){
        let ip = new MIOIndexPath();
        ip.add(section);
        ip.add(row);
        return ip;
    }

    static indexForColumnInRowAndSection(column:number, row:number, section:number){
        let ip = MIOIndexPath.indexForRowInSection(row, section);
        ip.add(column);
        return ip;
    }

    private indexes = [];

    add(value:number){
        this.indexes.push(value);
    }

    get section(){
        return this.indexes[0];
    }

    get row(){
        return this.indexes[1];
    }

    get item(){
        return this.indexes[1];
    }

    get column(){
        return this.indexes[2];
    }

    isEqualToIndexPath(indexPath:MIOIndexPath){
        return MIOIndexPathEqual(this, indexPath);
    }
}