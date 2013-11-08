define([
    'streamhub-map/point',
    'streamhub-map/views/overlay-view',
    'streamhub-map/views/info-window-overlay-view',
    'inherits',
    'streamhub-sdk/jquery'
],
function (Point, OverlayView, InfoWindowView, inherits, $) {

    var MarkerView = function (point, opts) {
        if (point === undefined || ! (point instanceof Point)) {
            throw new Error('A MarkerView expects a Point instance as an argument');
        }

        opts = opts || {};

        this._point = point;
        this._defaultRadius = 10;
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
        }

        OverlayView.call(this, opts);
    };
    inherits(MarkerView, OverlayView);

    MarkerView.prototype.render = function (radius) {
        radius = radius || this._defaultRadius;

        // Notifier
        this.notifierEl = this._svg.append("path")
            .datum({ type: 'Point', 'coordinates': this._point.getCoordinates() })
            .attr("d", this._path.pointRadius(radius))
            .attr("class", "hub-place-notifier");
        // Marker
        this.el = this._svg.append("path")
            .datum({ type: 'Point', 'coordinates': this._point.getCoordinates() })
            .attr("d", this._path.pointRadius(radius))
            .attr("class", "hub-place");

        var self = this;
        this.el.on('click', function (datum, index) {
            self.notify();
            $(self.el[0][0]).trigger('focusDataPoint.hub', self._point);
        });

        OverlayView.prototype.render.call(this);
    };

    MarkerView.prototype.destroy = function () {
        $(this.notifierEl[0][0]).remove();
        $(this.el[0][0]).remove();

        OverlayView.prototype.destroy.call(this);
    };

    MarkerView.prototype.notify = function () {
        var self = this;
        var radius = this.getRadius();
        this.notifierEl.transition()
            .each('end', function (datum, index) {
                self.notifierEl
                    .attr('d', self._path.pointRadius(radius))
                    .style('opacity', 1);
            })
            .duration(1000)
            .attr('d', this._path.pointRadius(4*radius))
            .style('fill', 'steelblue')
            .style('opacity', 0);
    };

    MarkerView.prototype.openInfoWindow = function () {
        this._infoWindowView.render();
        this._infoWindowView.position(this.el[0][0]);
    };

    return MarkerView;
});
