
/// <reference path="MIOObject.ts" />


enum MIOXMLTokenType{
    Identifier,
    QuestionMark,
    OpenTag,
    CloseTag,
    Slash,
    Quote,
    End
}

class MIOXMLParser extends MIOObject
{
    private str:string = null;
    private delegate = null;

    private strIndex = 0;

    private elements = [];
    private attributes = null;
    private currentElement = null;
    private currentTokenValue:MIOXMLTokenType = null;
    private lastTokenValue:MIOXMLTokenType = null;

    initWithString(str:string, delegate){
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

            if (ch == "<" || ch == ">" || ch == "/" || ch == "?"){
                
                if (value.length > 0) 
                    this.prevChar();                    
                else 
                    value = ch;
                exit = true;
            }
            else if (ch == " "){
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

        var token, value;
        [token, value] = this.nextToken();
                
        while(token != MIOXMLTokenType.End){

            switch(token) {

                case MIOXMLTokenType.OpenTag:
                    this.openTag();
                    break;

                case MIOXMLTokenType.Identifier:
                    this.text(value);
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

            case MIOXMLTokenType.QuestionMark:
                this.questionMark();
                break;

            case MIOXMLTokenType.Identifier:
                this.beginElement(value);
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

        var token, value;
        [token, value] = this.nextToken();

        switch (token){

            case MIOXMLTokenType.Identifier:
                this.xmlOpenTag(value);
                break;

            case MIOXMLTokenType.CloseTag:
                this.xmlCloseTag();
                break;                
        }        
    }

    private xmlOpenTag(value){
     
        //console.log("XML open tag");

        var token, value;
        [token, value] = this.nextToken();

        switch (token){

            case MIOXMLTokenType.Identifier:
                this.attribute(value);
                break;

            case MIOXMLTokenType.QuestionMark:
                this.questionMark();
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

        var token, value;
        [token, value] = this.nextToken();

        switch (token){

            case MIOXMLTokenType.Identifier:
                this.attribute(value);
                break;

            case MIOXMLTokenType.Slash:
                this.slash();
                break;

            case MIOXMLTokenType.CloseTag:
                this.closeTag();
                break;
        }
    }

    private endElement(value){

        //console.log("End Element: " + value);

        //this.elements.push(value);
        this.attributes = {};
        this.currentElement = null;

        var token, value;
        [token, value] = this.nextToken();

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

        var token, value;
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
        }
    }

    private decodeAttribute(attr){

        var key = null;
        var value = null;        
        var token = "";

        for (var index = 0; index < attr.length; index++){

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
        if (typeof this.delegate.parserFoundString === "function")
            this.delegate.parserFoundString(this, value);        
    }

    private error(expected){
        MIOLog("Error: Unexpected token. " + expected);
    }

}
