#!/usr/bin/swift
//
//
//  main.swift
//  miojs_deploy
//
//  Created by GodShadow on 30/10/2016.
//  Copyright © 2016 MIO Research Labs. All rights reserved.
//

import Foundation

print("Hello, World!")

var release = false;

var index = 0
let len = CommandLine.arguments.count
var src_path : String?
var deploy_path : String?

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
        
    default:
        print("Argument not implemented!!")
    }
    
    index += 1;
}

let modeString = (release ? "release" : "debug");
print("Mode: \(modeString)")

func AddPathComponent(path:String, component: String) -> String
{
    let p : NSString = NSString.init(string: path);
    let rp = p.appendingPathComponent(component)
    
    return rp
}

let source_folder = src_path ?? FileManager.default.currentDirectoryPath
let deploy_folder = AddPathComponent(path: (deploy_path ?? FileManager.default.currentDirectoryPath), component: "deploy_\(modeString)")
let lib_path = AddPathComponent(path: deploy_folder, component: "MIOJSLib.js")

print("Deploy folder: \(deploy_folder)");
print("Lib file path: \(lib_path)");

func CreateLibFile(atPath path:String){
    
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

func AppendLibFile(atPath path: String, filename: String)
{
    let data = FileManager.default.contents(atPath: path)
    if (data != nil)
    {
        let file = FileHandle.init(forWritingAtPath: lib_path)
        if (file != nil)
        {
            file!.seekToEndOfFile()
            let comments = "\n\n// ---- \(filename) ----\n\n"
            let commentsData = comments.data(using:String.Encoding.utf8)
            if (commentsData != nil) {
                file!.write(commentsData!)
            }
            file!.write(data!)
            file!.closeFile()
        }
    }
}

func ScanFolder(atPath path:String, dstPath dst:String)
{
    do{
        print("Path: \(path)")
        let directoryContents = try FileManager.default.contentsOfDirectory(atPath: path)
        for item in directoryContents
        {
            let item_path = path + "/" + item;
            var isDir : ObjCBool = false
            FileManager.default.fileExists(atPath: item_path, isDirectory: &isDir)
            if (isDir.boolValue)
            {
                let newDir = dst + "/" + item;
                if (release == false){
                    try FileManager.default.createDirectory(atPath: newDir, withIntermediateDirectories: true, attributes: nil);
                }
                ScanFolder(atPath: path + "/" + item, dstPath: newDir);
            }
            else if (item.hasSuffix(".js") || item.hasSuffix(".css") || item.hasSuffix(".html")){
                
                if (release == false){
                    print("Coping: \(item)");
                    let dst_path = dst + "/" + item;
                    try FileManager.default.copyItem(atPath: item_path, toPath: dst_path);
                }
                else{
                    print("Appending: \(item)");
                    AppendLibFile(atPath: item_path, filename:item)
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

if (release == true) {
    CreateLibFile(atPath:lib_path);
}

ScanFolder(atPath: source_folder, dstPath: deploy_folder)


