define([
    'streamhub-map/views/overlay-view',
    'inherits'
],
function (OverlayView, inherits) {

    var MarkerView = function (point, opts) {
        opts = opts || {};
        if (typeof opts === 'string') {
            this._label = opts;
        }
        this._point = point;
        this._infoWindowContentView = opts.infoWindowContentView;

        if (opts.mapContext) {
            this._path = opts.mapContext.path;
            this._svg = opts.mapContext.svg;
        }
    };
    inherits(MarkerView, OverlayView);

    MarkerView.prototype.setMapContext = function (mapContext) {
        this._path = mapContext.path;
        this._svg = mapContext.svg;
    };

    MarkerView.prototype.render = function () {
        this.el = this._svg.append("path")
            .datum({ type: 'Point', 'coordinates': this._point.getCoordinates() })
            .attr("d", this._path)
            .attr("class", "place");

        var self = this;
        this.el.on('click', function (e) {
            alert(self._label);
        });
    };

    return MarkerView;
});
