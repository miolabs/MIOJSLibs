/**
 * Created by godshadow on 1/5/16.
 */

    /// <reference path="MIOObject.ts" />

enum MIOPredicateOperator
{
    Equal,
    Less,
    Greater,
    Not,
    Contains
}

enum MIOPredicateType
{
    Predicate,
    AND,
    OR
}

class MIOPredicateItem
{
    type = null;
    key = null;
    operator = null;
    value = null;

    constructor(type)
    {
        this.type = type;
    }

    setOperator(operator)
    {
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
    }

    evaluateObject(object)
    {
        if (this.operator == MIOPredicateOperator.Equal)
            return (object[this.key] == this.value);
        else if (this.operator == MIOPredicateOperator.Not)
            return (object[this.key] != this.value);
        if (this.operator == MIOPredicateOperator.Contains)
        {
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

class MIOPredicate extends MIOObject
{
    predicates = [];

    public static predicateWithFormat(format)
    {
        var p = new MIOPredicate();
        p.initWithFormat(format);

        return p;
    }

    initWithFormat(format)
    {
        this._parse(format);
    }

    private _parse(format)
    {
        var key = "";
        var value = "";
        var op = "";
        var stepIndex = 0 // 0 -> Token, 1 -> operator, 2 -> value


        for (var index = 0; index < format.length; index++)
        {
            var ch = format.charAt(index);

            if (ch == " ")
            {
                stepIndex++;

                if (stepIndex == 1 && key.length > 0)
                {
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
                else if (stepIndex == 3)
                {
                    var p = new MIOPredicateItem(MIOPredicateType.Predicate);
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
            else
            {
                switch (stepIndex)
                {
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
            }
        }

        // Last check
        if (key.length > 0 && value.length > 0)
        {
            var p = new MIOPredicateItem(MIOPredicateType.Predicate);
            p.key = key;
            p.setOperator(op);
            p.value = value;
            this.predicates.push(p);
        }
    }

    evaluateObject(object)
    {
        var result = true;
        var op = null;

        for (var count = 0; count < this.predicates.length; count++)
        {
            var p = this.predicates[count];
            if (p.type == MIOPredicateType.AND)
                op = MIOPredicateType.AND;
            else if (p.type == MIOPredicateType.OR)
                op = MIOPredicateType.OR;
            else if (p.type == MIOPredicateType.Predicate)
            {
                var result2 = p.evaluateObject(object);

                if (op == null)
                    result = result2;
                else if (op == MIOPredicateType.AND)
                {
                    result = result && result2;
                    op = null;
                    if (result == false)
                        break;
                }
                else if (op == MIOPredicateType.OR)
                {
                    result = result || result2;
                    op = null;
                }
            }
        }

        return result;
    }
}