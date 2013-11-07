define([
    'streamhub-map/point',
    'streamhub-map/views/marker-view',
    'inherits',
    'd3',
    'colorbrewer'
],
function (Point, MarkerView, inherits, d3, colorbrewer) {

    var SymbolView = function (point, opts) {
        opts = opts || {};
        this._maxMetricValue = opts.maxMetricValue;

        MarkerView.apply(this, arguments);
    };
    inherits(SymbolView, MarkerView);

    SymbolView.prototype.getRadius = function () {
        var getSize = d3.scale.linear()
            .domain(this.getDomain())
            .range([7.5, 25]);
        return getSize(this.getValue());
    };

    SymbolView.prototype.getValue = function () {
        return this._point.getCollection().heatIndex;
    };

    SymbolView.prototype.render = function () {
        MarkerView.prototype.render.call(this, this.getRadius());

        var getColor = d3.scale.quantize()
            .domain(this.getDomain())
            .range(colorbrewer.YlOrRd[9]);
        this.el.attr('fill', getColor(this.getValue()));
    };

    SymbolView.prototype.getDomain = function () {
        return [0, this._maxMetricValue()];
    };

    return SymbolView;
});
