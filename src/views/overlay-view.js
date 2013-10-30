define([
], function () {

    var OverlayView = function (opts) {
        opts = opts || {};
    };

    OverlayView.prototype.setMapContext = function (opts) {
        opts = opts || {};
        this._mapEl = opts.el;
        this._path = opts.path;
        this._svg = opts.svg;
    };
    
    OverlayView.prototype.render = function () {};

    return OverlayView;
});
 
