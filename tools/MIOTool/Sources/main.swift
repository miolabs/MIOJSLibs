//
//  main.swift
//  MIOTool
//
//  Created by GodShadow on 27/02/2017.
//  Copyright © 2017 MIO Research Labs. All rights reserved.
//

//import Foundation

enum CommandType {
    
    case none
    case createProject
    case createFile
    case addLib
    case addFramework
    case buildDebug
    case buildRelease
    case update
}

let len = CommandLine.arguments.count
var cmdType = CommandType.none

// Proccess arguments
var index = 1

while index < len {
        
    var arg = CommandLine.arguments[index];index += 1
    var arg2 = CommandLine.arguments[index]
    switch (arg,arg2) {
        
        case ("create", "project"):
            cmdType = .createProject
        
        default:
            print("Argument not implemented!!")
    }
    
    index += 1;
}

switch cmdType {

    case .createProject:
        CreateProject()
    
    default:
        print("Command error");
    
}

