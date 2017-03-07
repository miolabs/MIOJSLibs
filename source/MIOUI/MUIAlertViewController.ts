
/// <reference path="MUIViewController.ts" />

enum MUIAlertViewStyle
{
    Default
}

class MUIAlertAction extends MIOObject
{

}

class MUIAlertViewController extends MUIViewController
{
    private _actions = [];

    private _title:string = null;
    private _message:string = null;
    private _style = MUIAlertViewStyle.Default;

    private _tableView = null;

    private _headerCell = null;

    initWithTitle(title:string, message:string, style:MUIAlertViewStyle)
    {
        this._title = title;
        this._message = message;
        this._style = style;
    }

    viewDidLoad()
    {
        super.viewDidLoad();

        this._tableView = new MUITableView();
        this._tableView.init();

        this.view.addSubview(this._tableView);
    }

    addAction(action:MUIAlertAction)
    {
        this._actions.push(action);
    }

    numberOfSections(tableview)
    {
        return 1;
    }

    numberOfRowsInSection(tableview, section)
    {
        return this._actions.length + 1;
    }

    cellAtIndexPath(tableview, row, section)
    {
        var cell = null;
        if (row == 0)
        {
            cell = this._createHeaderCell();
        }
        return cell;
    }


    private _createHeaderCell():MUITableViewCell
    {
        var cell = new MUITableViewCell();
        cell.init();

        var titleLabel = new MUILabel();
        titleLabel.init();
        titleLabel.text = this._title;
        titleLabel.layer.style.left = "10px";
        titleLabel.layer.style.top = "5px";
        titleLabel.layer.style.width = "100%";
        titleLabel.layer.style.height = "20px";
        cell.addSubview(titleLabel);


        return cell;
    }

}