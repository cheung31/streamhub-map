define([
    'streamhub-map/views/overlay-view',
    'streamhub-map/views/marker-view',
    'streamhub-sdk/views/list-view',
    'json!streamhub-map-resources/world-50m.json',
    'd3',
    'topojson',
    'inherits'
], function (
    OverlayView,
    MarkerView,
    ListView,
    WorldJson,
    d3,
    topojson,
    inherits) {

    // A list of supported projections:
    // (https://github.com/mbostock/d3/wiki/Geo-Projections#standard-projections)
    var MapView = function (opts) {
        var opts = opts || {};
        this._projection = opts.projection ? d3.geo[opts.projection]() : d3.geo.mercator();
        this._mapCenter = opts.mapCenter;
        this._boundingBox = opts.boundingBox;
        this._graticule = opts.graticule || false;
        this._pathColor = opts.pathColor || '#000';
        this._foregroundColor = opts.foregroundColor || '#FFF';
        this._graticuleColor = opts.graticuleColor || '#DDD';

        this._overlayViews = [];

        ListView.call(this, opts);

        this._draw();

        var self = this;
        $(window).on('resize', function (e) {
            for (var i=0; i < self._overlayViews.length; i++) {
                if (self._overlayViews[i]._animating) {
                    self._overlayViews[i]._animating = false;
                }
            }
            self._draw();
        });
    };
    inherits(MapView, ListView);

    MapView.prototype.className = 'hub-map-view';

    MapView.prototype._draw = function () {
        this._drawMap();
        this._drawOverlays();
    };

    MapView.prototype._drawOverlays = function () {
        for (var i=0; i < this._overlayViews.length; i++) {
            this._overlayViews[i].setMapContext({ el: this.el, path: this._mapPath, svg: this._mapEl });
            this._overlayViews[i].render();
        }
    };

    // Scale the map (http://stackoverflow.com/a/14691788)
    MapView.prototype._drawMap = function () {
        var width = this.$el.width(),
            height = this.$el.height();

        // Country ids map to ISO 3166-1 code
        // (http://en.wikipedia.org/wiki/ISO_3166-1_numeric)
        var countries = topojson.feature(WorldJson, WorldJson.objects.countries).features;

        // TODO: Check this._boundingBox?

        // Create a unit projection and its path
        this._projection = this._projection.scale(1).translate([0,0]);
        if (this._mapCenter) {
            this._projection.rotate([0, 0, 0]);
        }
        var path = d3.geo.path().projection(this._projection);
        this._mapPath = path;

        // Compute the bounds
        var bounds = path.bounds(topojson.mesh(WorldJson));
        var scale = 1 / Math.max( (bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height);
        var translate = [(width - scale * (bounds[1][0] + bounds[0][0])) / 2, (height - scale * (bounds[1][1] + bounds[0][1])) / 2];

        // Update projection with computed scale and translation
        this._projection.scale(scale).translate(translate);

        // Append the SVG element with which the map will be drawn on.
        if (this._mapEl) {
            this._mapEl.remove();
        }

        var svg = d3.select(this.listElSelector.trim()).append('svg');
        this._mapEl = svg.append('svg:g')
                .call(d3.behavior.zoom().scaleExtent([1, 2.5]).on('zoom', this._handleZoom.bind(this)))
                .attr("width", width)
                .attr("height", height)
                .attr('class', 'hub-map')
                .attr('transform', 'scale(1)');

        path = d3.geo.path().projection(this._projection);

        // Draw the path of the map in SVG.
        this._mapEl.selectAll('.hub-map-country')
           .data(countries)
           .enter()
           .insert("path", ".hub-map-country-foreground")
           .attr("class", "hub-map-country")
           .attr("d", path); 

        // Draw graticule
        if (this._graticule) {
            var graticule = d3.geo.graticule();

            // Draw the path for the graticule
            this._mapEl.append("path")
                .attr("class", "hub-map-graticule")
                .datum(graticule)
                .attr("d", path);

            // Draw the path for the bounding outline of the graticule
            this._mapEl.append("path")
                .datum(graticule.outline)
                .attr("class", "hub-map-foreground")
                .attr("d", path);
        }
    };

    MapView.prototype._handleZoom = function () {
        this._mapEl.attr("transform",
              "translate(" + d3.event.translate + ")"
              + " scale(" + d3.event.scale + ")");
    };

    MapView.prototype.addOverlay = function (overlayView) {
        this._overlayViews.push(overlayView);
        this._drawOverlays();
        return this;
    };

    return MapView;
});
