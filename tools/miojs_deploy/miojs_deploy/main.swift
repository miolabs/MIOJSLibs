//
//
//  main.swift
//  miojs_deploy
//
//  Created by GodShadow on 30/10/2016.
//  Copyright © 2016 MIO Research Labs. All rights reserved.
//

import Foundation

print("Deploying...")

var release = false;

var index = 0
let len = CommandLine.arguments.count
var src_path : String?
var deploy_path : String?
var filename : String?

while index < len {
    
    if (index == 0) {index += 1; continue;}
    
    var arg = CommandLine.arguments[index]
    switch arg {
        
    case "--release":
        release = true;
        
    case "--path":
        index += 1
        src_path = CommandLine.arguments[index]
        
    case "--deploy_path":
        index += 1
        deploy_path = CommandLine.arguments[index]
        
    case "--out":
        index += 1
        filename = CommandLine.arguments[index]
        
    default:
        print("Argument not implemented!!")
    }
    
    index += 1;
}

let modeString = (release ? "release" : "debug")
print("Mode: \(modeString)")

filename = filename ?? "app.js"

func AddPathComponent(path:String, component: String) -> String
{
    let p : NSString = NSString.init(string: path);
    let rp = p.appendingPathComponent(component)
    
    return rp
}

let source_folder = src_path ?? FileManager.default.currentDirectoryPath
let deploy_folder = AddPathComponent(path: (deploy_path ?? FileManager.default.currentDirectoryPath), component: "deploy_\(modeString)")
let lib_path = AddPathComponent(path: deploy_folder, component: filename!)

print("Deploy folder: \(deploy_folder)");
print("Lib file path: \(lib_path)");

func CreateFile(atPath path:String){
    
    do{
        try FileManager.default.removeItem(atPath: path)
    }
    catch{
        print("File doesn't exist")
    }
    
    do {
        let dir : NSString = NSString.init(string: path)
        let dp = dir.deletingLastPathComponent
    
        try FileManager.default.createDirectory(atPath: dp, withIntermediateDirectories: true, attributes: nil)
    }
    catch{
        print("Can't create dir")
    }
    
    let done = FileManager.default.createFile(atPath: path, contents: nil, attributes: nil)
    print(done ? "File Create" : "File Not create")
}

func AppendLibFile(atPath path: String, filename: String, appendPath: String, srcFile:String)
{
    do{
        
        let data = try String.init(contentsOfFile: path, encoding: .utf8)
        let lines = data.components(separatedBy: "\n")
        
        var dstString = "\n\n// ---- \(srcFile) ----\n\n"
        var index = 0
        while index < lines.count {
            
            let l = lines[index]
            let l2 = "//# sourceMappingURL=\(srcFile).map"
            if (l != l2){
                dstString.append(lines[index] + "\n")
            }
            index += 1
        }
        
        let file = FileHandle.init(forWritingAtPath: appendPath)
        if (file != nil)
        {
            file!.seekToEndOfFile()
            let dstData = dstString.data(using: .utf8)
            if (dstData != nil){
                file!.write(dstData!)
            }
            file!.closeFile()
        }
    }
    catch{
        print("Cann't open file")
    }
    
}

func CopyFile(filename fn: String, fromPath sp: String, toPath dp: String)
{
    do{
        let data = try String.init(contentsOfFile: sp, encoding: .utf8)
        let lines = data.components(separatedBy: "\n")
        
        var dstString = ""
        var index = 0
        while index < lines.count {
            
            let l = lines[index]
            let l2 = "//# sourceMappingURL=\(fn).map"
            if (l != l2){
                dstString.append(lines[index] + "\n")
            }
            index += 1
        }
        
        let fd : Data? = dstString.data(using: .utf8)
        try fd?.write(to: URL.init(fileURLWithPath: dp))
    }
    catch{
        print("Cann't open file")
    }
}

func CompileFiles(fromPath path:String, dstPath:String, filename: String) ->Bool{
    
    // Check compile order file
    do {
        let compileOrderFile = path + "/compile_order";
        let data = try String.init(contentsOfFile: compileOrderFile, encoding: .utf8)
        let lines = data.components(separatedBy: "\n")
        
        var files = [String]()
        var index = 0
        var fn :String?
        while index < lines.count {
            
            let l = lines[index]
            index += 1
            
            let l2 = l.trimmingCharacters(in: .whitespacesAndNewlines)
            if (l2.hasPrefix("//") == true) {continue}
            if (l2.characters.count == 0) {continue}
            if (l2.hasPrefix("#file:")) {
                
                let l3 = l2.substring(from: l2.index(l2.startIndex, offsetBy: 6))
                let l4 = l3.trimmingCharacters(in: .whitespacesAndNewlines)
                fn = l4
                continue
            }
                
            files.append(l2 + ".js")
        }
        
        fn = fn ?? filename
        
        // Append files
        let af = fn! + ".js"
        let afp = dstPath + "/" + af
        CreateFile(atPath: afp);
        CreateFile(atPath: dstPath + "/" + fn! + ".min.js");
        
        for f in files {
            
            let sf = path + "/\(f)";
            AppendLibFile(atPath: sf, filename: af, appendPath: afp, srcFile: f)
        }
        
        return true;
    }
    catch{
        print("There's no compile order file")
    }
    
    return false;
}

func ScanFolder(atPath path:String, dstPath:String, ignoreJS:Bool)
{
    do{
        print("Path: \(path)")
        let directoryContents = try FileManager.default.contentsOfDirectory(atPath: path)
        for item in directoryContents{
            
            let item_path = path + "/" + item;
            var isDir : ObjCBool = false
            FileManager.default.fileExists(atPath: item_path, isDirectory: &isDir)
            if (isDir.boolValue){
                
                let newDir = dstPath + "/" + item;
                try FileManager.default.createDirectory(atPath: newDir, withIntermediateDirectories: true, attributes: nil)
                let value = CompileFiles(fromPath: item_path, dstPath: newDir, filename: item)
                ScanFolder(atPath: item_path, dstPath: newDir, ignoreJS:value);
            }
            else {
             
                if (item.hasSuffix(".DS_Store")
                    || item.hasSuffix("compile_order") ){
                        
                    continue
                }
                    
                if (release == false){
                    
                    print("Coping: \(item)");
                    try FileManager.default.copyItem(atPath: item_path, toPath: dstPath + "/" + item);
                }
                else
                {
                    if (item.hasSuffix(".ts")
                        || item.hasSuffix(".js.map")){
                    
                        continue;
                    }else if (item.hasSuffix(".js")){

                        if (ignoreJS == false){
                            print("Coping: \(item)");
                            CopyFile(filename: item, fromPath: item_path, toPath: dstPath + "/" + item);
                        }
                    }
                    else {
                        print("Coping: \(item)");
                        try FileManager.default.copyItem(atPath: item_path, toPath: dstPath + "/" + item);
                    }
                }
            }
        }
    }
    catch let error as NSError{
        print(error.localizedDescription)
    }
}

// remote deploy folder
do{
    try FileManager.default.removeItem(atPath: deploy_folder);
}
catch{
    print("Deploy folder doesn't exits");
}

do{
    try FileManager.default.createDirectory(atPath: deploy_folder, withIntermediateDirectories: true, attributes: nil);
}
catch{
    print("Can't create delpoy fodler")
}

ScanFolder(atPath: source_folder, dstPath: deploy_folder, ignoreJS: false)


