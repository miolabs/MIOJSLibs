//
//  CommandLine.swift
//  MIOTool
//
//  Created by GodShadow on 17/05/2017.
//
//

import Foundation

private var Path:String? = nil
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

func SetPath(path:String) {
    
    Path = path;
}

func GetPath() -> String {
    
    if (Path == nil) {
        Path = FileManager.default.currentDirectoryPath
    }
    
    return Path!;
}
