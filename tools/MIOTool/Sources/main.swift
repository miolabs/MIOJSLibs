//
//  main.swift
//  MIOTool
//
//  Created by GodShadow on 27/02/2017.
//  Copyright © 2017 MIO Research Labs. All rights reserved.
//

import Foundation

if (ArgsCount() == 1) {
    print("MIOTool v1.2\n");
    print("Not enough params!\n");
}

var cmd:Command? = nil;

while let token = NextArg() {
    
    switch (token) {
        
        case "create":
            cmd = Create();
        
        case "deploy":
            cmd = Deploy();
        
        default:
            if (token.hasPrefix("--")){
                let value = NextArg();
                if (value != nil) {
                    SetOption(token: token, value: value!);
                }
            }
            else {
                print("Argument not implemented!!")
        }
    }
}

if (cmd != nil) {
    cmd?.execute();
}


