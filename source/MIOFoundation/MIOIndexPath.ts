
/// <reference path="MIOObject.ts" />

function MIOIndexPathEqual(indexPath1:MIOIndexPath, indexPath2:MIOIndexPath):Boolean {

    //TODO: CHECK REAL INDEX PATH
    if (indexPath1 == null || indexPath2 == null) return false;

    if (indexPath1.section == indexPath2.section
        && indexPath1.row == indexPath2.row){
            return true;
    }

    return false;
}

class MIOIndexPath extends MIOObject
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

    get column(){
        return this.indexes[2];
    }
}