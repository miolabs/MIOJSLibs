//
//  Create.swift
//  MIOTool
//
//  Created by GodShadow on 17/05/2017.
//
//

import Foundation

func Create() -> Command? {
    
    let type:String? = NextArg();
    var cmd:Command? = nil;
    
    switch type {
        
    case "project"?:
        cmd = CreateProject();
        
    case "model"?:
        cmd = CreateModel();
        
    default:
        print("create: type not implemented!!")
    }
    
    return cmd;
}
