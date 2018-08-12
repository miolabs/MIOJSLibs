import { MIOCoreStringHasSuffix } from "./MIOCoreString";

export interface MIOCoreHTMLParserDelegate {
    parserDidStartElement(parser:MIOCoreHTMLParser, element, attributes);
    parserDidEndElement(parser:MIOCoreHTMLParser, element);

    parserFoundCharacters(parser:MIOCoreHTMLParser, characters:string);

    parserFoundComment(parser:MIOCoreHTMLParser, comment:string);

    parserDidStartDocument(parser:MIOCoreHTMLParser);
    parserDidEndDocument(parser:MIOCoreHTMLParser);
}

export enum MIOCoreHTMLParserTokenType {
    Identifier,    
    OpenTag,    
    CloseTag,
    OpenCloseTag,
    InlineCloseTag,
    Question,
    Exclamation,
    Equal,
    Quote,
    Commentary,
    End
}

export class MIOCoreHTMLParser 
{
    private string:string = null;
    private stringIndex = 0;
    private delegate:MIOCoreHTMLParserDelegate = null;

    private exceptionsTags = ["!DOCTYPE", "area", "base", "br", "col", "hr", "img", "input", "link", "meta", "param", "keygen", "source"];

    initWithString(string:string, delegate:MIOCoreHTMLParserDelegate) {
        this.string = string;
        this.delegate = delegate;
    }

    private nextChar():string{
        if (this.stringIndex >= this.string.length) return null;
        let ch = this.string.charAt(this.stringIndex);
        this.stringIndex++;
        return ch;
    }

    private prevChar():string{
        this.stringIndex--;
        return this.string.charAt(this.stringIndex);
    }

    private getChars(stopChars) {

        var chs:string = "";        
        var exit = false;
        while(exit == false) {
            chs += this.nextChar();
            if (MIOCoreStringHasSuffix(chs, stopChars) == true) exit = true;
        }

        // Remove the stop chars
        return chs.substr(0, chs.length - stopChars.length);
    }

    /*
    STREAM TOKENIZER
    */

    private readToken(){
                
        let value = "";

        this.lastTokenIndex = this.stringIndex;

        let ch = this.nextChar();        
        if (ch == null) return null;
        while(ch == " ") ch = this.nextChar();

        let exit = false;
        while (exit == false) {
            
            switch(ch) {
                case "<":
                    if (value.length == 0) value = this.minor();
                    else this.prevChar();
                    exit = true;
                    break;

                // case "!":
                //     if (value.length == 0) value = this.exclamation();
                //     else this.prevChar();
                //     exit = true;
                //     break;

                case ">":
                    if (value.length == 0) value = this.major();
                    else this.prevChar();
                    exit = true;
                    break;

                // case "/":
                //     if (value.length == 0) value = this.slash();
                //     else this.prevChar();                    
                //     exit = true;
                //     break;

                case "=":
                    if (value.length == 0) value = ch;
                    else this.prevChar();
                    exit = true;

                case " ":
                    exit = true;
                    break;      
                    
                case "\"":                    
                case "'":
                    if (value.length == 0) value = ch;
                    exit = true;
                    break;

                default:
                    value += ch;
                    ch = this.nextChar();
                    if (ch == null) exit = true;
                    break;
            }
            
        }

        return value;
    }

    private minor(){
        let ch = this.nextChar();
        let value = "";

        switch (ch) {
            case "/":
                value = "</";    
                break;

            case "!":
                value = this.exclamation();
                break;

            default: 
                value = "<";
                this.prevChar();
                break;
            
        }
        
        return value;
    }

    private major(){

        this.prevChar(); // Major symbol
        let ch = this.prevChar();

        let value = ">";
        if (ch == "/"){
            value = "/>";
        }

        value = this.nextChar();
        value = this.nextChar();            
        return value;
    }

    // private slash(){

    //     let ch = this.nextChar();
    //     if (ch == ">") return "/>";

    //     this.unexpectedToken();
    // }

    private exclamation(){

        let ch = this.nextChar();
        if (ch == "-") {
            let ch2 = this.nextChar();
            if (ch2 == "-") {
                return "<!--";
            }
            else this.unexpectedToken(ch + ch2);
        }
        
        this.prevChar();
        this.prevChar();
        return "<";
    }

    private lastTokenIndex = -1;
    private lastTokenValue:string = null;
    private prevToken() {
        this.stringIndex = this.lastTokenIndex;
        this.lastTokenIndex = -1;
        let value = this.lastTokenValue;
        this.lastTokenValue = null;
        return value;
    }

    private nextToken(){

        let type = MIOCoreHTMLParserTokenType.Identifier;
        let value = this.readToken();

        if (value == null) return [MIOCoreHTMLParserTokenType.End, value];

        switch(value) {
            case "<":
                type = MIOCoreHTMLParserTokenType.OpenTag;
                break;

            case ">":
                type = MIOCoreHTMLParserTokenType.CloseTag;
                break;

            case "</":
                type = MIOCoreHTMLParserTokenType.OpenCloseTag;
                break;                

            case "/>":
                type = MIOCoreHTMLParserTokenType.InlineCloseTag;
                break;

            case "<!--":
                type = MIOCoreHTMLParserTokenType.Commentary;                
                break;

            case "=":
                type = MIOCoreHTMLParserTokenType.Equal;
                break;       
                
            case "\"":
            case "'":
                type = MIOCoreHTMLParserTokenType.Quote;
                break;
        }

        this.lastTokenValue = value;
        return [type, value];
    }

    /* 
        PARSER
    */

    parse(){
        if (this.string == null) return;
        
        if (typeof this.delegate.parserDidStartDocument === "function") {
            this.delegate.parserDidStartDocument(this);
        }
        
        let exit = false;        
        do {            
            let [type, value] = this.nextToken();
            switch (type) {

                case MIOCoreHTMLParserTokenType.OpenTag:
                    this.openTag();
                    break;

                case MIOCoreHTMLParserTokenType.OpenCloseTag:
                    this.closeElement();
                    break;
                        
                case MIOCoreHTMLParserTokenType.Commentary:
                    this.comment();
                    break;

                case MIOCoreHTMLParserTokenType.Identifier:
                    this.foundChars(value);
                    break;

                case MIOCoreHTMLParserTokenType.End:
                    exit = true;
                    break;

                default:
                    this.unexpectedToken(value);
                    break;
            }

        } while (exit == false);

        if (typeof this.delegate.parserDidEndDocument === "function") {
            this.delegate.parserDidEndDocument(this);
        }

    }

    private unexpectedToken(value) {
        throw new Error("Unexpected token: " + value);
    }

    private openTag(){

        let [type, value] = this.nextToken();
        switch (type){

            case MIOCoreHTMLParserTokenType.Identifier:
                this.openElement(value);
                break;

            case MIOCoreHTMLParserTokenType.Exclamation:
                this.exclamation();
                break;                            
        }
    }

    private openElement(element){        
        let attributes = this.attributes();
        this.closeTag(element, attributes);
    }

    private attributes(){        

        var attributes = {};
        var exit = false;
        
        var attrKey = null;

        let isKey = true;

        while (exit == false) {

            let [type, value] = this.nextToken();
            switch (type) {
            
                case MIOCoreHTMLParserTokenType.Identifier:
                    if (isKey) {
                        attrKey = value;
                        attributes[attrKey] = null;
                    }
                    else {
                        attributes[attrKey] = value;
                        isKey = true;
                    }
                    break;

                case MIOCoreHTMLParserTokenType.Equal:
                    isKey = false;
                    break;

                case MIOCoreHTMLParserTokenType.Quote:
                    attributes[attrKey] = this.getChars(value);
                    isKey = true;
                    break;

                case MIOCoreHTMLParserTokenType.CloseTag:
                case MIOCoreHTMLParserTokenType.InlineCloseTag:
                    this.prevToken();
                    exit = true;
                    break;                    
            }            
        }  
        
        return attributes;
    }

    private closeTag(element, attributes){

        let [type, value] = this.nextToken();

        switch (type) {

            case MIOCoreHTMLParserTokenType.CloseTag:
                if (typeof this.delegate.parserDidStartElement === "function") {
                    this.delegate.parserDidStartElement(this, element, attributes);
                }
                // Only call close element for the execeptions tags            
                if ((this.exceptionsTags.indexOf(element) > -1) && (typeof this.delegate.parserDidEndElement === "function")) {
                    this.delegate.parserDidEndElement(this, element);
                }

                // Special cases like <style></style> or <script></script>
                // We need to read everything 'til the next close tag
                if (element == "style" || element == "script"){
                    let chars = this.readToNextString("</" + element + ">");
                    this.foundChars(chars);
                    
                    if (typeof this.delegate.parserDidEndElement === "function") {
                        this.delegate.parserDidEndElement(this, element);
                    }                                        
                }                
                
                break;

            case MIOCoreHTMLParserTokenType.InlineCloseTag:
                if (typeof this.delegate.parserDidEndElement === "function") {
                    this.delegate.parserDidEndElement(this, element);
                }                
                break;

            default:
                this.unexpectedToken(value);
                break;
        }

    }

    private closeElement(){
        
        let [type, value] = this.nextToken();
        if (type != MIOCoreHTMLParserTokenType.Identifier) this.unexpectedToken(value);
        let element = value;

        [type, value] = this.nextToken();
        if (type != MIOCoreHTMLParserTokenType.CloseTag) this.unexpectedToken(value);
        
        if (typeof this.delegate.parserDidEndElement === "function") {
            this.delegate.parserDidEndElement(this, element);
        }
    }    

    private comment(){
        let cmt = this.getChars("-->");
        if (typeof this.delegate.parserFoundComment === "function") {
            this.delegate.parserFoundComment(this, cmt);
        }
    }

    private foundChars(chars){
        if (chars == null) return;
        if (typeof this.delegate.parserFoundCharacters === "function") {
            this.delegate.parserFoundCharacters(this, chars);
        }        
    }

    private readToNextString(element:string){
        
        let str = "";
        for (let index = 0; index < element.length; index++){
            let ch = this.nextChar();
            if (ch == null) throw Error("Unexpected end of string: " + str);
            str += ch;
        }

        if (str == element) return null;
        
        let exit = false;
        while (exit == false){
            let ch = this.nextChar();            
            if (ch == null) throw Error("Unexpected end of string: " + str);
            str += ch;
            let cmp = str.substr(-element.length);
            if (cmp == element) exit = true;
        }

        let chars = str.substr(0, str.length - element.length);
        console.log("*****\n" + chars + "\n*****\n");
        return chars;
    }

}