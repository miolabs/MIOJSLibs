//
//  CreateProjectTemplateCommand.swift
//  MIOTool
//
//  Created by GodShadow on 22/05/2017.
//
//

import Foundation

func CreateProjectTemplate() -> Command? {
    
    let libPath:String? = NextArg()
    
    if (libPath == nil) {
        return nil;
    }
    
    return CreateProjectTemplateCommand(withLibPath: libPath!);
}

class CreateProjectTemplateCommand : Command {

    var libPath:String;
    
    init(withLibPath libPath:String) {
        
        self.libPath = libPath;
    }
    
    override func execute() {
        
        CreateFolder(atPath: "libs");
        CreateFolder(atPath: "model");
        CreateFolder(atPath: "source");
    }
}
