//
//  CreateModelSubclass.swift
//  MIOTool
//
//  Created by GodShadow on 20/05/2017.
//
//

import Foundation
import CoreData

enum ModelSubClassType
{
    case swift
    case javascript
    case typescript
}

protocol ModelOutputDelegate
{
    func setNamespace(command:CreateModelSubClassesCommand, namespace:String?)
    func openModelEntity(command:CreateModelSubClassesCommand, filename:String, classname:String, parentName:String?)
    func closeModelEntity(command:CreateModelSubClassesCommand)
    func appendAttribute(command:CreateModelSubClassesCommand, name:String, type:String, optional:Bool, defaultValue:String?, usesScalarValueType:Bool)
    func appendRelationship(command:CreateModelSubClassesCommand, name:String, destinationEntity:String, toMany:String, optional:Bool)
    func writeModelFile(command:CreateModelSubClassesCommand)
}

func CreateModelSubClasses() -> Command? {
    
    var path:String = CurrentPath()
    
    let fileName:String = NextArg() ?? "\(CurrentPath())/datamodel.xml"  
    if (fileName.hasPrefix("--")){ // bug? fileName cannot be empty if there will be additional params (output-code, namespace...)
        print("As you are using optional params you must supply a filename: miotool create model subclasses filename optionals")
    }
    
    var type:ModelSubClassType = .javascript
    var entity:String?
    var namespace:String?
    
    var options = NextArg()
    while options != nil {
        switch options {
        case "--output-code":
            type = parseOutputCode()
        
        case "--output-folder":
            path = NextArg()!
            
        case "--entity":
            entity = NextArg()

        case "--namespace":
            namespace = NextArg()
            
        default: break
        }
        
        options = NextArg()
    }
        
    return CreateModelSubClassesCommand(withFilename: fileName, path: path, type: type, entity:entity, namespace:namespace)
}

func parseOutputCode() -> ModelSubClassType {
    let code = NextArg()
    
    switch code {
    case "swift":       return .swift
    case "javascript":  return .javascript
    case "typescript":  return .typescript
    default:
        print("Unexpected output code. Expected 'swift', 'javascript' or 'typescript'. Defaulting to javascript")
        return .javascript
    }
}

class CreateModelSubClassesCommand : Command, XMLParserDelegate {
    
    public var modelPath:String
    var modelFilePath:String
    var modelType:ModelSubClassType
    var namespace:String?
    
    var outputDelegate:ModelOutputDelegate? = nil
    
    var customEntity:String?
    var customEntityFound = false
                
    init(withFilename filename:String, path:String, type:ModelSubClassType, entity:String?, namespace:String? = nil) {
        
        self.customEntity = entity
        
        self.modelFilePath = CreateModelSubClassesCommand.parsePath(filename)
        self.modelPath = CreateModelSubClassesCommand.parsePath(path)
        
        self.modelType = type
        self.namespace = namespace
        
        switch type {
        case .javascript:   outputDelegate = JavascriptModelOutput()
        case .swift:        outputDelegate = SwiftModelOutput()
        case .typescript:   outputDelegate = TypescriptModelOutput()
        }
    }
    
    func parserDidStartDocument(_ parser: XMLParser) {
        outputDelegate?.setNamespace(command: self, namespace: namespace)
    }
    
    static func parsePath(_ path:String) -> String {
        var newPath = path
        
        if newPath.hasPrefix("\"") {
            newPath = String(newPath.dropFirst().dropLast().trimmingCharacters(in: .whitespaces))
        }
        
        if newPath.hasPrefix("/") == false {
            newPath = CurrentPath() + "/" + newPath
        }
        
        return (newPath as NSString).standardizingPath
    }
        
    override func execute() {
                
        print("Parsing file: \(modelFilePath)")
        let parser = XMLParser(contentsOf:URL(fileURLWithPath: modelFilePath))
        if (parser != nil) {
            parser!.delegate = self;
            parser!.parse();
        }
        else {
            print("Error creating parser\n")
        }
    }
    
    func parser(_ parser: XMLParser, didStartElement elementName: String, namespaceURI: String?, qualifiedName qName: String?, attributes attributeDict: [String : String]) {
        
        if (elementName == "entity") {
            
            let filename = attributeDict["name"]
            let classname = attributeDict["representedClassName"]
            let parentName = attributeDict["parentEntity"]
            
            if customEntity != nil {
                if customEntity! != classname { return }
                customEntityFound = true
                outputDelegate?.openModelEntity(command:self, filename:filename!, classname:classname!, parentName:parentName)
            }
            else {
                customEntityFound = true
                outputDelegate?.openModelEntity(command:self, filename:filename!, classname:classname!, parentName:parentName)
            }
        }
        else if (elementName == "attribute") {
            
            if customEntityFound == false { return }
            
            let name = attributeDict["name"]
            let type = attributeDict["attributeType"]
            let optional = attributeDict["optional"] ?? "NO"
            let defaultValue = attributeDict["defaultValueString"]
            let usesScalarValueType = attributeDict["usesScalarValueType"] ?? "YES"
            
            outputDelegate?.appendAttribute(command:self, name:name!, type:type!, optional:(optional == "YES"), defaultValue: defaultValue, usesScalarValueType: (usesScalarValueType == "YES"))
        }
        else if (elementName == "relationship") {
            
            if customEntityFound == false { return }
            
            let name = attributeDict["name"];
            let optional = attributeDict["optional"] ?? "NO";
            let destinationEntity = attributeDict["destinationEntity"];
            let toMany = attributeDict["toMany"] ?? "NO"
            
            if destinationEntity != nil {
                outputDelegate?.appendRelationship(command:self, name:name!, destinationEntity:destinationEntity!, toMany:toMany, optional:(optional == "YES"))
            }
        }
    }
    
    func parser(_ parser: XMLParser, didEndElement elementName: String, namespaceURI: String?, qualifiedName qName: String?) {
    
        if (elementName == "entity") {
            if customEntityFound == false { return }
            customEntityFound = false
            outputDelegate?.closeModelEntity(command:self)
        }
    }
    
    func parser(_ parser: XMLParser, foundCharacters string: String) {
    
    }
    
    func parser(_ parser: XMLParser, parseErrorOccurred parseError: Error) {
    
    }
    
    func parserDidEndDocument(_ parser: XMLParser) {
        if customEntity == nil { outputDelegate?.writeModelFile(command:self) }
    }
    
}

