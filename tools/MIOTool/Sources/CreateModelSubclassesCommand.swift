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
}

protocol ModelOutputDelegate
{
    func openModelEntity(command:CreateModelSubClassesCommand, filename:String, classname:String, parentName:String?)
    func closeModelEntity(command:CreateModelSubClassesCommand)
    func appendAttribute(command:CreateModelSubClassesCommand, name:String, type:String, optional:Bool, defaultValue:String?, usesScalarValueType:Bool)
    func appendRelationship(command:CreateModelSubClassesCommand, name:String, destinationEntity:String, toMany:String, optional:Bool)
    func writeModelFile(command:CreateModelSubClassesCommand)
}

func CreateModelSubClasses() -> Command? {
    
    var path:String = CurrentPath()
    
    let fileName:String = NextArg() ?? "\(CurrentPath())/datamodel.xml"
    
    var type:ModelSubClassType = .javascript
    var entity:String?
    
    var options = NextArg()
    while options != nil {
        switch options {
        case "--output-code":
            type = parseOutputCode()
        
        case "--output-folder":
            path = NextArg()!
            
        case "--entity":
            entity = NextArg()
            
        default: break
        }
        
        options = NextArg()
    }
        
    return CreateModelSubClassesCommand(withFilename: fileName, path: path, type: type, entity:entity)
}

func parseOutputCode() -> ModelSubClassType {
    let code = NextArg()
    
    switch code {
    case "swift":
        return .swift
    case "javascript":
        return .javascript
    default: return .javascript
    }
}

class CreateModelSubClassesCommand : Command, XMLParserDelegate {
    
    public var modelPath:String
    var modelFilePath:String
    var modelType:ModelSubClassType
    
    var outputDelegate:ModelOutputDelegate?
    
    var customEntity:String?
    var customEntityFound = false
                
    init(withFilename filename:String, path:String, type:ModelSubClassType, entity:String?) {
        
        self.customEntity = entity
        
        self.modelFilePath = CreateModelSubClassesCommand.parsePath(filename)
        self.modelPath = CreateModelSubClassesCommand.parsePath(path)
        
        self.modelType = type
        
        switch type {
        case .javascript:
            outputDelegate = JavascriptModelOutput()
        
        case .swift:
            outputDelegate = SwiftModelOutput()
            
        }
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
            
            outputDelegate?.appendRelationship(command:self, name:name!, destinationEntity:destinationEntity!, toMany:toMany, optional:(optional == "YES"))
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

