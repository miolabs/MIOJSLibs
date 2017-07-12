/**
 * Created by godshadow on 26/07/16.
 */

function MIOHTMLParser(string, layerID, relativePath, callback)
{
    var tag = "";
    var attribute = "";
    var value = "";

    var token = "";

    var styles = [];
    var currentStyle = null;

    var tagContent = "";
    var layout = "";
    var isCapturing = false;
    var captureTag = null;

    var openTagCount = 0;

    console.log("*********************");
    console.log(string);

    var stepIndex = 0; // 0 -> None, 1 -> Tag, 2 -> Attribute, 3 -> value, 4 -> html

    for (var index = 0; index < string.length; index++)
    {
        var ch = string.charAt(index);
        if (isCapturing == true)
            layout += ch;

        if (ch == "<")
        {
            if (isCapturing && string.charAt(index + 1) != "/")
                openTagCount++;

            tagContent = "<";
            tag = "";
            attribute = "";
            value = "";

            stepIndex = 1;
            index++;
            for (var count = index; count < string.length; count++, index++)
            {
                var ch2 = string.charAt(index);
                tagContent += ch2;
                if (isCapturing == true)
                    layout += ch2;

                if (ch2 == "/")
                {
                    if (token.length > 0)
                    {
                        // something behind
                        value = token;
                        if (currentStyle != null)
                        {
                            currentStyle[attribute] = value;
                        }
                    }

                    if (isCapturing)
                    {
                        openTagCount--;
                        if (openTagCount == 0) {
                            isCapturing = false;
                            layout += captureTag + ">";
                        }
                    }
                    tagContent = "";
                }
                else if (ch2 == ">") {

                    if (currentStyle != null)
                    {
                        styles.push(currentStyle);
                        FoundLink(currentStyle, callback);
                    }

                    currentStyle = null;
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
                            //console.log("<" + tag + ">");
                            stepIndex = 2;
                            if (tag == "link")
                            {
                                // add style
                                currentStyle = {};
                            }
                            break;

                        case 3:
                            value = token;
                            //console.log("<" + tag + " " + attribute + "=" + value + ">");
                            stepIndex = 2;
                            if (currentStyle != null)
                            {
                                currentStyle[attribute] = value;
                            }

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
                        tagContent += ch3;
                        if (isCapturing == true)
                            layout += ch3;

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
                        //console.log("<" + tag + ">");
                        stepIndex = 2;
                        if (tag == "link")
                        {
                            // add style
                            currentStyle = {};
                        }
                        break;

                    case 2:
                        attribute = token;
                        //console.log("<" + tag + " " + attribute + ">");
                        break;

                    case 3:
                        value = token;
                        //console.log("<" + tag + " " + attribute + "=" + value + ">");
                        stepIndex = 2;
                        if (attribute == "id" && value == layerID)
                        {
                            // Record
                            isCapturing = true;
                            openTagCount = 1;
                            captureTag = tag;
                            layout += tagContent;
                        }

                        if (currentStyle != null)
                        {
                            currentStyle[attribute] = value;
                        }
                        break;
                }
                token = "";
            }

            stepIndex = 4;
        }
    }

    console.log("---------------------");
    console.log(layout);

    // filter link tags
    var styleFiles = [];
    for (var index = 0; index < styles.length; index++)
    {
        var s = styles[index];
        if (s["rel"] == "stylesheet")
        {
            // Add style
            var css ={"url": s["href"]};
            var media = s["media"];
            if (media != null) css["media"] = media;
            styleFiles.push(css);
            console.log("CSS: " + css);
        }
    }

    console.log("*********************");

    return {
        styles: styleFiles,
        layout: layout
    };
}

function FoundLink(link, callback)
{
    if (link["rel"] == "stylesheet")
    {
        // Add style
        var css ={"url": link["href"]};
        var media = link["media"];
        if (media != null) css["media"] = media;        
        callback(css);
        console.log("Send CSS: " + css);
    }
}