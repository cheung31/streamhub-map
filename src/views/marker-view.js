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
        // Notifier
        this.notifierEl = this._svg.append("path")
            .datum({ type: 'Point', 'coordinates': this._point.getCoordinates() })
            .attr("d", this._path.pointRadius(10))
            .attr("class", "hub-place-notifier");
        // Marker
        this.el = this._svg.append("path")
            .datum({ type: 'Point', 'coordinates': this._point.getCoordinates() })
            .attr("d", this._path.pointRadius(10))
            .attr("class", "hub-place");



        // If infoWindow was preivously rendered, check for its visible state
        if (this._infoWindowView && this._infoWindowView.isVisible()) {
            this.openInfoWindow(); 
        }

        var self = this;
        this.el.on('click', function (datum, index) {
            self.notify();
            //self.openInfoWindow();
        });
    };

    MarkerView.prototype.notify = function () {
        var self = this;
        this.notifierEl.transition()
            .each('end', function (datum, index) {
                self.notifierEl
                    .attr('d', self._path.pointRadius(10))
                    .style('opacity', 1);
            })
            .duration(1000)
            .attr('d', this._path.pointRadius(50))
            .style('fill', 'steelblue')
            .style('opacity', 0);
    };

    MarkerView.prototype.openInfoWindow = function () {
        this._infoWindowView.setMapContext({ el: this._mapEl });
        this._infoWindowView.render();
        this._infoWindowView.position(this.el[0][0]);
    };

    return MarkerView;
});
