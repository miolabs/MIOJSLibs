//
//  SwiftModelOutput.swift
//  MIOTool
//
//  Created by Javier Segura Perez on 10/09/2020.
//  Copyright © 2020 MIO Research Labs. All rights reserved.
//

import Foundation


class SwiftModelOutput : ModelOutputDelegate
{
    var fileContent:String = ""
    var filename:String = ""

    var currentParentClassName:String?
    var currentClassName:String = ""
    var currentClassEntityName:String = ""
    
    var primitiveProperties:[String] = []
    var relationships:[String] = []
    
    func openModelEntity(filename:String, classname:String, parentName:String?)
    {
        self.filename = "/\(filename)+CoreDataProperties.swift"
        let cn = classname
        currentClassEntityName = cn;
        currentClassName = classname;
        
        relationships = []
        primitiveProperties = []
        
        currentParentClassName = parentName
        
        fileContent = "\n"
        fileContent += "// Generated class \(cn) by MIOTool\n";
        fileContent += "import MIOCoreData"
        fileContent += "\n\n";
        fileContent += "extension \(cn)\n{\n";
    }
    
    func appendAttribute(name:String, type:String, optional:Bool, defaultValue:String?)
    {
        let t:String
        switch type {
        case "Integer":
            t = "Int"
        
        case "Decimal":
            t = "Int"
            
        case "Integer 16":
            t = "Int16"
            
        case "Integer 8":
            t = "Int8"
        
        case "Integer 32":
            t = "Int32"
            
        case "Integer 64":
            t = "Int64"
                    
        case "Boolean":
            t = "Bool"
            
        default:
            t = type
        }
        
        // Setter and Getter of property value
        fileContent += "    public var \(name):\(t)\(optional ? "?" : "") { get { value(forKey: \"\(name)\") as\(optional ? "?" : "!") \(t) } set { setValue(newValue, forKey: \"\(name)\") } }\n"
        
        // Setter and Getter of property primitive value (raw)
        let first = String(name.prefix(1))
        let cname = first.uppercased() + String(name.dropFirst())
        primitiveProperties.append("    public var primitive\(cname):\(t) { get { primitiveValue(forKey: \"primitive\(cname)\") as\(optional ? "?" : "!") \(t) } set { setPrimitiveValue(newValue, forKey: \"primitive\(cname)\") } }\n")
    }
    
    func appendRelationship(name:String, destinationEntity:String, toMany:String, optional:Bool)
    {
        fileContent += "    // Relationship: \(name)\n";
        fileContent += "    public var \(name):NSSet? { get { value(forKey: \"\(name)\") as! NSSet } set { setValue(newValue, forKey: \"\(name)\") }}\n"
        
        if (toMany == "NO") {
            fileContent += "    public var \(name):\(destinationEntity)\(optional ? "?" : "") { get { value(forKey: \"\(name)\") as\(optional ? "?" : "!")  \(destinationEntity) } set { setValue(newValue, forKey: \"\(name)\") }}\n"
        }
        else {
            let first = String(name.prefix(1));
            let cname = first.uppercased() + String(name.dropFirst());
                       
            var content = "// MARK: Generated accessors for \(name)\n"
            content += "extension \(self.currentClassName)\n"
            content += "{\n"
            content += "    @objc(add\(cname)Object:)\n"
            content += "    public func addTo\(cname)(_ value: \(destinationEntity))\n"
            content += "\n"
            content += "    @objc(remove\(cname)Object:)\n"
            content += "    public func removeFrom\(cname)(_ value: \(destinationEntity))\n"
            content += "\n"
            content += "    @objc(add\(cname):)\n"
            content += "    public func addTo\(cname)(_ values: NSSet)\n"
            content += "\n"
            content += "    @objc(remove\(cname):)\n"
            content += "    public func removeFrom\(cname)(_ values: NSSet)\n"
            content += "}\n"
            
            relationships.append(content)
        }
    }
    
    func closeModelEntity()
    {
        fileContent += "}\n";
        
        for rel in relationships {
            fileContent += "\n" + rel
        }
        
        fileContent += "\n"
        fileContent += "// MARK: Generated accessors for primitivve values\n"
        fileContent += "extension \(self.currentClassName)\n"
        fileContent += "{\n"
        for primitiveProperty in primitiveProperties {
            fileContent += primitiveProperty
        }
        fileContent += "}\n"
                
        let modelPath = ModelPath()
        let path = modelPath + filename
        //Write to disc
        WriteTextFile(content:fileContent, path:path)
        
        let fp = modelPath + "/" + self.currentClassName + "+CoreDataClass.swift"
        if (FileManager.default.fileExists(atPath:fp) == false) {
            // Create Subclass in case that is not already create
            var content = ""
            content += "//\n"
            content += "// Generated class \(self.currentClassName)\n"
            content += "//\n"
            content += "import MIOCoreData\n"
            content += "\n"
            content += "@objc(\(self.currentClassName))\n"
            content += "public class \(self.currentClassName) : \(currentParentClassName ?? "NSManagedObject")\n"
            content += "{\n"
            content += "\n}\n";

            WriteTextFile(content: content, path: fp)
        }
        
//        modelContent += "\n\t MIOCoreRegisterClassByName('" + self.currentClassName + "_ManagedObject', " + self.currentClassName + "_ManagedObject);";
//        modelContent += "\n\t MIOCoreRegisterClassByName('" + self.currentClassName + "', " + self.currentClassName + ");";
    }
    
    func writeModelFile()
    {
        //let modelPath = ModelPath()
        
        //modelContent += "\n}\n"
        //let path = modelPath + "/datamodel.ts";
        //WriteTextFile(content:modelContent, path:path)

    }
}
