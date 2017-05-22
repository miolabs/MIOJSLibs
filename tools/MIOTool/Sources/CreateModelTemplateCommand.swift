//
//  CreateModelTemplateCommand.swift
//  MIOTool
//
//  Created by GodShadow on 20/05/2017.
//
//

import Foundation

func CreateModelTemplate() -> Command? {
 
    var fileName:String? = NextArg()
    
    if (fileName == nil) {
        fileName = "/datamodel.xml"
    }
    
    return CreateModelTemplateCommand(withFilename: fileName!);

}

class CreateModelTemplateCommand: Command {
    
    var filename:String;
    var modelFilePath:String?;
    
    init(withFilename filename:String) {
        
        self.filename = filename;
    }
    
    override func execute() {
        
        self.modelFilePath = ModelPath() + self.filename;
        
        var content = ""
        content += "<?xml version='1.0' encoding='UTF-8' standalone='yes'?>\n"
        content += "<model documentVersion='1.0'>\n"
        content += "   <entity name='Entity1' representedClassName='Entity1'>\n"
        content += "       <attribute name='name' optional='YES' attributeType='String'/>\n"
        content += "       <attribute name='number' optional='YES' attributeType='Number'/>\n"
        content += "       <relationship name='newRelationship' optional='YES' toMany='YES'/>\n"
        content += "   </entity>\n"
        content += "</model>\n"
        
        let fd : Data? = content.data(using: .utf8)
        do {
            try fd!.write(to: URL.init(fileURLWithPath: self.modelFilePath!))
        }
        catch {
            print("ERROR: It was not possible to create the model file template")
        }
    }
}
