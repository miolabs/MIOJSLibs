//
//  Create.swift
//  MIOTool
//
//  Created by GodShadow on 17/05/2017.
//
//

//import Foundation

func CreateCommand() {
    
    let type:String? = NextArg();
    
    switch type {
        
    case "project"?:
        CreateProjectCommand();
        
    default:
        print("create: type of project not implemented!!")
    }
}
