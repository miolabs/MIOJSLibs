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

        const timer = setTimeout(() => {
            this._label.text = MIOLocalizeString('CHANGED_AFTER_DELAY','Changed after delay...');        
            clearTimeout(timer);
        }, 1000);

    }
}