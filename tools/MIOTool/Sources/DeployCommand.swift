//
//  Deploy.swift
//  MIOTool
//
//  Created by GodShadow on 17/05/2017.
//
//

import Foundation

func DeployCommand() {
    
    let path = GetPath();
    let appPath = GetPath() + "/app"
    let deployPath = GetPath() + "/deploy"
    
    print("Folder: \(path)")
    print("Deploying ...")
    
    RemoveFolder(atPath:deployPath)
    CreateFolder(atPath:deployPath)
    
    CopyFiles(atPath:appPath, toPath:deployPath)
}

func CreateFolder(atPath path:String) {
    
    print("Creating folder: \(path)")
    do {
        try FileManager.default.createDirectory(atPath: path, withIntermediateDirectories: true, attributes: nil)
    }
    catch {
        print("Couldn't create deploy folder")
    }
}

func CopyFiles(atPath path:String, toPath:String) {
    
    do{
        print("Path: \(path)")
        
        let directoryContents = try FileManager.default.contentsOfDirectory(atPath: path)
        for item in directoryContents{
            
            let itemPath = path + "/" + item.lowercased();
            var isDir:ObjCBool = false
            FileManager.default.fileExists(atPath: itemPath, isDirectory: &isDir)
            if (isDir.boolValue){
                
                let newDir = toPath + "/" + item.lowercased();
                CreateFolder(atPath: newDir)
                CopyFiles(atPath: itemPath, toPath: newDir);
            }
            else {
                
                CopyFile(filename: item.lowercased(), fromPath: itemPath, toPath: toPath + "/" + item.lowercased())
            }
        }
    }
    catch let error as NSError{
        print(error.localizedDescription)
    }
}

func CopyFile(filename fn: String, fromPath sp: String, toPath dp: String)
{
    
    if (fn.hasPrefix(".")) {
        print("Ignoring file: \(fn)");
        return;
    }
    
    print("Copying: \(fn)");
    do{
        let content:Data? = try Data.init(contentsOf: URL.init(fileURLWithPath: sp))
        //let content = try String.init(contentsOfFile: sp, encoding: .utf8)
        
        //let fd : Data? = content.data(using: .utf8)
        try content!.write(to: URL.init(fileURLWithPath: dp))
    }
    catch{
        print("Cann't open file")
    }
}

func RemoveFolder(atPath path:String) {
    
    print("Removing folder: \(path)")
    do{
        try FileManager.default.removeItem(atPath: path);
    }
    catch{
        print("Couldn't remove folder: \(path)");
    }
}
