#!/bin/bash

# Generates a dependency graph from the imports between the modules.

# search the files with: https://beyondgrep.com/
# generate the image with: graphviz
# Open the image with vscode (add to PATH first with the 'Shell Command: install code command in PATH' first)

# If you don't have graphwiz the code will fail and you can use the generated temp.dot to see the result in an online tool
#   For example: http://www.webgraphviz.com/
cd source;

GRAPHPATH=../tools/dep_graph/temp.dot
IMAGEPATH=../tools/dep_graph/result.png

ack 'import .* from "\.\./(\w+)' --output='$1' | \
    awk -F':|/' '{ print "  " $1 " -> "$(NF) ";" }' | \
    sort | \
    uniq | \
    awk 'BEGIN {print "digraph G {"} 1; END { print "}"}' > $GRAPHPATH \
&& dot -Tpng $GRAPHPATH -o $IMAGEPATH \
&& rm $GRAPHPATH \
&& code $IMAGEPATH