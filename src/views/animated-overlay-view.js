define([
    'streamhub-map/views/overlay-view',
    'inherits'
], function (OverlayView, inherits) {

    var AnimatedOverlayView = function (opts) {
        OverlayView.call(this, opts);

        this._animating = false;

        var self = this;
        $(window).on('resize', function (e) {
            if (self._intervalId) {
                clearInterval(self._intervalId);
            }
        });
    };
    inherits(AnimatedOverlayView, OverlayView);

    AnimatedOverlayView.prototype.isAnimating = function () {
        return this._animating;
    };

    AnimatedOverlayView.prototype.tick = function () {};

    return AnimatedOverlayView;
});
 
