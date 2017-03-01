'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const AUTHOR_TOKEN = '${AUTHOR}';
const DATE_TOKEN = '${DATE}';
const CLASSNAME_TOKEN = '${CLASSNAME}';
const FILENAME_TOKEN = '${FILENAME}';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "miolibs" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.newClassFile', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user        
        let input = vscode.window.showInputBox({
            prompt: 'Enter the name of the new class'
        });

        input.then(classname => {

            if (!classname){
                vscode.window.showErrorMessage('Please try again with a valid name');
                return;
            }

            var templates = ['MIOObject', 'MUIView', 'MUIViewController'];
            let select = vscode.window.showQuickPick(templates, {
                placeHolder: 'Select a template to choose from'
            });

            select.then(option => {

                if (!option) return;

                let templateFile = path.join(context.extensionPath, 'templates', option + '.ts',);
                fs.readFile(templateFile, 'utf8', (err, data) => {

                    let filename = classname + '.ts';
                    let config = vscode.workspace.getConfiguration('templates');
                    
                    var newData = data.replace(AUTHOR_TOKEN, config.Author);
                    newData = newData.replace(FILENAME_TOKEN, filename);
                    newData = data.replace(DATE_TOKEN, new Date().toDateString());
                    newData = newData.replace(CLASSNAME_TOKEN, classname);

                    let filePath = path.join(vscode.workspace.rootPath, filename);                    
                    fs.writeFile(filePath, newData, (err) => {

                        if (err) {
                            vscode.window.showErrorMessage('Can not create the new file');
                            return;
                        }

                        let fp = vscode.Uri.parse('file://' + filePath);
                        vscode.commands.executeCommand('vscode.open', fp);
                    })

                });
            });
        });
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}