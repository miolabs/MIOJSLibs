//
//  CreateModelSubclass.swift
//  MIOTool
//
//  Created by GodShadow on 20/05/2017.
//
//

import Foundation

func CreateModelSubClasses() -> Command? {
    
    var fileName:String? = NextArg()
    
    if (fileName == nil) {
        fileName = "/datamodel.xml"
    }
    
    return CreateModelSubClassesCommand(withFilename: fileName!);
}

class CreateModelSubClassesCommand : Command, XMLParserDelegate {
    
    var fileContent:String = "";
    var filename:String = "";
    
    var currentClassName:String = "";
    var currentClassEntityName:String = "";
    
    var modelPath:String?;
    var modelFilename:String;
    
    init(withFilename filename:String) {
        
        self.modelFilename = filename;
    }
    
    override func execute() {
        
        modelPath = ModelPath();
        let modelFilePath = modelPath! + modelFilename;
        
        let parser = XMLParser(contentsOf:URL.init(fileURLWithPath:modelFilePath))
        if (parser != nil) {
            parser!.delegate = self;
            parser!.parse();
        }
    }
    
    func parser(_ parser: XMLParser, didStartElement elementName: String, namespaceURI: String?, qualifiedName qName: String?, attributes attributeDict: [String : String]) {
        
        if (elementName == "entity") {
            
            let filename = attributeDict["name"];
            let classname = attributeDict["representedClassName"]
            
            openModelEntity(filename:filename!, classname:classname!);
        }
        else if (elementName == "attribute") {
            
            let name = attributeDict["name"];
            let type = attributeDict["attributeType"];
            let optional = attributeDict["optional"] ?? "YES";
            let defaultValue = attributeDict["defaultValueString"];
            
            appendAttribute(name:name!, type:type!, optional:optional, defaultValue: defaultValue)
        }
        else if (elementName == "relationship") {
            
            let name = attributeDict["name"];
            let optional = attributeDict["optional"] ?? "YES";
            let destinationEntity = attributeDict["destinationEntity"];
            let toMany = attributeDict["toMany"] ?? "NO"
            
            appendRelationship(name:name!, destinationEntity:destinationEntity!, toMany:toMany, optional:optional)
        }
    }
    
    func parser(_ parser: XMLParser, didEndElement elementName: String, namespaceURI: String?, qualifiedName qName: String?) {
    
        if (elementName == "entity") {
            closeModelEntity()
        }
    }
    
    func parser(_ parser: XMLParser, foundCharacters string: String) {
    
    }
    
    func parser(_ parser: XMLParser, parseErrorOccurred parseError: Error) {
    
    }
    
    private func openModelEntity(filename:String, classname:String) {
    
        self.filename = "/\(filename)_ManagedObject.ts";
        let cn = classname + "_ManagedObject";
        self.currentClassEntityName = cn;
        self.currentClassName = classname;
        
        fileContent = "\n";
        fileContent += "// Generated class \(cn)\n";
        fileContent += "\n";
        fileContent += "class \(cn) extends MIOManagedObject {\n";
    }
    
    private func appendAttribute(name:String, type:String, optional:String, defaultValue:String?) {

        var dv:String;
        var t = ":"
        
        switch type {
        case "Integer",
             "Float",
             "Number":
            t += "number"
            
        case "String":
            t += type.lowercased()
            
        case "Boolean":
             t += type.lowercased()
            
        case "Array",
             "Dictionary":
            t = ""
            
        default:
            t += type
        }
        
        if (defaultValue == nil) {
            dv = " = null;";
        }
        else {
            if (type == "String") {
                dv = " = '\(defaultValue!)';"
            }
            else if (type == "Number") {
                dv = " = \(defaultValue!);"
            }
            else if (type == "Array") {
                t = "";
                dv = " = [];"
            }
            else if (type == "Dictionary") {
                t = "";
                dv = " = {};"
            }
            else {
                dv = ";"
            }
        }
        
        fileContent += "\n";
        fileContent += "    // Property: \(name)\n";
        // Var
        fileContent += "    protected _\(name)\(t)\(dv)\n";
        // Setter
        fileContent += "    set \(name)(value\(t)) {\n";
        fileContent += "        this.setValue('\(name)', value);\n";
        fileContent += "    }\n";
    
        // Getter
        fileContent += "    get \(name)()\(t) {\n";
        fileContent += "        return this.getValue('\(name)');\n";
        fileContent += "    }\n";
        
        // Getter raw value
        fileContent += "    get \(name)RawValue()\(t) {\n";
        fileContent += "        return this._\(name);\n";
        fileContent += "    }\n";
    }
    
    private func appendRelationship(name:String, destinationEntity:String, toMany:String, optional:String) {
    
        if (toMany == "NO") {
            appendAttribute(name:name, type:destinationEntity, optional:optional, defaultValue:nil);
        }
        else{
            
            fileContent += "\n";
            
            let first = String(name.characters.prefix(1));
            let cname = first.uppercased() + String(name.characters.dropFirst());
            
            fileContent += "    // Relationship: \(name)\n";
            // Var
            fileContent += "    protected _\(name):MIOSet = null;\n";
            // Getter
            fileContent += "    get \(name)():MIOSet {\n";
            fileContent += "        return this.getValue('\(name)');\n";
            fileContent += "    }\n";
            // Add
            fileContent += "    add\(cname)Object(value:\(destinationEntity)) {\n";
            fileContent += "        this.addObject('\(name)', value);\n";
            fileContent += "    }\n";
            // Remove
            fileContent += "    remove\(cname)Object(value:\(destinationEntity)) {\n";
            fileContent += "        this.removeObject('\(name)', value);\n";
            fileContent += "    }\n";
            // Add objects
            fileContent += "    add\(cname)(value:MIOSet) {\n";
            fileContent += "        this.addObjects('\(name)', value);\n";
            fileContent += "    }\n";
            // Remove objects
            fileContent += "    remove\(cname)(value:MIOSet) {\n";
            fileContent += "        this.removeObjects('\(name)', value);\n";
            fileContent += "    }\n";
        }
        
    }
    
    private func closeModelEntity() {
    
        fileContent += "}\n";
        
        let path = modelPath! + filename;
        //Write to disc
        WriteTextFile(content:fileContent, path:path)
        
        let fp = modelPath! + "/" + self.currentClassName + ".ts"
        if (FileManager.default.fileExists(atPath:fp) == false) {
            // Create Subclass in case that is not already create
            var content = ""
            content += "//\n"
            content += "// Generated class \(self.currentClassName)\n"
            content += "//\n"
            content += "\n/// <reference path=\"\(self.currentClassEntityName).ts\" />\n"
            content += "\nclass \(self.currentClassName) extends \(self.currentClassEntityName)\n"
            content += "{\n"
            content += "\n}\n";

            WriteTextFile(content: content, path: fp)
        }
    }

}

