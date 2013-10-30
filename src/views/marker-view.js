define([
    'streamhub-map/views/overlay-view',
    'streamhub-map/views/info-window-overlay-view',
    'inherits'
],
function (OverlayView, InfoWindowView, inherits) {

    var MarkerView = function (point, opts) {
        opts = opts || {};

        this._point = point;
        this._infoWindowView = new InfoWindowView(opts);

        if (typeof opts === 'string') {
            this._label = opts;
            return;
        }

        if (opts.mapContext) {
            this._mapEl = opts.mapContext.el;
            this._path = opts.mapContext.path;
            this._svg = opts.mapContext.svg;
        }
    };
    inherits(MarkerView, OverlayView);

    MarkerView.prototype.render = function () {
        this.el = this._svg.append("path")
            .datum({ type: 'Point', 'coordinates': this._point.getCoordinates() })
            .attr("d", this._path)
            .attr("class", "place");

        var self = this;
        this.el.on('click', function (datum, index) {
            self._infoWindowView.setMapContext({ el: self._mapEl });
            self._infoWindowView.render();
            self._infoWindowView.position(d3.event.target);
        });
    };

    return MarkerView;
});
