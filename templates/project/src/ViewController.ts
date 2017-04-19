/**
 * Created by godshadow on 13/12/2016.
 */

/// <reference path="miolibs/MIOLib.ts" />

class ViewController extends MIOViewController
{
    private _label = null;

    viewDidLoad()
    {
        super.viewDidLoad();

        this._label = MUIOutlet(this, "view_label", "MUILabel");
        this._label.text = "Cambio";        
    }
}