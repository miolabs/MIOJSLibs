//
//  Deploy.swift
//  MIOTool
//
//  Created by GodShadow on 17/05/2017.
//
//

import Foundation

class DeployCommand : Command {
    
    override func execute() {
     
        let path = CurrentPath()
        let appPath = path + "/app"
        let deployPath = path + "/deploy"
        
        print("Folder: \(path)")
        print("Deploying ...")
        
        RemoveFolder(atPath:deployPath)
        CreateFolder(atPath:deployPath)
        
        CopyFiles(atPath:appPath, toPath:deployPath)
        
    }
}

