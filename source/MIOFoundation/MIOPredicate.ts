import { MIOCoreLexer } from "../MIOCore";
import { MIOObject } from "./MIOObject";
import { MIOISO8601DateFormatter } from "./MIOISO8601DateFormatter";

/**
 * Created by godshadow on 1/5/16.
 */

export enum MIOPredicateComparatorType {
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

export enum MIOPredicateRelationshipOperatorType {
    ANY,
    ALL
}

export enum MIOPredicateOperatorType {
    OR,
    AND
}

export enum MIOPredicateBitwiseOperatorType {
    OR,
    AND,
    XOR
}

export enum MIOPredicateType {
    Predicate,
    Item,
    Operation
}

export class MIOPredicateOperator {
    type = null;

    public static andPredicateOperatorType() {
        let op = new MIOPredicateOperator(MIOPredicateOperatorType.AND);
        return op;
    }

    public static orPredicateOperatorType() {
        let op = new MIOPredicateOperator(MIOPredicateOperatorType.OR);
        return op;
    }

    constructor(type) {
        this.type = type;
    }    
}

export enum MIOPredicateItemValueType {
    
    Undefined,
    UUID,
    String,
    Number,
    Boolean,    
    Null,
    Property
}

export class MIOPredicateItem {
    relationshipOperation:MIOPredicateRelationshipOperatorType = null;
    bitwiseOperation:MIOPredicateBitwiseOperatorType = null;
    bitwiseKey:string = null;
    bitwiseValue = null;
    key = null;
    comparator = null;
    value = null;
    valueType = MIOPredicateItemValueType.Undefined;

    evaluateObject(object, key?, lvalue?) {

        let lValue = lvalue;        
        if (lvalue == null) {
            let k = key != null ? key : this.key;            
            if (object instanceof MIOObject) {
                lValue = object.valueForKeyPath(k);
            }
            else {
                lValue = object[k];
            }
            
            if (lValue instanceof Date) {
                let sdf = new MIOISO8601DateFormatter();
                sdf.init();
                lValue = sdf.stringFromDate(lValue);
            }
            else if (typeof lValue === "string") {
                lValue = lValue.toLocaleLowerCase();
            }    
        }

        let rValue = this.value;
        if (this.valueType == MIOPredicateItemValueType.Property){
            rValue = object.valueForKeyPath(rValue);
        }
        if (typeof rValue === "string") {
            rValue = rValue.toLocaleLowerCase();
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

            if (lValue.indexOf(rValue) > -1)
                return true;

            return false;
        }
        else if (this.comparator == MIOPredicateComparatorType.NotContains) {
            if (lValue == null)
                return true;

            if (lValue.indexOf(rValue) > -1)
                return false;

            return true;
        }
    }

    evaluateRelationshipObject(object){
        let relObjs = null;
        let keys = this.key.split('.');
        let lastKey = keys[keys.length - 1];
        if (keys.length > 1) {            
            let relKey = this.key.substring(0, this.key.length - lastKey.length - 1);
            relObjs = object.valueForKeyPath(relKey);
        }
        else {
            relObjs = object.valueForKeyPath(this.key);
        }
                       
        for (let index = 0; index < relObjs.count; index++) {
            let o = relObjs.objectAtIndex(index);
            let result = this.evaluateObject(o, lastKey);
            if (result == true && this.relationshipOperation == MIOPredicateRelationshipOperatorType.ANY) {
                return true;
            }
            else if (result == false && this.relationshipOperation == MIOPredicateRelationshipOperatorType.ALL) {
                return false;
            }
        }
        
        return false;        
    }

    // HACK: Dirty hack to bitwaire comparate more than 32bits    


    evaluateBitwaseOperatorObject(object){        
        let lvalue = object.valueForKeyPath(this.bitwiseKey);         
        let rvalue =  parseInt(this.bitwiseValue);
        
        let value = 0;
        if (this.bitwiseOperation == MIOPredicateBitwiseOperatorType.AND){
            value = lvalue & rvalue;
        }
        else if (this.bitwiseOperation == MIOPredicateBitwiseOperatorType.OR){
            value = lvalue | rvalue;
        }

        return this.evaluateObject(object, null, value);        
    }
}

export class MIOPredicateGroup {

    predicates = [];

    evaluateObject(object):boolean {
        
        let result = false;
        let op = null;
        let lastResult = null;

        for (let count = 0; count < this.predicates.length; count++) {
            let o = this.predicates[count];

            if (o instanceof MIOPredicateGroup) {
                result = o.evaluateObject(object);
            }
            else if (o instanceof MIOPredicateItem) {
                if (o.relationshipOperation != null) {
                    result = o.evaluateRelationshipObject(object);                    
                }
                else if (o.bitwiseOperation != null){
                    result = o.evaluateBitwaseOperatorObject(object);
                }
                else {
                    result = o.evaluateObject(object);
                }
            }
            else if (o instanceof MIOPredicateOperator) {
                op = o.type;
                lastResult = result;
                result = null;
            }
            else {
                throw new Error(`MIOPredicate: Error. Predicate class type invalid. (${o})`);
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

export enum MIOPredicateTokenType{
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

    BitwiseAND,
    BitwiseOR,
    
    OpenParenthesisSymbol,
    CloseParenthesisSymbol,
    Whitespace,

    AND,
    OR,

    ANY,
    ALL
}

export class MIOPredicate extends MIOObject {
     
    predicateGroup = null;    

    private lexer:MIOCoreLexer = null;

    public static predicateWithFormat(format) {
        let p = new MIOPredicate();
        p.initWithFormat(format);

        return p;
    }

    initWithFormat(format) {
        this._predicateFormat = format;
        this.parse(format);
    }

    private _predicateFormat:string = null;
    get predicateFormat(){
        return this._predicateFormat;
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
        this.lexer.addTokenType(MIOPredicateTokenType.BooleanValue, /^(true|false)/i);
        this.lexer.addTokenType(MIOPredicateTokenType.NullValue, /^(null|nil)/i);
        // Symbols
        this.lexer.addTokenType(MIOPredicateTokenType.OpenParenthesisSymbol, /^\(/);
        this.lexer.addTokenType(MIOPredicateTokenType.CloseParenthesisSymbol, /^\)/);
        // Comparators
        this.lexer.addTokenType(MIOPredicateTokenType.MinorOrEqualComparator, /^<=/);
        this.lexer.addTokenType(MIOPredicateTokenType.MinorComparator, /^</);
        this.lexer.addTokenType(MIOPredicateTokenType.MajorOrEqualComparator, /^>=/);
        this.lexer.addTokenType(MIOPredicateTokenType.MajorComparator, /^>/);
        this.lexer.addTokenType(MIOPredicateTokenType.EqualComparator, /^==?/);
        this.lexer.addTokenType(MIOPredicateTokenType.DistinctComparator, /^!=/);
        this.lexer.addTokenType(MIOPredicateTokenType.NotContainsComparator, /^not contains /i);
        this.lexer.addTokenType(MIOPredicateTokenType.ContainsComparator, /^contains /i);
        this.lexer.addTokenType(MIOPredicateTokenType.InComparator, /^in /i);
        // Bitwise operators
        this.lexer.addTokenType(MIOPredicateTokenType.BitwiseAND, /^& /i);
        this.lexer.addTokenType(MIOPredicateTokenType.BitwiseOR, /^\| /i);                
        // Join operators
        this.lexer.addTokenType(MIOPredicateTokenType.AND, /^(and|&&) /i);
        this.lexer.addTokenType(MIOPredicateTokenType.OR, /^(or|\|\|) /i);        
        // Relationship operators
        this.lexer.addTokenType(MIOPredicateTokenType.ANY, /^any /i);
        this.lexer.addTokenType(MIOPredicateTokenType.ALL, /^all /i);
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

        let token = this.lexer.nextToken();
        let predicates = [];
        let exit = false;

        while (token != null && exit == false) {
            
            switch (token.type) {

                case MIOPredicateTokenType.Identifier:
                    let pi = this.nextPredicateItem();
                    predicates.push(pi);
                    break;

                case MIOPredicateTokenType.AND:
                    predicates.push(MIOPredicateOperator.andPredicateOperatorType());
                    break;

                case MIOPredicateTokenType.OR:
                    predicates.push(MIOPredicateOperator.orPredicateOperatorType());
                    break;
                    
                case MIOPredicateTokenType.ANY:
                    this.lexer.nextToken();
                    let anyPI = this.nextPredicateItem();
                    anyPI.relationshipOperation = MIOPredicateRelationshipOperatorType.ANY;
                    predicates.push(anyPI);
                    break;

                case MIOPredicateTokenType.ALL:
                    this.lexer.nextToken();
                    let allPI = this.nextPredicateItem();
                    anyPI.relationshipOperation = MIOPredicateRelationshipOperatorType.ALL;
                    predicates.push(anyPI);
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
                    throw new Error(`MIOPredicate: Error. Unexpected token. (${token.value})`);
            }

            if (exit != true) {
                token = this.lexer.nextToken();
            }
        }

        return predicates;
    }

    private nextPredicateItem(){
        let pi = new MIOPredicateItem();
        this.lexer.prevToken();
        this.property(pi);
        this.comparator(pi);
        this.value(pi);
        return pi;
    }    

    private property(item:MIOPredicateItem) {
        
        let token = this.lexer.nextToken();

        switch (token.type) {

            case MIOPredicateTokenType.Identifier:
                item.key = token.value;
                break;

            default:
                throw new Error(`MIOPredicate: Error. Unexpected identifier key. (${token.value})`);
        }                    
    }

    private comparator(item:MIOPredicateItem) {
        
        let token = this.lexer.nextToken();

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

            case MIOPredicateTokenType.BitwiseAND:
                item.bitwiseOperation = MIOPredicateBitwiseOperatorType.AND;
                item.bitwiseKey = item.key;
                item.key += " & ";
                token = this.lexer.nextToken();
                item.bitwiseValue = token.value;
                item.key += token.value;                
                this.comparator(item);                
                break;

            case MIOPredicateTokenType.BitwiseOR:
                item.bitwiseOperation = MIOPredicateBitwiseOperatorType.OR;
                item.bitwiseKey = item.key;
                item.key += " & ";
                token = this.lexer.nextToken();
                item.bitwiseValue = token.value;
                item.key += token.value;                
                this.comparator(item);                
                break;

            default:
                throw new Error(`MIOPredicate: Error. Unexpected comparator. (${token.value})`);                                
        }

    }

    private value(item:MIOPredicateItem) {

        let token = this.lexer.nextToken();
        
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
                throw new Error(`MIOPredicate: Error. Unexpected comparator. (${token.value})`);
        }            
    }

    private booleanFromString(value:string){

        let v = value.toLocaleLowerCase();
        let bv = false;
        
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
                throw new Error(`MIOPredicate: Error. Can't convert '${value}' to boolean`);
        }

        return bv;
    }

    private nullFromString(value:string){

        let v = value.toLocaleLowerCase();
        let nv = null;

        switch (v) {

            case "nil":
            case "null":
                nv = null;
                break;

            default:
                throw new Error(`MIOPredicate: Error. Can't convert '${value}' to null`);
        }

        return nv;
    }
}

//
// For internal purposes: Don't use it, could change
//

export function _MIOPredicateFilterObjects(objs, predicate)
{
    if (objs == null) return [];

    let resultObjects = null;    

    if (objs.length == 0 || predicate == null) {
        resultObjects = objs.slice(0);        
    } 
    else {    
        
        resultObjects = objs.filter(function(obj){

            let result = predicate.evaluateObject(obj);
            if (result)
                return obj;
        });
    }

    return resultObjects;
}

