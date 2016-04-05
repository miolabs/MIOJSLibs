/**
 * Created by godshadow on 11/3/16.
 */

/// <reference path="MIOView.ts" />

function MIOViewControllerFromElementID(view, elementID)
{
    var v = MIOViewFromElementID(view, elementID);
    if (v == null)
        return null;

    var vc = new MIOViewController();
    vc.initWithView(v);
    view._linkViewToSubview(v);

    return vc;
}

class MIOViewController extends MIOObject
{
    view = null;

    constructor()
    {
        super();
    }

    init()
    {
        this.view = new MIOView();
        this.view.init();
        this.loadView();
    }

    initWithTagID(tagID)
    {
        this.view = new MIOView();
        this.view.initWithTagID(tagID);
        this.loadView();
    }

    initWithView(view)
    {
        this.view = view;
        this.loadView();
    }

    initWithResource(htmlFile, cssFile, itemID)
    {
        this.view = MIOViewFromResource(htmlFile, cssFile, itemID);
        this.loadView();
    }

    localizeLayerIDWithKey(layerID, key)
    {
        var layer = MIOLayerSearchElementByID(this.view.layer, layerID);
        layer.innerHTML = MIOLocalizeString(key, key);
    }

    loadView()
    {
        this.viewDidLoad();
//		this.view.layout();
    }

    viewDidLoad(){}
    viewWillAppear()
    {
        this.view.layout();
    }
    viewDidAppear(){}

    viewWillDisappear(){}
    viewDidDisappear(){}

    contentHeight()
    {
        return this.view.getHeight();
    }
}

