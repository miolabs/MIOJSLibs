
import { MUIView } from "./MUIView";
import { MUICoreLayerAddStyle } from "./MIOUI_CoreLayer";

import * as ace from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/monokai';

export enum MUICodeEditorLanguage {
    None,
    SQL,
    Javascript,
    PHP,
    Swift
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
    }    

    set text(value){
        this.editor.setValue(value);
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
        }
    }

}