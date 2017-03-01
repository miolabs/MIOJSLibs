
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

class MUIViewController extends MIOObject
{
    init() {

    }

    initWithResourceURL(url) {

    }

    private _onLoadViewTarget = null;
    private _onLoadViewAction = null;

    onLoadView(target, action) {

        this._onLoadViewTarget = target;
        this._onLoadViewAction = action;

        this._onLoadViewAction.call(this._onLoadViewTarget);
    }
}