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
    case Swift
    case JavaScript
}

protocol ModelOutputDelegate
{
    func openModelEntity(filename:String, classname:String, parentName:String?)
    func closeModelEntity()
    func appendAttribute(name:String, type:String, optional:Bool, defaultValue:String?)
    func appendRelationship(name:String, destinationEntity:String, toMany:String, optional:Bool)
    func writeModelFile()
}

func CreateModelSubClasses() -> Command? {
    
    var fileName:String? = NextArg()
    
    if (fileName == nil) {
        fileName = "/datamodel.xml"
    }
    
    var type:ModelSubClassType = .JavaScript
    
    let options = NextArg()
    if options != nil {
        switch options {
        case "--output-js":
            type = .JavaScript
        case "--output-swift":
            type = .Swift

        default: break
        }
    }
        
    return CreateModelSubClassesCommand(withFilename: fileName!, type: type)
}

class CreateModelSubClassesCommand : Command, XMLParserDelegate {
        
    var modelFilePath:String
    var modelType:ModelSubClassType
    
    var outputDelegate:ModelOutputDelegate?
                
    init(withFilename filename:String, type:ModelSubClassType) {
        
        self.modelFilePath = filename
        self.modelType = type
        
        switch type {
        case .JavaScript:
            outputDelegate = JavascriptModelOutput()
        
        case .Swift:
            outputDelegate = SwiftModelOutput()
            
        }
    }
    
    override func execute() {
                
        let parser = XMLParser(contentsOf:URL.init(fileURLWithPath:modelFilePath))
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
            
            outputDelegate?.openModelEntity(filename:filename!, classname:classname!, parentName:parentName)
        }
        else if (elementName == "attribute") {
            
            let name = attributeDict["name"];
            let type = attributeDict["attributeType"];
            let optional = attributeDict["optional"] ?? "NO";
            let defaultValue = attributeDict["defaultValueString"];
            
            outputDelegate?.appendAttribute(name:name!, type:type!, optional:(optional == "YES"), defaultValue: defaultValue)
        }
        else if (elementName == "relationship") {
            
            let name = attributeDict["name"];
            let optional = attributeDict["optional"] ?? "NO";
            let destinationEntity = attributeDict["destinationEntity"];
            let toMany = attributeDict["toMany"] ?? "NO"
            
            outputDelegate?.appendRelationship(name:name!, destinationEntity:destinationEntity!, toMany:toMany, optional:(optional == "YES"))
        }
    }
    
    func parser(_ parser: XMLParser, didEndElement elementName: String, namespaceURI: String?, qualifiedName qName: String?) {
    
        if (elementName == "entity") {
            outputDelegate?.closeModelEntity()
        }
    }
    
    func parser(_ parser: XMLParser, foundCharacters string: String) {
    
    }
    
    func parser(_ parser: XMLParser, parseErrorOccurred parseError: Error) {
    
    }
    
    func parserDidEndDocument(_ parser: XMLParser) {
        outputDelegate?.writeModelFile()
    }
    
}

