define([
], function () {

    var AnimatedOverlayView = function (opts) {
        this._animating = false;

        var self = this;
        $(window).on('resize', function (e) {
            if (self._intervalId) {
                clearInterval(self._intervalId);
            }
            this._animating = false;
        });
    };

    AnimatedOverlayView.prototype.isAnimating = function () {
        return this._animating;
    };

    AnimatedOverlayView.prototype.setDrawingContext = function (opts) {
        opts = opts || {};
        this._path = opts.path;
        this._svg = opts.svg;
    };

    AnimatedOverlayView.prototype.tick = function () {};
    
    AnimatedOverlayView.prototype.render = function () {};

    return AnimatedOverlayView;
});
 
