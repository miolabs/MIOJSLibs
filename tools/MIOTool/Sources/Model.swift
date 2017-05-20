//
//  Model.swift
//  MIOTool
//
//  Created by GodShadow on 20/05/2017.
//
//

import Foundation

func ModelPath() -> String {
    
    var path:String? = Option(key:"model-path");
    if (path == nil) {
        path = CurrentPath();
    }
    
    return path!;
}
