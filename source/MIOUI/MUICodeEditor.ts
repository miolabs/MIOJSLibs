
import { MUIView } from "./MUIView";
import { MUICoreLayerAddStyle } from "./MIOUI_CoreLayer";

import * as ace from 'brace';
import 'brace/mode/javascript';
import 'brace/mode/sql';
import 'brace/mode/php';
import 'brace/mode/python';
import 'brace/mode/swift';
import 'brace/mode/typescript';
import 'brace/mode/json';
import 'brace/theme/monokai';
import 'brace/theme/xcode';
import 'brace/ext/beautify';


export enum MUICodeEditorLanguage {
    None,
    SQL,
    Javascript,    
    PHP,
    Swift,
    Python,
    TypeScript,
    JSON
}

export class MUICodeEditor extends MUIView 
{
    private editorView:MUIView = null;
    private editor = null;

    initWithLayer(layer, owner, options?) {
        super.initWithLayer(layer, owner, options);
    
        this.editorView = new MUIView();
        this.editorView.init();
        MUICoreLayerAddStyle(this.editorView.layer, "view");
        this.editorView.layer.style.position = "absolute";
        this.addSubview(this.editorView);

        this.editor = ace.edit(this.editorView.layer);
        this.editor.setTheme("ace/theme/xcode");
        this.editor.$blockScrolling = Infinity;

        let editorInstance = this;
        this.editor.on("change", function(e) {
            if (editorInstance.editor.curOp && editorInstance.editor.curOp.command.name) console.log("user change");
            else {
                editorInstance.didChangeText.call(editorInstance); 
                console.log("other change");
            }
        });
    }    

    layoutSubviews(){
        this.editor.resize();
    }

    private onTextChangeTarget = null;
    private onTextChangeCompletion = null;
    onTextChange(target, completion) {
        this.onTextChangeTarget = target;
        this.onTextChangeCompletion = completion;
    }

    // New callback
    private didChangeText(){
        if (this.onTextChangeCompletion != null && this.onTextChangeTarget != null) {
            this.onTextChangeCompletion.call(this.onTextChangeTarget, this, this.text);
        }
    }

    set text(value){
        this.editor.setValue(value);
        this.editor.clearSelection();
    }

    get text(){
        return this.editor.getValue();
    }

    set language(value:MUICodeEditorLanguage){

        switch (value){
            case MUICodeEditorLanguage.SQL:
                this.editor.session.setMode("ace/mode/sql");
                break;

            case MUICodeEditorLanguage.Javascript:
                this.editor.session.setMode("ace/mode/javascript");
                break;

            case MUICodeEditorLanguage.PHP:
                this.editor.session.setMode("ace/mode/php");
                break;

            case MUICodeEditorLanguage.Python:
                this.editor.session.setMode("ace/mode/python");
                break;

            case MUICodeEditorLanguage.Swift:
                this.editor.session.setMode("ace/mode/swift");
                break;

            case MUICodeEditorLanguage.TypeScript:
                this.editor.session.setMode("ace/mode/typescript");
                break;

            case MUICodeEditorLanguage.JSON:
                this.editor.session.setMode("ace/mode/json");
                break;    

            default:
                this.editor.session.setMode("ace/mode/plain_text");
                break;
        }
    }

    beautify() {    
        let b = ace.acequire("ace/ext/beautify");
        b.beautify (this.editor.session);
    }

}