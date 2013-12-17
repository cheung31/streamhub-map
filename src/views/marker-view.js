define([
    'streamhub-map/point',
    'streamhub-map/views/overlay-view',
    'inherits',
    'streamhub-sdk/jquery'
],
function (Point, OverlayView, inherits, $) {

    var MarkerView = function (point, opts) {
        if (point === undefined || ! (point instanceof Point)) {
            throw new Error('A MarkerView expects a Point instance as an argument');
        }

        opts = opts || {};

        this._point = point;
        this._notifyStream = opts.notifyStream;
        var self = this;
        if (this._notifyStream) {
            this._notifyStream.on('data', function () {
                self.notify();
            });
        }

        if (typeof opts === 'string') {
            this._label = opts;
            return;
        }

        //TODO(ryanc): opts.clickCb

        if (opts.mapContext) {
            this._path = opts.mapContext.path;
            this._svg = opts.mapContext.svg;
            this._projection = opts.mapContext.projection;
        }

        OverlayView.call(this, opts);
    };
    inherits(MarkerView, OverlayView);

    MarkerView.prototype.render = function () {
        OverlayView.prototype.render.call(this);
    };

    MarkerView.prototype.destroy = function () {
        if (this.notifierEl) {
            $(this.notifierEl[0][0]).remove();
        }

        OverlayView.prototype.destroy.call(this);
    };

    MarkerView.prototype.notify = function () {
        return;
    };

    return MarkerView;
});
