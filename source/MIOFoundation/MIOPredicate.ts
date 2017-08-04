/**
 * Created by godshadow on 1/5/16.
 */

/// <reference path="MIOObject.ts" />

enum MIOPredicateComparatorType {
    Equal,
    Less,
    LessOrEqual,
    Greater,
    GreaterOrEqual,
    Not,
    Contains
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

class MIOPredicateItem {
    key = null;
    comparator = null;
    value = null;

    setComparator(comparator) {
        if (comparator == "==")
            this.comparator = MIOPredicateComparatorType.Equal;
        else if (comparator == ">")
            this.comparator = MIOPredicateComparatorType.Greater;
        else if (comparator == ">=")
            this.comparator = MIOPredicateComparatorType.GreaterOrEqual;        
        else if (comparator == "<")
            this.comparator = MIOPredicateComparatorType.Less;
        else if (comparator == "<=")
            this.comparator = MIOPredicateComparatorType.LessOrEqual;        
        else if (comparator == "!=")
            this.comparator = MIOPredicateComparatorType.Not;
        else if (comparator.toLowerCase() == "contains")
            this.comparator = MIOPredicateComparatorType.Contains;
        else
            throw ("MIOPredicate: Invalid comparator!");
    }

    evaluateObject(object) {
        if (this.comparator == MIOPredicateComparatorType.Equal)
            return (object[this.key] == this.value);
        else if (this.comparator == MIOPredicateComparatorType.Not)
            return (object[this.key] != this.value);
        else if (this.comparator == MIOPredicateComparatorType.Less)
            return (object[this.key] < this.value);
        else if (this.comparator == MIOPredicateComparatorType.LessOrEqual)
            return (object[this.key] <= this.value);        
        else if (this.comparator == MIOPredicateComparatorType.Greater)
            return (object[this.key] > this.value);
        else if (this.comparator == MIOPredicateComparatorType.GreaterOrEqual)
            return (object[this.key] >= this.value);        
        if (this.comparator == MIOPredicateComparatorType.Contains) {
            var value = object[this.key];
            if (value == null)
                return false;

            value = value.toLowerCase();
            if (value.indexOf(this.value.toLowerCase()) > -1)
                return true;

            return false;
        }
    }
}

class MIOPredicate extends MIOObject {
    predicates = [];

    public static predicateWithFormat(format) {
        var p = new MIOPredicate();
        p.initWithFormat(format);

        return p;
    }

    initWithFormat(format) {
        this._parse(format);
    }

    private _parse(format) {
        var token = "";

        var key = "";
        var cmp = "";
        var stepIndex = 0 // 0 -> Token, 1 -> operator, 2 -> value

        var lastCharIsSpace = false;

        for (var index = 0; index < format.length; index++) {
            var ch = format.charAt(index);

            if (ch == " ") {
                if (lastCharIsSpace == true)
                    continue;

                lastCharIsSpace = true;

                if (token.toLocaleLowerCase() == "and" || token == "&&") {
                    this.predicates.push(MIOPredicateOperator.andPredicateOperatorType());
                }
                else if (token.toLocaleLowerCase() == "or" || token == "||") {
                    this.predicates.push(MIOPredicateOperator.orPredicateOperatorType());
                }
                else if (token != "") {
                    stepIndex++;
                    if (stepIndex == 1)
                        key = token;
                    else if (stepIndex == 2)
                        cmp = token;
                    else if (stepIndex == 3) {
                        var i = new MIOPredicateItem();
                        i.key = key;
                        i.setComparator(cmp);
                        i.value = this._getValueFromToken(token);
                        this.predicates.push(i);

                        key = "";
                        cmp = "";
                        stepIndex = 0;
                    }
                }
                token = "";
            }
            else if (ch == "(") {
                // Create new predicate
                var string = "";
                index++;
                for (var count = index; count < format.length; count++ , index++) {
                    var ch2 = format.charAt(index);
                    if (ch2 == ")") {
                        var p = MIOPredicate.predicateWithFormat(string);
                        this.predicates.push(p);
                        break;
                    }
                    else {
                        string += ch2;
                    }
                }
            }
            else if (ch == "\"") {
                index++;
                for (var count = index; count < format.length; count++ , index++) {
                    var ch2 = format.charAt(index);
                    if (ch2 == "\"")
                        break;
                    else
                        token += ch2;
                }
                lastCharIsSpace = false;
            }
            else {
                token += ch;
                lastCharIsSpace = false;
            }
        }

        // Last check
        if (token.length > 0) {
            var i = new MIOPredicateItem();
            i.key = key;
            i.setComparator(cmp);
            i.value = this._getValueFromToken(token);
            this.predicates.push(i);
        }
    }

    private _getValueFromToken(token) {

        var normalizeToken = token.toLowerCase();
        if (token.toLocaleLowerCase() == "true")
            return true;
        else if (token.toLocaleLowerCase() == "false")
            return false;
        else if (token.toLocaleLowerCase() == "null")            
            return null;
        else
            return token;
    }

    evaluateObject(object) {
        var result = false;
        var op = null;
        var lastResult = null;

        for (var count = 0; count < this.predicates.length; count++) {
            var o = this.predicates[count];

            if (o instanceof MIOPredicate) {
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
