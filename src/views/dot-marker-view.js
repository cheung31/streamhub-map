define([
    'streamhub-map/point',
    'streamhub-map/views/marker-view',
    'inherits',
    'streamhub-sdk/jquery'
],
function (Point, MarkerView, inherits, $) {

    var DotMarkerView = function (point, opts) {
        opts = opts || {};

        this._defaultRadius = 10;

        MarkerView.apply(this, arguments);
    };
    inherits(DotMarkerView, MarkerView);

    DotMarkerView.prototype.render = function (radius) {
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
            .attr("class", "hub-place")
            .attr('fill', 'rgba(15, 152, 236, 1)');

        this.notify();

        var self = this;
        this.el.on('click', function (datum, index) {
            self.notify();
            $(self.el[0][0]).trigger('focusDataPoint.hub', self._point);
        });

        MarkerView.prototype.render.call(this);
    };

    DotMarkerView.prototype.notify = function () {
        var self = this;
        var radius = this.getRadius();
        this.notifierEl.transition()
            .each('start', function (datum, index) {
                self.notifierEl
                    .attr('d', self._path.pointRadius(radius))
                    .style('fill', 'steelblue')
                    .style('opacity', 1)
            })
            .duration(200)
            .attr('d', this._path.pointRadius(2.7*radius))
            .style('opacity', .25)
            .style('fill', 'steelblue')
        .transition()
            .ease('cubic-out')
            .duration(1800)
            .attr('d', this._path.pointRadius(3*radius))
            .style('opacity', 0)
            .style('fill', 'steelblue');
    };

    DotMarkerView.prototype.getRadius = function () {
        return this._defaultRadius;
    };

    return DotMarkerView;
});
