//
//  CommandLine.swift
//  MIOTool
//
//  Created by GodShadow on 17/05/2017.
//
//

import Foundation

private var ArgsIndex = 1

func NextArg() -> String? {
    
    if (ArgsIndex == 0) {
        ArgsIndex = 1;
    }
    
    if (ArgsIndex >= ArgsCount()) {
        return nil
    }
    
    let value = CommandLine.arguments[ArgsIndex];        
    ArgsIndex += 1;
    
    return value;
}

func ArgsCount() -> Int {
    
    return CommandLine.arguments.count;
}


func CurrentPath() -> String {
    
    var path:String? = Option(key:"path")
    
    if (path == nil) {
        path = FileManager.default.currentDirectoryPath;
    }
    
    return path!;
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
            
            let itemPath = path + "/" + item;
            var isDir:ObjCBool = false
            FileManager.default.fileExists(atPath: itemPath, isDirectory: &isDir)
            if (isDir.boolValue){
                
                let newDir = toPath + "/" + item;
                CreateFolder(atPath: newDir)
                CopyFiles(atPath: itemPath, toPath: newDir);
            }
            else {
                
                CopyFile(filename: item, fromPath: itemPath, toPath: toPath + "/" + item)
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
    
    //    if (fn.hasSuffix(".css") && fn != "animate.min.css") {
    //        CopyCSSFile(filename: fn, fromPath: sp, toPath: dp)
    //        return;
    //    }
    
    print("Copying: \(fn)");
    do{
        let content:Data? = try Data.init(contentsOf: URL.init(fileURLWithPath: sp))
        try content!.write(to: URL.init(fileURLWithPath: dp))
    }
    catch{
        print("Cann't open file")
    }
}

//func CopyCSSFile(filename fn: String, fromPath sp: String, toPath dp: String) {
//
//    print("Copying CCS file: \(fn)");
//
//    do{
//        let content = try String.init(contentsOfFile: sp, encoding: .utf8)
//
//        let lines = content.components(separatedBy: "\n")
//
//        var dstString = ""
//        var index = 0
//        while index < lines.count {
//
//            let l = lines[index]
//
//            var r = l.range(of: "https://fonts.googleapis.com/css?")
//            if (r != nil) {
//                dstString.append(lines[index] + "\n")
//                index += 1
//                continue
//            }
//
//            r = l.range(of: "url\\(.*?\\)", options: .regularExpression)
//            if (r == nil){
//                dstString.append(lines[index] + "\n")
//                index += 1
//                continue
//            }
//
//            let urlString = l.substring(with: r!)
//
//            var lowerLine = "";
//            lowerLine.append(l.substring(to: r!.lowerBound))
//            lowerLine.append(urlString.lowercased())
//            lowerLine.append(l.substring(from: r!.upperBound) + "\n")
//
//            print("CSS old URL: \(l)")
//            print("CSS new URL: \(lowerLine)")
//            dstString.append(lowerLine)
//
//            index += 1
//        }
//
//
//        let fd : Data? = content.lowercased().data(using: .utf8)
//        try fd!.write(to: URL.init(fileURLWithPath: dp))
//    }
//    catch{
//        print("Cann't open file")
//    }
//    
//}


func WriteDataFile(data:Data?, path:String?) {
    
    if (path == nil) {
        print("Error writing file: Path is nil")
        return;
    }
    
    if (data == nil) {
        print("Error writing file: Data is nil.")
        return;
    }
    
    do {
        try data!.write(to: URL.init(fileURLWithPath: path!))
        print("File save: \(path!)")
    }
    catch {
        print("ERROR: It was not possible to write on the file")
    }
}


func WriteTextFile(content:String, path:String?) {
    
    let data : Data? = content.data(using: .utf8)
    WriteDataFile(data:data, path:path);
}


