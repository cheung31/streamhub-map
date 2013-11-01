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
        this._projectionType = opts.projection || 'mercator';
        this._projection = new d3.geo[this._projectionType]();
        this._mapCenter = opts.mapCenter;
        this._boundingBox = opts.boundingBox;
        this._graticule = opts.graticule || false;
        this._pathColor = opts.pathColor || '#000';
        this._foregroundColor = opts.foregroundColor || '#FFF';
        this._graticuleColor = opts.graticuleColor || '#DDD';
        this._includeAntarctica = opts.includeAntarctica || false;

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
        if (! this._overlaysPath) {
            this._overlaysPath = this._getPathForProjection();
        }

        // Append the SVG element with which the map will be drawn on.
        if (this._mapOverlayEl) {
            this._mapOverlayEl.remove();
        }
        this._mapOverlayEl = this._mapSvg.append('svg:g')
            .attr('class', 'hub-map-overlays');
        for (var i=0; i < this._overlayViews.length; i++) {
            this._overlayViews[i].setMapContext({ el: this.el, path: this._overlaysPath, svg: this._mapOverlayEl });
            this._overlayViews[i].render();
        }
    };

    MapView.prototype._getPathForProjection = function () {
        var width = this.$el.width(),
            height = this.$el.height();
        this._projection
            .scale((width + 1) / 2 / Math.PI)
            .center([0, this._includeAntarctica ? 0 :27.55]) // Update center of map when Antarctica is removed
            .translate([width / 2, height / 2]); // Place the center, and the midpoint of the container

        return d3.geo.path().projection(this._projection)
    };

    // Scale the map (http://stackoverflow.com/a/14691788)
    MapView.prototype._drawMap = function () {
        var width = this.$el.width(),
            height = this.$el.height();

        // Country ids map to ISO 3166-1 code
        // (http://en.wikipedia.org/wiki/ISO_3166-1_numeric)
        var countries = topojson.feature(WorldJson, WorldJson.objects.countries).features;
        if (! this._includeAntarctica) {
            countries = countries.filter(function (feature) {
                if (feature.id === 10) {
                    delete feature;
                }
                return feature.id !== 10;
            });
        }
        
        this._mapPath = this._getPathForProjection();
        this._mapSvg = d3.select('.hub-map-svg');
        if (! this._mapSvg[0][0]) {
            this._mapSvg = d3.select(this.listElSelector).append('svg')
                .attr('class', 'hub-map-svg')
                .attr('width', width)
                .attr('height', height);
        }
        // Append the SVG element with which the map will be drawn on.
        if (this._mapEl) {
            this._mapEl.remove();
        }
        this._mapEl = this._mapSvg.append('svg:g')
                .call(d3.behavior.zoom().size([width, height]).scaleExtent([1, 2.5]).on('zoom', this._handleZoom.bind(this)))
                .attr('class', 'hub-map');

        // Draw the path of the map in SVG.
        this._mapEl.selectAll('.hub-map-country')
           .data(countries)
           .enter()
           .insert("path", ".hub-map-country-foreground")
           .attr("class", "hub-map-country")
           .attr("d", this._mapPath); 

        // Draw graticule
        if (this._graticule) {
            var graticule = d3.geo.graticule();

            // Draw the path for the graticule
            this._mapEl.append("path")
                .attr("class", "hub-map-graticule")
                .datum(graticule)
                .attr("d", this._mapPath);

            // Draw the path for the bounding outline of the graticule
            this._mapEl.append("path")
                .datum(graticule.outline)
                .attr("class", "hub-map-foreground")
                .attr("d", this._mapPath);
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
