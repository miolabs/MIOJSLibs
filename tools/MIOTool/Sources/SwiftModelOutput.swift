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
    var fileContent2:String = ""
    var filename:String = ""
    var filename2:String = ""

    var currentParentClassName:String?
    var currentClassName:String = ""
    var currentClassEntityName:String = ""
    
    var primitiveProperties:[String] = []
    var relationships:[String] = []
    var relationships2:[String] = []
    
    var modelContent:String = "#if !APPLE_CORE_DATA\nimport Foundation\nimport MIOCore\n\nextension DLDB\n{\n\tfunc registerRuntimeObjects(){\n"
    
    func openModelEntity(command:CreateModelSubClassesCommand, filename:String, classname:String, parentName:String?)
    {
        self.filename = "/\(filename)+CoreDataProperties.swift"
        self.filename2 = "/\(filename)+MIOCoreDataProperties.swift"
        let cn = classname
        currentClassEntityName = cn;
        currentClassName = classname;
        
        relationships = []
        relationships2 = []
        primitiveProperties = []
        
        currentParentClassName = parentName
        
        fileContent = "\n"
        fileContent = "#if APPLE_CORE_DATA\n"
        fileContent += "// Generated class \(cn) by MIOTool\n"
        fileContent += "import Foundation\n"
        fileContent += "import CoreData\n"
        fileContent += "\n\n"
        fileContent += "extension \(cn)\n{\n"
        
        fileContent2 = "\n"
        fileContent2 = "#if !APPLE_CORE_DATA\n"
        fileContent2 += "// Generated class \(cn) by MIOTool\n"
        fileContent2 += "import Foundation\n"
        fileContent2 += "import MIOCoreData\n"
        fileContent2 += "\n\n"
        fileContent2 += "extension \(cn)\n{\n"

    }
    
    func appendAttribute(command:CreateModelSubClassesCommand, name:String, type:String, optional:Bool, defaultValue:String?, usesScalarValueType:Bool)
    {
        let t:String
        let cast_t:String
        
        switch type {
        
        case "Boolean":
            t = usesScalarValueType ? "NSNumber?" : "Bool"
            cast_t = usesScalarValueType ? "as? NSNumber" : "as! Bool"
        
        case "Integer":
            t = usesScalarValueType ? "NSNumber?" : "Int"
            cast_t = usesScalarValueType ? "as? NSNumber" : "as! Int"
                                
        case "Integer 16":
            t = usesScalarValueType ? "NSNumber?" : "Int16"
            cast_t = usesScalarValueType ? "as? NSNumber" : "as! Int16"
            
        case "Integer 8":
            t = usesScalarValueType ? "NSNumber?" : "Int8"
            cast_t = usesScalarValueType ? "as? NSNumber" : "as! Int8"
        
        case "Integer 32":
            t = usesScalarValueType ? "NSNumber?" : "Int32"
            cast_t = usesScalarValueType ? "as? NSNumber" : "as! Int32"
            
        case "Integer 64":
            t = usesScalarValueType ? "NSNumber?" : "Int64"
            cast_t = usesScalarValueType ? "as? NSNumber" : "as! Int64"

        case "Decimal":
            t = "NSDecimalNumber?"
            cast_t = "as? NSDecimalNumber"
            
            
        case "Transformable":
            t = "String?" // was "NSObject"
            cast_t = "as? String"
            
        default:
            t = optional ? "\(type)?" : type
            cast_t = optional ? "as? \(type)" : "as! \(type)"
        }
        
        // Setter and Getter of property value
        fileContent += "    @NSManaged public var \(name):\(t)\n"
        fileContent2 += "    public var \(name):\(t) { get { value(forKey: \"\(name)\") \(cast_t) } set { setValue(newValue, forKey: \"\(name)\") } }\n"
        
        // Setter and Getter of property primitive value (raw)
        let first = String(name.prefix(1))
        let cname = first.uppercased() + String(name.dropFirst())
        primitiveProperties.append("    public var primitive\(cname):\(t) { get { primitiveValue(forKey: \"primitive\(cname)\") \(cast_t) } set { setPrimitiveValue(newValue, forKey: \"primitive\(cname)\") } }\n")
    }
    
    func appendRelationship(command:CreateModelSubClassesCommand, name:String, destinationEntity:String, toMany:String, optional:Bool)
    {
        fileContent2 += "    // Relationship: \(name)\n"
       
        
        if (toMany == "NO") {
            fileContent += "    @NSManaged public var \(name):\(destinationEntity)\(optional ? "?" : "")\n"
            fileContent2 += "    public var \(name):\(destinationEntity)\(optional ? "?" : "") { get { value(forKey: \"\(name)\") as\(optional ? "?" : "!")  \(destinationEntity) } set { setValue(newValue, forKey: \"\(name)\") }}\n"
        }
        else {
            fileContent += "    @NSManaged public var \(name):Set<\(destinationEntity)>?\n"
            fileContent2 += "    public var \(name):Set<\(destinationEntity)>? { get { value(forKey: \"\(name)\") as? Set<\(destinationEntity)> } set { setValue(newValue, forKey: \"\(name)\") }}\n"
            
            let first = String(name.prefix(1))
            
            let cname = first.uppercased() + String(name.dropFirst())
                       
            var content = "// MARK: Generated accessors for \(name)\n"
            content += "extension \(self.currentClassName)\n"
            content += "{\n"
            content += "    @objc(add\(cname)Object:)\n"
            //content += "    @NSManaged public func addTo\(cname)(_ value: \(destinationEntity))\n"
            content += "    @NSManaged public func add\(cname)Object(_ value: \(destinationEntity))\n"
            content += "\n"
            content += "    @objc(remove\(cname)Object:)\n"
            //content += "    @NSManaged public func removeFrom\(cname)(_ value: \(destinationEntity))\n"
            content += "    @NSManaged public func remove\(cname)Object(_ value: \(destinationEntity))\n"
            content += "\n"
            content += "    @objc(add\(cname):)\n"
            //content += "    @NSManaged public func addTo\(cname)(_ values: NSSet)\n"
            content += "    @NSManaged public func add\(cname)(_ values: Set<\(destinationEntity)>)\n"
            content += "\n"
            content += "    @objc(remove\(cname):)\n"
            //content += "    @NSManaged public func removeFrom\(cname)(_ values: NSSet)\n"
            content += "    @NSManaged public func remove\(cname)(_ values: Set<\(destinationEntity)>)\n"
            content += "}\n"
            
            relationships.append(content)
            
            var content2 = "// MARK: Generated accessors for \(name)\n"
            content2 += "extension \(self.currentClassName)\n"
            content2 += "{\n"
            content2 += "    @objc(add\(cname)Object:)\n"
            //content2 += "    public func addTo\(cname)(_ value: \(destinationEntity)) { _addObject(value, forKey: \"\(name)\") }\n"
            content2 += "    public func add\(cname)Object(_ value: \(destinationEntity)) { _addObject(value, forKey: \"\(name)\") }\n"
            content2 += "\n"
            content2 += "    @objc(remove\(cname)Object:)\n"
            //content2 += "    public func removeFrom\(cname)(_ value: \(destinationEntity)) { _removeObject(value, forKey: \"\(name)\") }\n"
            content2 += "    public func remove\(cname)Object(_ value: \(destinationEntity)) { _removeObject(value, forKey: \"\(name)\") }\n"
            content2 += "\n"
            content2 += "    @objc(add\(cname):)\n"
            //content2 += "    public func addTo\(cname)(_ values: NSSet) {}\n"
            content2 += "    public func add\(cname)(_ values: Set<\(destinationEntity)>) {}\n"
            content2 += "\n"
            content2 += "    @objc(remove\(cname):)\n"
            //content2 += "    public func removeFrom\(cname)(_ values: NSSet) {}\n"
            content2 += "    public func remove\(cname)(_ values: Set<\(destinationEntity)>) {}\n"
            content2 += "}\n"
            
            relationships2.append(content2)
        }
    }
    
    func closeModelEntity(command:CreateModelSubClassesCommand)
    {
        fileContent += "}\n"
        fileContent2 += "}\n"
        
        for rel in relationships {
            fileContent += "\n" + rel
        }
        
        for rel in relationships2 {
            fileContent2 += "\n" + rel
        }
        
        // Only MIOCoreData for Linux
        fileContent2 += "\n"
        fileContent2 += "// MARK: Generated accessors for primitivve values\n"
        fileContent2 += "extension \(self.currentClassName)\n"
        fileContent2 += "{\n"
        for primitiveProperty in primitiveProperties {
            fileContent2 += primitiveProperty
        }
        fileContent2 += "}\n"
                
        fileContent += "#endif\n"
        let modelPath = command.modelPath
        let path = modelPath + filename
        //Write to disc
        WriteTextFile(content:fileContent, path:path)

        fileContent2 += "#endif\n"
        let path2 = modelPath + filename2
        //Write to disc
        WriteTextFile(content:fileContent2, path:path2)

        
        let fp = modelPath + "/" + self.currentClassName + "+CoreDataClass.swift"
        if (FileManager.default.fileExists(atPath:fp) == false) {
            // Create Subclass in case that is not already create
            var content = ""
            content += "//\n"
            content += "// Generated class \(self.currentClassName)\n"
            content += "//\n"
            content += "import Foundation\n"
            content += "#if os(macOS) || os(Linux)\n"
            content += "import MIOCoreData\n"
            content += "#else\n"
            content += "#import CoreData\n"
            content += "#endif\n"
            content += "\n"
            content += "@objc(\(self.currentClassName))\n"
            content += "public class \(self.currentClassName) : \(currentParentClassName ?? "NSManagedObject")\n"
            content += "{\n"
            content += "\n}\n"
            content += "#endif\n"

            WriteTextFile(content: content, path: fp)
        }
        
        modelContent += "\n\t\t_MIOCoreRegisterClass(type: " + self.currentClassName + ".self, forKey: \"" + self.currentClassName + "\")"
    }
    
    func writeModelFile(command:CreateModelSubClassesCommand)
    {
        let modelPath = command.modelPath
        
        modelContent += "\n\t}\n}\n"
        modelContent += "#endif\n"
        
        let path = modelPath + "/_CoreDataClasses.swift"
        WriteTextFile(content:modelContent, path:path)
    }
}
