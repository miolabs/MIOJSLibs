import { MUIWindow } from "./MUIWindow";
import { MUICoreLayerAddSublayer } from "./MIOUI_CoreLayer";

export enum MIOFileHandlingPanel
{
    OKButton
}

export class MUIOpenPanel extends MUIWindow
{
    files = [];

    static openPanel():MUIOpenPanel {
        let op = new MUIOpenPanel();
        op.init();

        return op;
    }

    private panelTarget = null;
    private panelCompletion = null;
    private _inputLayer = null;
    beginSheetModalForWindow(window:MUIWindow, target, completion){
        this.panelTarget = target;
        this.panelCompletion = completion;

        //Web hack to open dialog
        let instance = this;

        this._inputLayer = document.createElement("INPUT");
        this._inputLayer.setAttribute("type", "file");
        this._inputLayer.style.display = "none";        
        this._inputLayer.addEventListener('change', function(ev){
            let files = ev.target.files; // FileList object
            instance.filesDidSelect(files);
        }, false);
        
        MUICoreLayerAddSublayer(window.layer, this._inputLayer);

        this._inputLayer.click();
    }
    
    private filesDidSelect(files){
        this.files = files;

        if (this.panelTarget != null && this.panelCompletion != null) {
            this.panelCompletion.call(this.panelTarget, MIOFileHandlingPanel.OKButton);
        }
    }

}