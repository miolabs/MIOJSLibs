//
//  Options.swift
//  MIOTool
//
//  Created by GodShadow on 20/05/2017.
//
//

import Foundation

private var _CommandOptions = [String:String]()

func Option(key:String) ->String? {
    
    return _CommandOptions[key];
}

func SetOption(token:String, value:String) {
    
    let key = token.substring(from: token.index(token.startIndex, offsetBy: 2));
    _CommandOptions[key] = value;
}
