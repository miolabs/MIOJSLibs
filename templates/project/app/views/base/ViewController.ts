/**
 * Created by godshadow on 13/12/2016.
 */

class ViewController extends MUIViewController
{
    private _label = null;

    viewDidLoad()
    {
        super.viewDidLoad();

        this._label = MUIOutlet(this, "view_label", "MUILabel");
        this._label.text = "Change";        
    }
}