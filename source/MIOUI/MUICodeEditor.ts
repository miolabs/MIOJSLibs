
import { MUIView } from "./MUIView";

import * as ace from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/monokai';

export class MUICoreEditor extends MUIView 
{
    private editorView:MUIView = null;
    private editor = null;

    initWithLayer(layer, owner, options?) {
        super.initWithLayer(layer, owner, options);
    
        this.editor = new MUIView();
        this.editor.init();

        let id = this.editor.layer.getAttribute("id");
        this.editor = ace.edit(id);
        this.editor.setTheme("ace/theme/monokai");        
        this.editor.session.setMode("ace/mode/javascript");
    }
}