//
//  CreateModel.swift
//  MIOTool
//
//  Created by GodShadow on 20/05/2017.
//
//

import Foundation

func CreateModel() -> Command? {
 
    let token:String? = NextArg();
    var cmd:Command? = nil;
    
    switch token {
        
    case "template"?:
        cmd = CreateModelTemplate();
        
    case "subclasses"?:
        cmd = CreateModelSubClasses();
        
    default:
        print("create:mode: param error!!")
    }
    
    return cmd;
}
