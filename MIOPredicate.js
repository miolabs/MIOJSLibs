/**
 * Created by godshadow on 1/5/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOObject.ts" />
var MIOPredicateOperator;
(function (MIOPredicateOperator) {
    MIOPredicateOperator[MIOPredicateOperator["Equal"] = 0] = "Equal";
    MIOPredicateOperator[MIOPredicateOperator["Less"] = 1] = "Less";
    MIOPredicateOperator[MIOPredicateOperator["Greater"] = 2] = "Greater";
    MIOPredicateOperator[MIOPredicateOperator["Not"] = 3] = "Not";
    MIOPredicateOperator[MIOPredicateOperator["Contains"] = 4] = "Contains";
})(MIOPredicateOperator || (MIOPredicateOperator = {}));
var MIOPredicateType;
(function (MIOPredicateType) {
    MIOPredicateType[MIOPredicateType["Predicate"] = 0] = "Predicate";
    MIOPredicateType[MIOPredicateType["Operation"] = 1] = "Operation";
    MIOPredicateType[MIOPredicateType["AND"] = 2] = "AND";
    MIOPredicateType[MIOPredicateType["OR"] = 3] = "OR";
})(MIOPredicateType || (MIOPredicateType = {}));
var MIOPredicateItem = (function () {
    function MIOPredicateItem(type) {
        this.type = null;
        this.key = null;
        this.operator = null;
        this.value = null;
        this.predicate = null;
        this.type = type;
    }
    MIOPredicateItem.prototype.setOperator = function (operator) {
        if (operator == "==")
            this.operator = MIOPredicateOperator.Equal;
        else if (operator == ">")
            this.operator = MIOPredicateOperator.Greater;
        else if (operator == "<")
            this.operator = MIOPredicateOperator.Less;
        else if (operator == "!=")
            this.operator = MIOPredicateOperator.Not;
        else if (operator.toLowerCase() == "contains")
            this.operator = MIOPredicateOperator.Contains;
        else
            throw ("MIOPredicate: Invalid operator!");
    };
    MIOPredicateItem.prototype.evaluateObject = function (object) {
        if (this.operator == MIOPredicateOperator.Equal)
            return (object[this.key] == this.value);
        else if (this.operator == MIOPredicateOperator.Not)
            return (object[this.key] != this.value);
        else if (this.operator == MIOPredicateOperator.Less)
            return (object[this.key] < this.value);
        else if (this.operator == MIOPredicateOperator.Greater)
            return (this.operator > this.value);
        if (this.operator == MIOPredicateOperator.Contains) {
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
        var key = "";
        var value = "";
        var op = "";
        var stepIndex = 0; // 0 -> Token, 1 -> operator, 2 -> value
        var lastCharIsSpace = false;
        for (var index = 0; index < format.length; index++) {
            var ch = format.charAt(index);
            if (ch == " ") {
                if (lastCharIsSpace == true)
                    continue;
                stepIndex++;
                lastCharIsSpace = true;
                if (stepIndex == 1 && key.length > 0) {
                    if (key.toLowerCase() == "and") {
                        this.predicates.push(new MIOPredicateItem(MIOPredicateType.AND));
                        key = "";
                        value = "";
                        op = "";
                        stepIndex = 0;
                    }
                    else if (key.toLowerCase() == "or") {
                        this.predicates.push(new MIOPredicateItem(MIOPredicateType.OR));
                        key = "";
                        value = "";
                        op = "";
                        stepIndex = 0;
                    }
                }
                else if (stepIndex == 3) {
                    var p = new MIOPredicateItem(MIOPredicateType.Operation);
                    p.key = key;
                    p.setOperator(op);
                    p.value = value;
                    this.predicates.push(p);
                    key = "";
                    value = "";
                    op = "";
                }
                if (stepIndex > 2)
                    stepIndex = 0;
            }
            else if (ch == "(") {
                // Create new predicate
                var string = "";
                index++;
                for (var count = index; count < format.length; count++, index++) {
                    var ch2 = format.charAt(index);
                    if (ch2 == ")") {
                        var p = new MIOPredicateItem(MIOPredicateType.Predicate);
                        p.predicate = MIOPredicate.predicateWithFormat(string);
                        this.predicates.push(p);
                        break;
                    }
                    else {
                        string += ch2;
                    }
                }
            }
            else {
                switch (stepIndex) {
                    case 0:
                        key += ch;
                        break;
                    case 1:
                        op += ch;
                        break;
                    case 2:
                        value += ch;
                        break;
                }
                lastCharIsSpace = false;
            }
        }
        // Last check
        if (key.length > 0 && value.length > 0) {
            var p = new MIOPredicateItem(MIOPredicateType.Operation);
            p.key = key;
            p.setOperator(op);
            p.value = value;
            this.predicates.push(p);
        }
    };
    MIOPredicate.prototype.evaluateObject = function (object) {
        var result = true;
        var op = null;
        for (var count = 0; count < this.predicates.length; count++) {
            var p = this.predicates[count];
            if (p.type == MIOPredicateType.AND)
                op = MIOPredicateType.AND;
            else if (p.type == MIOPredicateType.OR)
                op = MIOPredicateType.OR;
            else {
                var result2 = false;
                if (p.type == MIOPredicateType.Operation)
                    result2 = p.evaluateObject(object);
                else if (p.type == MIOPredicateType.Predicate)
                    result2 = p.predicate.evaluateObject(object);
                if (op == null)
                    result = result2;
                else if (op == MIOPredicateType.AND) {
                    result = result && result2;
                    op = null;
                    if (result == false)
                        break;
                }
                else if (op == MIOPredicateType.OR) {
                    result = result || result2;
                    op = null;
                }
            }
        }
        return result;
    };
    return MIOPredicate;
}(MIOObject));
//# sourceMappingURL=MIOPredicate.js.map