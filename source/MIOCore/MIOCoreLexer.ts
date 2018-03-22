
export enum MIOCoreLexerTokenType {
    Identifier,
    
    UUIDValue,
    StringValue,
    NumberValue,
    BooleanValue,    
    NullValue,
    PropertyValue,

    MinorOrEqualComparator,
    MinorComparator,
    MajorOrEqualComparator,
    MajorComparator,
    EqualComparator,
    DistinctComparator,
    ContainsComparator,
    NotContainsComparator,
    InComparator,
    NotIntComparator,
    
    OpenParenthesisSymbol,
    CloseParenthesisSymbol,
    Whitespace,

    AND,
    OR
}

export class MIOCoreLexer {

    private input:string = null;
    private tokenTypes = [];
    private tokens = null;
    private tokenIndex = -1;

    private ignoreTokenTypes = [];

    constructor(string:string) {
        this.input = string;
    }

    addTokenType(type, regex) {
        this.tokenTypes.push({"regex":regex, "type":type});
    }

    ignoreTokenType(type) {

        this.ignoreTokenTypes.push(type);
    }

    tokenize() {

        this.tokens = this._tokenize();
        this.tokenIndex = 0;
    }

    private _tokenize(){
        
        var tokens = [];
        var foundToken = false;
    
        var match;
        var i;
        var numTokenTypes = this.tokenTypes.length;
    
        do {          
            foundToken = false;  
            for (i = 0; i < numTokenTypes; i++) {
                let regex = this.tokenTypes[i].regex;
                let type:MIOCoreLexerTokenType = this.tokenTypes[i].type;
    
                match = regex.exec(this.input);
                if (match) {
                    if (this.ignoreTokenTypes.indexOf(type) == -1) {
                        tokens.push({ type: type, value: match[0] });
                    }
                    this.input = this.input.substring(match[0].length);
                    foundToken = true;
                    break;  
                }              
            }
            
            if (foundToken == false) {
                throw new Error(`MIOCoreLexer: Token doesn't match any pattern. (${this.input})`);
            }
            
        } while (this.input.length > 0);
    
        return tokens;
    }    

    nextToken(){

        if (this.tokenIndex >= this.tokens.length) {
            return null;
        }

        let token = this.tokens[this.tokenIndex];
        this.tokenIndex++;

        // Check if we have to ignore
        let index = this.ignoreTokenTypes.indexOf(token.type);        
        return index == -1 ? token : this.nextToken();
    }
    
    prevToken(){

        this.tokenIndex--;
        if (this.tokenIndex < 0) {
            return null;
        }
        
        let token = this.tokens[this.tokenIndex];

        // Check if we have to ignore
        let index = this.ignoreTokenTypes.indexOf(token.type);                                        
        return index == -1 ? token : this.prevToken();
    }
}