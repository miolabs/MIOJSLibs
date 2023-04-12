//
//  JavascriptModelOutput.swift
//  MIOTool
//
//  Created by Javier Segura Perez on 10/09/2020.
//  Copyright © 2020 MIO Research Labs. All rights reserved.
//

import Foundation


class JavascriptModelOutput : ModelOutputDelegate
{
    var namespace:String? = nil
    
    var fileContent:String = ""
    var filename:String = ""
    
    var currentClassName:String = ""
    var currentClassEntityName:String = ""
    
    var modelContent:String = "\nfunction DMRegisterModelClasses()\n{"
    
    func setNamespace(command: CreateModelSubClassesCommand, namespace: String?) {
        self.namespace = namespace
    }
    
    func openModelEntity(command:CreateModelSubClassesCommand, filename:String, classname:String, parentName:String?)
    {
        self.filename = "/\(filename)_ManagedObject.ts";    
        let cn = classname + "_ManagedObject";
        self.currentClassEntityName = cn;
        self.currentClassName = classname;
        
        let parentObject = parentName ?? "MIOManagedObject"
        
        fileContent = "\n";
        
        if parentName != nil {
            fileContent += "\n/// <reference path=\"\(parentName!).ts\" />\n"
        }
        
        if namespace != nil {
            fileContent += "\nnamespace \(namespace!)\n{\n";
        }
        
        fileContent += "\n";
        fileContent += "// Generated class \(cn)\n";
        fileContent += "\n";
        fileContent +=  namespace != nil ? "export " : ""
        fileContent += "class \(cn) extends \(parentObject)\n{\n";
    }
    
    func appendAttribute(command:CreateModelSubClassesCommand, name:String, type:String, optional:Bool, defaultValue:String?, usesScalarValueType:Bool)
    {
        var t = ":" 
        
        switch type {
        case "Integer",
             "Float",
             "Number",
             "Integer 16",
             "Integer 8",
             "Integer 32",
             "Integer 64",
             "Decimal":
            t += "number"
            
        case "String":
            t += type.lowercased()
            
        case "Boolean":
            t += type.lowercased()
            
        case "Array",
             "Dictionary":
            t = ""
            
        case "UUID":
            t += "string"
                        
        case "Transformable":
            t += "any"
            
        default:
            t += type
        }
        
        if defaultValue != nil && (type == "Array" || type == "Dictionary") {
            t = "";
        }
        
        fileContent += "\n";
        fileContent += "    // Property: \(name)\n";
        // Var
        //fileContent += "    protected _\(name)\(t)\(dv)\n";
        // Setter
        fileContent += "    set \(name)(value\(t)) {\n";
        fileContent += "        this.setValueForKey(value, '\(name)');\n";
        fileContent += "    }\n";
        
        // Getter
        fileContent += "    get \(name)()\(t) {\n";
        fileContent += "        return this.valueForKey('\(name)');\n";
        fileContent += "    }\n";
        
        // Setter raw value
        fileContent += "    set \(name)PrimitiveValue(value\(t)) {\n";
        fileContent += "        this.setPrimitiveValueForKey(value, '\(name)');\n";
        fileContent += "    }\n";
        
        // Getter raw value
        fileContent += "    get \(name)PrimitiveValue()\(t) {\n";
        fileContent += "        return this.primitiveValueForKey('\(name)');\n";
        fileContent += "    }\n";
    }
    
    func appendRelationship(command:CreateModelSubClassesCommand, name:String, destinationEntity:String, toMany:String, optional:Bool)
    {
        if (toMany == "NO") {
            fileContent += "    // Relationship: \(name)\n";
            
            // Setter
            fileContent += "    set \(name)(value:\(destinationEntity)) {\n";
            fileContent += "        this.setValueForKey(value, '\(name)');\n";
            fileContent += "    }\n";
            
            // Getter
            fileContent += "    get \(name)():\(destinationEntity) {\n";
            fileContent += "        return this.valueForKey('\(name)') as \(destinationEntity);\n";
            fileContent += "    }\n";
            
        }
        else{
            
            fileContent += "\n";
            
            let first = String(name.prefix(1));
            let cname = first.uppercased() + String(name.dropFirst());
            
            fileContent += "    // Relationship: \(name)\n";
            // Var
            fileContent += "    protected _\(name):MIOManagedObjectSet = null;\n";
            // Getter
            fileContent += "    get \(name)():MIOManagedObjectSet {\n";
            fileContent += "        return this.valueForKey('\(name)');\n";
            fileContent += "    }\n";
            // Add
            fileContent += "    add\(cname)Object(value:\(destinationEntity)) {\n";
            fileContent += "        this._addObjectForKey(value, '\(name)');\n";
            fileContent += "    }\n";
            // Remove
            fileContent += "    remove\(cname)Object(value:\(destinationEntity)) {\n";
            fileContent += "        this._removeObjectForKey(value, '\(name)');\n";
            fileContent += "    }\n";
        }
    }
    
    func closeModelEntity(command:CreateModelSubClassesCommand)
    {
        fileContent += "}\n";
        if namespace != nil {
            fileContent += "\n}\n";
        }
        
//        let modelPath = ModelPath()
        let modelPath = command.modelPath
        let path = modelPath + filename
        //Write to disc
        WriteTextFile(content:fileContent, path:path)
        
        let fp = modelPath + "/" + self.currentClassName + ".ts"
        if (FileManager.default.fileExists(atPath:fp) == false) {
            // Create Subclass in case that is not already create
            var content = ""
            content += "//\n"
            content += "// Generated class \(self.currentClassName)\n"
            content += "//\n"
            content += "\n/// <reference path=\"\(self.currentClassEntityName).ts\" />\n"
            if namespace != nil {
                content += "\nnamespace \(namespace!)\n{\n";
            }
            content += "\n"
            content += namespace != nil ? "export " : ""
            content += "class \(self.currentClassName) extends \(self.currentClassEntityName)\n"
            content += "{\n"
            content += "\n}\n";
            if namespace != nil {
                content += "\n}\n";
            }

            WriteTextFile(content: content, path: fp)
        }
                        
        let ns = namespace != nil ? "\(namespace!)." : ""
        modelContent += "\n\t MIOCoreRegisterClassByName('" + ns + self.currentClassName + "_ManagedObject', " + ns + self.currentClassName + "_ManagedObject);";
        modelContent += "\n\t MIOCoreRegisterClassByName('" + ns + self.currentClassName + "', " + ns + self.currentClassName + ");";
        
        print("Entity: \(self.currentClassName)")
    }
    
    func writeModelFile(command:CreateModelSubClassesCommand)
    {
//        let modelPath = ModelPath()
        let modelPath = command.modelPath
        
        modelContent += "\n}\n"
        let path = modelPath + "/datamodel.ts";
        WriteTextFile(content:modelContent, path:path)
    }
}
