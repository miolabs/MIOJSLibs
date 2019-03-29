import { MIOLog } from "./MIOLog";
import { MIOObject } from "./MIOObject";

export interface MIOXMLParserDelegate {
    parserDidStartDocument?(parser:MIOXMLParser);
    parserDidEndDocument?(parser:MIOXMLParser);
    
    parserDidStartElement?(parser:MIOXMLParser, element:string, attributes);
    parserDidEndElement?(parser:MIOXMLParser, element:string);

    parserFoundCharacters?(parser:MIOXMLParser, characters:string);
    parserFoundComment?(parser:MIOXMLParser, comment:string);
}

export enum MIOXMLTokenType{
    Identifier,
    QuestionMark,
    ExclamationMark,
    OpenTag,
    CloseTag,
    Slash,
    Quote,
    WhiteSpace,
    End
}

export class MIOXMLParser extends MIOObject
{
    private str:string = null;
    private delegate:MIOXMLParserDelegate = null;

    private strIndex = 0;

    private elements = [];
    private attributes = null;
    private currentElement = null;
    private currentTokenValue:MIOXMLTokenType = null;
    private lastTokenValue:MIOXMLTokenType = null;

    private ignoreWhiteSpace = false;

    initWithString(str:string, delegate:MIOXMLParserDelegate){
        this.str = str;
        this.delegate = delegate;
    }

    // LEXER / TOKENIZER
    private nextChar():string{
        
        if (this.strIndex >= this.str.length) return null;
        let ch = this.str.charAt(this.strIndex);
        this.strIndex++;
        return ch;
    }

    private prevChar():string{
        this.strIndex--;
        return this.str.charAt(this.strIndex);
    }

    private readToken():string{

        let exit = false;
        let value = "";

        while(exit == false){

            let ch = this.nextChar();
            if (ch == null) return null;

            if (ch == "<" || ch == ">" || ch == "/" || ch == "?" || ch == "!"){
                
                if (value.length > 0) 
                    this.prevChar();                    
                else 
                    value = ch;
                exit = true;
            }
            else if (ch == "\"" || ch == "'") {                
                value += ch;
                let ch2 = this.nextChar();
                while(ch2 != ch && ch2 != "<"){                    
                    value += ch2;
                    ch2 = this.nextChar();                    
                }
                if (ch2 != "<") value += ch2;
                else this.prevChar();                
            }
            else if (ch == " "){
                if (this.ignoreWhiteSpace == false){
                    if (value != "") this.prevChar();
                    else value = " ";
                }
                exit = true;
            }                                
            else
                value += ch;
        }

        return value;
    }    

    private nextToken():[MIOXMLTokenType, string]{
        
        this.lastTokenValue = this.currentTokenValue;

        let exit = false;
        let token = MIOXMLTokenType.Identifier;
        let value = this.readToken();                        

        if (value == null) return [MIOXMLTokenType.End, null];

        switch(value){

            case "<":
                token = MIOXMLTokenType.OpenTag;
                break;

            case ">":
                token = MIOXMLTokenType.CloseTag;
                break;                

            case "/":
                token = MIOXMLTokenType.Slash;
                break;

            case "?":
                token = MIOXMLTokenType.QuestionMark;
                break;

            case "!":
                token = MIOXMLTokenType.ExclamationMark;
                break;
            
            case " ":
                token = MIOXMLTokenType.WhiteSpace;
                break;

            default:
                break;
        }

        this.currentTokenValue = token;
        
        return [token, value];
    }

    private prevToken():MIOXMLTokenType{
        
        return this.lastTokenValue;
    }

    //
    // Parser
    //

    parse(){

        //console.log("**** Start parser")

        if (typeof this.delegate.parserDidStartDocument === "function")
            this.delegate.parserDidStartDocument(this);

        let token, value;
        [token, value] = this.nextToken();
                
        while(token != MIOXMLTokenType.End){

            switch(token) {

                case MIOXMLTokenType.OpenTag:
                    this.ignoreWhiteSpace = true;
                    this.openTag();
                    this.ignoreWhiteSpace = false;
                    break;

                case MIOXMLTokenType.Identifier:
                case MIOXMLTokenType.Slash:
                case MIOXMLTokenType.WhiteSpace:
                    this.text(value);
                    break;                    

                default:
                    break;
            }

            [token, value] = this.nextToken();
        }

        //console.log("**** End parser")

        if (typeof this.delegate.parserDidEndDocument === "function")
            this.delegate.parserDidEndDocument(this);
    }

    private openTag(){

        //console.log("Open Tag");
        
        this.attributes = {};

        var token, value;
        [token, value] = this.nextToken();

        switch(token){

            case MIOXMLTokenType.Identifier:
                this.beginElement(value);
                break;                        

            case MIOXMLTokenType.QuestionMark:
                this.questionMark();
                break;

            case MIOXMLTokenType.ExclamationMark:
                this.exclamationMark();
                break;

            case MIOXMLTokenType.Slash:
                this.slash();
                break;

            default:
                this.error("Expected: element");
                break;
        }
    }

    private questionMark(){
        
        //console.log("Question mark");
        var token, val;
        [token, val] = this.nextToken();

        switch (token){

            case MIOXMLTokenType.Identifier:
                this.xmlOpenTag(val);
                break;

            case MIOXMLTokenType.CloseTag:
                this.xmlCloseTag();
                break;   
                
            default:
                break;
        }        
    }

    private exclamationMark() {

        let ch = this.nextChar();
        let foundMark = 0;

        if (ch == "-"){
            foundMark++;
            ch = this.nextChar();
            if (ch == "-") {
                foundMark++;
            }
        }

        if (foundMark < 2) {
            for (let i = 0; i < foundMark; i++) {
                this.prevChar();
            }
        } else {

            let comments = "";
            let exit = false;

            while (exit == false) {
                let ch2 = this.nextChar();
                if (ch2 == null) throw new Error("MIOXMLParser: Unexpected end of file!");
                comments += ch2;                
                if (comments.length >= 3 && comments.substr(-3) == "-->") exit = true;
            }

            this.comments(comments.substr(0, comments.length - 3));
        }
    }

    private xmlOpenTag(value){
     
        //console.log("XML open tag");

        let token, val;
        [token, val] = this.nextToken();

        switch (token){

            case MIOXMLTokenType.Identifier:
                this.attribute(val);
                break;

            case MIOXMLTokenType.QuestionMark:
                this.questionMark();
                break;

            default:
                break;
        }
    }

    private xmlCloseTag(){
        //console.log("XML close tag");
    }

    private beginElement(value){

        //console.log("Begin Element: " + value);
        
        this.elements.push(value);
        this.currentElement = value;
        this.attributes = {};

        let token, val;
        [token, val] = this.nextToken();

        switch (token){

            case MIOXMLTokenType.Identifier:
                this.attribute(val);
                break;

            case MIOXMLTokenType.Slash:
                this.slash();
                break;

            case MIOXMLTokenType.CloseTag:
                this.closeTag();
                this.didStartElement();                                
                break;

            default:
                break;
        }
    }

    private endElement(value){

        //console.log("End Element: " + value);

        //this.elements.push(value);
        this.attributes = {};
        this.currentElement = null;

        let token, val;
        [token, val] = this.nextToken();

        switch (token){

            case MIOXMLTokenType.CloseTag:
                this.closeTag();
                this.didEndElement();
                break;

            default:
                this.error("Expected: close token");
                break;
        }
    }

    private attribute(attr){

        //console.log("Attribute: " + attr);

        this.decodeAttribute(attr);

        let token, value;
        [token, value] = this.nextToken();

        switch (token){

            case MIOXMLTokenType.Identifier:
                this.attribute(value);
                break;

            case MIOXMLTokenType.Slash:
                this.slash();
                break;

            case MIOXMLTokenType.QuestionMark:
                this.questionMark();
                break;

            case MIOXMLTokenType.CloseTag:
                this.closeTag();
                this.didStartElement();                
                break;

            default:
                break;
        }
    }

    private decodeAttribute(attr){

        var key = null;
        var value = null;        
        var token = "";

        for (let index = 0; index < attr.length; index++){

            let ch = attr[index];
            if (ch == "=") {
                key = token;
                token = "";
            }
            else if (ch == "\"" || ch == "'") {
                
                index++;
                let ch2 = attr[index];
                while(ch2 != ch){
                    token += ch2;
                    index++;
                    ch2 = attr[index];
                }
            }
            else {
                token += ch;
            }
        }
        
        if (key != null && token.length > 0) value = token;
        else if (key == null && token.length > 0) key = token;

        this.attributes[key] = value;        
    }

    private slash(){
        
        let token, value;
        [token, value] = this.nextToken();

        switch(token){

            case MIOXMLTokenType.CloseTag:                    
                this.closeTag();
                this.didStartElement();
                this.didEndElement();                
                break;            

            case MIOXMLTokenType.Identifier:
                this.endElement(value);
                break;     
                
            default:
                break;
        }
    }

    private closeTag(){        
        
        //console.log("Close Tag");
    }

    private didStartElement(){        
        
        let element = this.currentElement;
        //console.log("Start Element: " + element);
        if (typeof this.delegate.parserDidStartElement === "function")
            this.delegate.parserDidStartElement(this, element, this.attributes);

        this.currentElement = null;
        this.attributes = {};        
    }

    private didEndElement(){        
        
        let element = this.elements.pop();
        //console.log("End Element " + element);        
        if (typeof this.delegate.parserDidEndElement === "function")
            this.delegate.parserDidEndElement(this, element);
    }

    private text(value){        
        //console.log("Text: " + value);
        if (typeof this.delegate.parserFoundCharacters === "function")
            this.delegate.parserFoundCharacters(this, value);        
    }

    private comments(comment:string){
        if (typeof this.delegate.parserFoundComment === "function")
            this.delegate.parserFoundComment(this, comment);                
    }

    private error(expected){
        MIOLog("Error: Unexpected token. " + expected);
    }

}
