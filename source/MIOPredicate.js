/**
 * Created by godshadow on 1/5/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOObject.ts" />
var MIOPredicateComparatorType;
(function (MIOPredicateComparatorType) {
    MIOPredicateComparatorType[MIOPredicateComparatorType["Equal"] = 0] = "Equal";
    MIOPredicateComparatorType[MIOPredicateComparatorType["Less"] = 1] = "Less";
    MIOPredicateComparatorType[MIOPredicateComparatorType["Greater"] = 2] = "Greater";
    MIOPredicateComparatorType[MIOPredicateComparatorType["Not"] = 3] = "Not";
    MIOPredicateComparatorType[MIOPredicateComparatorType["Contains"] = 4] = "Contains";
})(MIOPredicateComparatorType || (MIOPredicateComparatorType = {}));
var MIOPredicateOperatorType;
(function (MIOPredicateOperatorType) {
    MIOPredicateOperatorType[MIOPredicateOperatorType["OR"] = 0] = "OR";
    MIOPredicateOperatorType[MIOPredicateOperatorType["AND"] = 1] = "AND";
})(MIOPredicateOperatorType || (MIOPredicateOperatorType = {}));
var MIOPredicateType;
(function (MIOPredicateType) {
    MIOPredicateType[MIOPredicateType["Predicate"] = 0] = "Predicate";
    MIOPredicateType[MIOPredicateType["Item"] = 1] = "Item";
    MIOPredicateType[MIOPredicateType["Operation"] = 2] = "Operation";
})(MIOPredicateType || (MIOPredicateType = {}));
var MIOPredicateOperator = (function () {
    function MIOPredicateOperator(type) {
        this.type = null;
        this.type = type;
    }
    MIOPredicateOperator.andPredicateOperatorType = function () {
        var op = new MIOPredicateOperator(MIOPredicateOperatorType.AND);
        return op;
    };
    MIOPredicateOperator.orPredicateOperatorType = function () {
        var op = new MIOPredicateOperator(MIOPredicateOperatorType.OR);
        return op;
    };
    return MIOPredicateOperator;
}());
var MIOPredicateItem = (function () {
    function MIOPredicateItem() {
        this.key = null;
        this.comparator = null;
        this.value = null;
    }
    MIOPredicateItem.prototype.setComparator = function (comparator) {
        if (comparator == "==")
            this.comparator = MIOPredicateComparatorType.Equal;
        else if (comparator == ">")
            this.comparator = MIOPredicateComparatorType.Greater;
        else if (comparator == "<")
            this.comparator = MIOPredicateComparatorType.Less;
        else if (comparator == "!=")
            this.comparator = MIOPredicateComparatorType.Not;
        else if (comparator.toLowerCase() == "contains")
            this.comparator = MIOPredicateComparatorType.Contains;
        else
            throw ("MIOPredicate: Invalid comparator!");
    };
    MIOPredicateItem.prototype.evaluateObject = function (object) {
        if (this.comparator == MIOPredicateComparatorType.Equal)
            return (object[this.key] == this.value);
        else if (this.comparator == MIOPredicateComparatorType.Not)
            return (object[this.key] != this.value);
        else if (this.comparator == MIOPredicateComparatorType.Less)
            return (object[this.key] < this.value);
        else if (this.comparator == MIOPredicateComparatorType.Greater)
            return (object[this.key] > this.value);
        if (this.comparator == MIOPredicateComparatorType.Contains) {
            var value = object[this.key];
            if (value == null)
                return false;
            value = value.toLowerCase();
            if (value.indexOf(this.value.toLowerCase()) > -1)
                return true;
            return false;
        }
    };
    return MIOPredicateItem;
}());
var MIOPredicate = (function (_super) {
    __extends(MIOPredicate, _super);
    function MIOPredicate() {
        _super.apply(this, arguments);
        this.predicates = [];
    }
    MIOPredicate.predicateWithFormat = function (format) {
        var p = new MIOPredicate();
        p.initWithFormat(format);
        return p;
    };
    MIOPredicate.prototype.initWithFormat = function (format) {
        this._parse(format);
    };
    MIOPredicate.prototype._parse = function (format) {
        var token = "";
        var key = "";
        var cmp = "";
        var stepIndex = 0; // 0 -> Token, 1 -> operator, 2 -> value
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
                        i.value = token;
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
                for (var count = index; count < format.length; count++, index++) {
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
                for (var count = index; count < format.length; count++, index++) {
                    var ch2 = format.charAt(index);
                    if (ch2 == "\"")
                        break;
                    else
                        token += ch2;
                }
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
            i.value = token;
            this.predicates.push(i);
        }
    };
    MIOPredicate.prototype.evaluateObject = function (object) {
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
    };
    return MIOPredicate;
}(MIOObject));
//# sourceMappingURL=MIOPredicate.js.map