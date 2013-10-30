define([
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-map/marker',
    'json!streamhub-map-resources/world-50m.json',
    'd3',
    'topojson',
    'inherits'
], function (ContentListView, Marker, WorldJson, d3, topojson, inherits) {

    // A list of supported projections:
    // (https://github.com/mbostock/d3/wiki/Geo-Projections#standard-projections)
    var MapView = function (opts) {
        var opts = opts || {};
        this._projection = opts.projection ? d3.geo[opts.projection]() : d3.geo.mercator();
        this._boundingBox = opts.boundingBox;
        this._graticule = opts.graticule || false;
        this._pathColor = opts.pathColor || '#000';
        this._foregroundColor = opts.foregroundColor || '#FFF';
        this._graticuleColor = opts.graticuleColor || '#DDD';

        this._markers = [];
        this._overlays = [];
        this._animatedOverlays = [];

        ContentListView.call(this, opts);

        this._draw();

        var self = this;
        $(window).on('resize', function (e) {
            self._draw();
        });
    };
    inherits(MapView, ContentListView);

    MapView.prototype._draw = function () {
        this._drawMap();
        this._drawOverlays();
    };

    MapView.prototype._drawOverlays = function () {
        for (var i=0; i < this._overlays.length; i++) {
            this._overlays[i].setDrawingContext({ path: this._mapPath, svg: this._mapEl });
            this._overlays[i].render();
        }
        for (var i=0; i < this._animatedOverlays.length; i++) {
            //if (! this._animatedOverlays[i].isAnimating()) {
            this._animatedOverlays[i].setDrawingContext({ path: this._mapPath, svg: this._mapEl });
            this._animatedOverlays[i].render();
            //}
        }

        this._drawMarkers();
    };

    MapView.prototype._drawMarkers = function () {
        // Draw markers
        for (var i=0; i < this._markers.length; i++) {
            // TODO: Marker view?

            this._mapEl.append("path")
                .datum({ type: 'Point', 'coordinates': this._markers[i].getCoordinates() })
                .attr("d", this._mapPath)
                .attr("class", "place");
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
        var svg = d3.select('.'+this.elClass.trim()).append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr('class', 'hub-map');
        this._mapEl = svg;

        path = d3.geo.path().projection(this._projection);

        // Draw the path of the map in SVG.
        svg.selectAll('.hub-map-country')
           .data(countries)
           .enter()
           .insert("path", ".hub-map-country-foreground")
           .attr("class", "hub-map-country")
           .attr("d", path); 

        // Draw graticule
        if (this._graticule) {
            var graticule = d3.geo.graticule();

            // Draw the path for the graticule
            svg.append("path")
                .attr("class", "hub-map-graticule")
                .datum(graticule)
                .attr("d", path);

            // Draw the path for the bounding outline of the graticule
            svg.append("path")
                .datum(graticule.outline)
                .attr("class", "hub-map-foreground")
                .attr("d", path);
        }
    };

    MapView.prototype.addMarker = function (lat, lon, opts) {
        if (!this._mapEl) {
            return;
        }

        var marker = new Marker({ lat: lat, lon: lon });
        this._markers.push(marker);

        this._drawMarkers();
    };

    MapView.prototype.addOverlay = function (overlayView) {
        overlayView.setDrawingContext({ path: this._mapPath, svg: this._mapEl });
        this._overlays.push(overlayView);
    };

    MapView.prototype.addAnimatedOverlay = function (animatedOverlayView) {
        animatedOverlayView.setDrawingContext({ path: this._mapPath, svg: this._mapEl });
        this._animatedOverlays.push(animatedOverlayView);
        this._drawOverlays();
    };

    return MapView;
});
