define([
    'streamhub-sdk/jquery'
], function ($) {

    var OverlayView = function (opts) {
        opts = opts || {};
        this._rendered = false;
    };

    OverlayView.prototype.setMapContext = function (opts) {
        opts = opts || {};
        this._path = opts.path;
        this._svg = opts.svg;
    };

    OverlayView.prototype.render = function () {
        this._rendered = true;
    };

    OverlayView.prototype.destroy = function () {
        if (this.el) {
            $(this.el[0][0]).remove();
        }
        this._rendered = false;
    };

    return OverlayView;
});
 
