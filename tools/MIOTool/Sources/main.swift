//
//  main.swift
//  MIOTool
//
//  Created by GodShadow on 27/02/2017.
//  Copyright © 2017 MIO Research Labs. All rights reserved.
//

//import Foundation

if (ArgsCount() == 1) {
    
    print("Not enough params!");
}

while let param = NextArg() {
    
    switch (param) {
        
        case "create":
            CreateCommand();
        
        case "deploy":
            DeployCommand();
        
        case "--path":
            let path = NextArg();
            if (path != nil) {
                SetPath(path: path!);
            }
        
        default:
            print("Argument not implemented!!")
    }
}

