/**
 * Created by godshadow on 1/5/16.
 */

/// <reference path="../MIOCore/MIOCoreLexer.ts" />
/// <reference path="MIOObject.ts" />

/// <reference path="MIOISO8601DateFormatter.ts" />

enum MIOPredicateComparatorType {
    Equal,
    Less,
    LessOrEqual,
    Greater,
    GreaterOrEqual,
    Distinct,    
    Contains,
    NotContains,
    In,
    NotIn
}

enum MIOPredicateOperatorType {
    OR,
    AND
}

enum MIOPredicateType {
    Predicate,
    Item,
    Operation
}

class MIOPredicateOperator {
    type = null;

    public static andPredicateOperatorType() {
        var op = new MIOPredicateOperator(MIOPredicateOperatorType.AND);
        return op;
    }

    public static orPredicateOperatorType() {
        var op = new MIOPredicateOperator(MIOPredicateOperatorType.OR);
        return op;
    }

    constructor(type) {
        this.type = type;
    }
}

enum MIOPredicateItemValueType {
    
    Undefined,
    UUID,
    String,
    Number,
    Boolean,    
    Null,
    Property
}

class MIOPredicateItem {
    key = null;
    comparator = null;
    value = null;
    valueType = MIOPredicateItemValueType.Undefined;

    evaluateObject(object:MIOObject) {

        var lValue = object.valueForKeyPath(this.key);
        if (lValue instanceof Date) {
            let sdf = new MIOISO8601DateFormatter();
            sdf.init();
            lValue = sdf.stringFromDate(lValue);
        }

        var rValue = this.value;
        if (this.valueType == MIOPredicateItemValueType.Property){
            rValue = object.valueForKeyPath(rValue);
        }
        
        if (this.comparator == MIOPredicateComparatorType.Equal)
            return (lValue == rValue);
        else if (this.comparator == MIOPredicateComparatorType.Distinct)
            return (lValue != rValue);
        else if (this.comparator == MIOPredicateComparatorType.Less)
            return (lValue < rValue);
        else if (this.comparator == MIOPredicateComparatorType.LessOrEqual)
            return (lValue <= rValue);        
        else if (this.comparator == MIOPredicateComparatorType.Greater)
            return (lValue > rValue);
        else if (this.comparator == MIOPredicateComparatorType.GreaterOrEqual)
            return (lValue >= rValue);        
        else if (this.comparator == MIOPredicateComparatorType.Contains) {
            if (lValue == null)
                return false;

            lValue = lValue.toLowerCase();
            if (lValue.indexOf(rValue.toLowerCase()) > -1)
                return true;

            return false;
        }
        else if (this.comparator == MIOPredicateComparatorType.NotContains) {
            if (lValue == null)
                return true;

            lValue = lValue.toLowerCase();
            if (lValue.indexOf(rValue.toLowerCase()) > -1)
                return false;

            return true;
        }
    }
}

class MIOPredicateGroup {

    predicates = [];

    evaluateObject(object):boolean {
        
        var result = false;
        var op = null;
        var lastResult = null;

        for (var count = 0; count < this.predicates.length; count++) {
            var o = this.predicates[count];

            if (o instanceof MIOPredicateGroup) {
                result = o.evaluateObject(object);
            }
            else if (o instanceof MIOPredicateItem) {
                result = o.evaluateObject(object);
            }
            else if (o instanceof MIOPredicateOperator) {
                op = o.type;
                lastResult = result;
                result = null;
            }
            else {
                throw("MIOPredicate: Error. Predicate class type invalid. (" + o + ")");
            }

            if (op != null && result != null) {
                if (op == MIOPredicateOperatorType.AND) {
                    result = result && lastResult;
                    op = null;
                    if (result == false)
                        break;
                }
                else if (op == MIOPredicateOperatorType.OR) {
                    result = result || lastResult;
                    op = null;
                }
            }
        }

        return result;
    }
}

enum MIOPredicateTokenType{
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

class MIOPredicate extends MIOObject {
     
    predicateGroup = null;

    private lexer:MIOCoreLexer = null;

    public static predicateWithFormat(format) {
        var p = new MIOPredicate();
        p.initWithFormat(format);

        return p;
    }

    initWithFormat(format) {
        this.parse(format);
    }

    evaluateObject(object:MIOObject) {        
        return this.predicateGroup.evaluateObject(object);
    }

    // 
    // Parse format string
    //

    private tokenizeWithFormat(format:string){
        
        this.lexer = new MIOCoreLexer(format);
        
        // Values
        
        this.lexer.addTokenType(MIOPredicateTokenType.UUIDValue, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        this.lexer.addTokenType(MIOPredicateTokenType.StringValue, /^"([^"]*)"|^'([^']*)'/);

        this.lexer.addTokenType(MIOPredicateTokenType.NumberValue, /^-?\d+(?:\.\d+)?(?:e[+\-]?\d+)?/i);
        this.lexer.addTokenType(MIOPredicateTokenType.BooleanValue, /^true|false/i);
        this.lexer.addTokenType(MIOPredicateTokenType.NullValue, /^null|nil/i);
        // Symbols
        this.lexer.addTokenType(MIOPredicateTokenType.OpenParenthesisSymbol, /^\(/);
        this.lexer.addTokenType(MIOPredicateTokenType.CloseParenthesisSymbol, /^\)/);
        // Comparators
        this.lexer.addTokenType(MIOPredicateTokenType.MinorOrEqualComparator, /^<=?/);
        this.lexer.addTokenType(MIOPredicateTokenType.MinorComparator, /^</);
        this.lexer.addTokenType(MIOPredicateTokenType.MajorOrEqualComparator, /^>=?/);
        this.lexer.addTokenType(MIOPredicateTokenType.MajorComparator, /^>/);
        this.lexer.addTokenType(MIOPredicateTokenType.EqualComparator, /^==?/);
        this.lexer.addTokenType(MIOPredicateTokenType.DistinctComparator, /^!=/);
        this.lexer.addTokenType(MIOPredicateTokenType.NotContainsComparator, /^not contains/i);
        this.lexer.addTokenType(MIOPredicateTokenType.ContainsComparator, /^contains/i);
        this.lexer.addTokenType(MIOPredicateTokenType.InComparator, /^in/i);
        // Join operators
        this.lexer.addTokenType(MIOPredicateTokenType.AND, /^and|&&/i);
        this.lexer.addTokenType(MIOPredicateTokenType.OR, /^or|\|\|/i);        
        // Extra
        this.lexer.addTokenType(MIOPredicateTokenType.Whitespace, /^\s+/);        
        this.lexer.ignoreTokenType(MIOPredicateTokenType.Whitespace);
        // Identifiers - Has to be the last one
        this.lexer.addTokenType(MIOPredicateTokenType.Identifier, /^[a-zA-Z-_][a-zA-Z0-9-_\.]*/);            

        this.lexer.tokenize();
    }    

    private parse(format:string){

        console.log("**** Start predicate format parser")
        console.log(format);
        console.log("****")
        
        this.tokenizeWithFormat(format);
        this.predicateGroup = new MIOPredicateGroup();
        this.predicateGroup.predicates = this.parsePredicates();
        
        console.log("**** End predicate format parser")
    }

    private parsePredicates(){

        var token = this.lexer.nextToken();
        var predicates = [];
        var exit = false;

        while (token != null && exit == false) {
            
            switch (token.type) {

                case MIOPredicateTokenType.Identifier:
                    let pi = new MIOPredicateItem();
                    this.lexer.prevToken();
                    this.property(pi);
                    this.comparator(pi);
                    this.value(pi);
                    predicates.push(pi);
                    break;

                case MIOPredicateTokenType.AND:
                    predicates.push(MIOPredicateOperator.andPredicateOperatorType());
                    break;

                case MIOPredicateTokenType.OR:
                    predicates.push(MIOPredicateOperator.orPredicateOperatorType());
                    break;                    

                case MIOPredicateTokenType.OpenParenthesisSymbol:
                    let pg = new MIOPredicateGroup();
                    pg.predicates = this.parsePredicates();
                    predicates.push(pg);
                    break;

                case MIOPredicateTokenType.CloseParenthesisSymbol:
                    exit = true;
                    break;

                default:
                    throw("MIOPredicate: Error. Unexpected token. (" + token.value + ")");
            }

            if (exit != true) {
                token = this.lexer.nextToken();
            }
        }

        return predicates;
    }

    private property(item:MIOPredicateItem) {
        
        var token = this.lexer.nextToken();

        switch (token.type) {

            case MIOPredicateTokenType.Identifier:
                item.key = token.value;
                break;

            default:
                throw("MIOPredicate: Error. Unexpected identifier key. (" + token.value + ")");
        }                    
    }

    private comparator(item:MIOPredicateItem) {
        
        var token = this.lexer.nextToken();

        switch(token.type) {

            case MIOPredicateTokenType.EqualComparator:
                item.comparator = MIOPredicateComparatorType.Equal;
                break;

            case MIOPredicateTokenType.MajorComparator:
                item.comparator = MIOPredicateComparatorType.Greater;
                break;

            case MIOPredicateTokenType.MajorOrEqualComparator:
                item.comparator = MIOPredicateComparatorType.GreaterOrEqual;
                break;

            case MIOPredicateTokenType.MinorComparator:
                item.comparator = MIOPredicateComparatorType.Less;
                break;
                
            case MIOPredicateTokenType.MinorOrEqualComparator:
                item.comparator = MIOPredicateComparatorType.LessOrEqual;
                break;

            case MIOPredicateTokenType.DistinctComparator:
                item.comparator = MIOPredicateComparatorType.Distinct;
                break;

            case MIOPredicateTokenType.ContainsComparator:
                item.comparator = MIOPredicateComparatorType.Contains;
                break;

            case MIOPredicateTokenType.NotContainsComparator:
                item.comparator = MIOPredicateComparatorType.NotContains;
                break;                

            case MIOPredicateTokenType.InComparator:
                item.comparator = MIOPredicateComparatorType.In;
                break;

            default:
                throw("MIOPredicate: Error. Unexpected comparator. (" + token.value + ")");                                
        }

    }

    private value(item:MIOPredicateItem) {

        var token = this.lexer.nextToken();
        
        switch(token.type) {
            
            case MIOPredicateTokenType.UUIDValue:
                item.value = token.value;
                item.valueType = MIOPredicateItemValueType.UUID;
                break;
            
            case MIOPredicateTokenType.StringValue:
                item.value = token.value.substring(1, token.value.length - 1);
                item.valueType = MIOPredicateItemValueType.String;
                break;

            case MIOPredicateTokenType.NumberValue:
                item.value = token.value;
                item.valueType = MIOPredicateItemValueType.Number;
                break;

            case MIOPredicateTokenType.BooleanValue:
                item.value = this.booleanFromString(token.value);
                item.valueType = MIOPredicateItemValueType.Boolean;
                break;

            case MIOPredicateTokenType.NullValue:
                item.value = this.nullFromString(token.value);
                item.valueType = MIOPredicateItemValueType.Null;
                break;

            case MIOPredicateTokenType.Identifier:
                item.value = token.value;
                item.valueType = MIOPredicateItemValueType.Property;
                break;

            default:
                throw("MIOPredicate: Error. Unexpected comparator. (" + token.value + ")");
        }            
    }

    private booleanFromString(value:string){

        let v = value.toLocaleLowerCase();
        var bv = false;
        
        switch (v) {

            case "yes":
            case "true":
                bv = true;
                break;

            case "no":
            case "false":
                bv = false;
                break;

            default:
                throw("MIOPredicate: Error. Cann't convert '" + value + "' to boolean");
        }

        return bv;
    }

    private nullFromString(value:string){

        let v = value.toLocaleLowerCase();
        var nv = null;

        switch (v) {

            case "nil":
            case "null":
                nv = null;
                break;

            default:
                throw("MIOPredicate: Error. Cann't convert '" + value + "' to null");
        }

        return nv;
    }
}

//
// For internal purposes: Don't use it, could change
//

function _MIOPredicateFilterObjects(objs, predicate)
{
    var resultObjects = null;

    if (objs.length == 0 || predicate == null) {
        resultObjects = objs.slice(0);        
    } 
    else {    
        
        resultObjects = objs.filter(function(obj){

            var result = predicate.evaluateObject(obj);
            if (result)
                return obj;
        });
    }

    return resultObjects;
}
