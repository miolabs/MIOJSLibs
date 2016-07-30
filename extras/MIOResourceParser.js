/**
 * Created by godshadow on 26/07/16.
 */

function MIOCoreResourceParser(string, layerID)
{
    var tag = "";
    var attribute = "";
    var value = "";
    var valueString = "";
    var html = "";

    var token = "";

    console.log(string);
    console.log("---------------------");

    var stepIndex = 0; // 0 -> None, 1 -> Tag, 2 -> Attribute, 3 -> value, 4 -> html

    for (var index = 0; index < string.length; index++)
    {
        var ch = string.charAt(index);

        if (ch == "<")
        {
            tag = "";
            attribute = "";
            value = "";
            html = "";

            stepIndex = 1;
            index++;
            for (var count = index; count < string.length; count++, index++)
            {
                var ch2 = string.charAt(index);

                if (ch2 == ">") {

                    break;
                }
                else if (ch2 == " ")
                {
                    if (token.length == 0)
                        continue;

                    switch (stepIndex)
                    {
                        case 1:
                            tag = token;
                            console.log("<" + tag + ">");
                            stepIndex = 2;
                            break;

                        case 3:
                            value = token;
                            console.log("<" + tag + " " + attribute + "=" + value + ">");
                            stepIndex = 2;
                            break;
                    }

                    token = "";
                }
                else if (ch2 == "=")
                {
                    stepIndex = 3;
                    attribute = token;
                    token = "";
                }
                else if (ch2 == "\"")
                {
                    count++;
                    index++;
                    for (var count2 = index; count2 < string.length; count2++, count++, index++){

                        var ch3 = string.charAt(index);
                        if (ch3 == "\"")
                            break;
                        else
                            token += ch3;
                    }
                }
                else
                {
                    token += ch2;
                }
            }

            // Last check
            if (token.length > 0) {
                switch (stepIndex) {
                    case 1:
                        tag = token;
                        console.log("<" + tag + ">");
                        stepIndex = 2;
                        break;

                    case 2:
                        attribute = token;
                        console.log("<" + tag + " " + attribute + ">");
                        break;

                    case 3:
                        value = token;
                        console.log("<" + tag + " " + attribute + "=" + value + ">");
                        stepIndex = 2;
                        break;
                }
                token = "";
            }

            stepIndex = 4;
        }
        else if (ch != " ")
        {
            html += ch;
        }
    }

    // Last check
}
