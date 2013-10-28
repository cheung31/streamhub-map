define([
    'streamhub-sdk/content/views/content-list-view',
    'json!streamhub-map-resources/world-50m.json',
    'd3',
    'topojson',
    'inherits'
], function (ContentListView, WorldJson, d3, topojson, inherits) {

    // A list of supported projections:
    // (https://github.com/mbostock/d3/wiki/Geo-Projections#standard-projections)
    var MapView = function (opts) {
        var opts = opts || {};
        this._projection = opts.projection || d3.geo.mercator();
        this._boundingBox = opts.boundingBox;
        this._graticule = opts.graticule || false;
        this._pathColor = opts.pathColor || '#000';
        this._foregroundColor = opts.foregroundColor || '#FFF';
        this._graticuleColor = opts.graticuleColor || '#DDD';

        ContentListView.call(this, opts);

        this._drawMap();

        var self = this;
        $(window).on('resize', function (e) {
            self._drawMap();
        });
    };
    inherits(MapView, ContentListView);

    // Scale the map (http://stackoverflow.com/a/14691788)
    MapView.prototype._drawMap = function () {
        var width = this.$el.width(),
            height = this.$el.height();
        console.log(width, height);

        // Create a unit projection and its path
        this._projection = this._projection.scale(1).translate([0,0]);
        var path = d3.geo.path().projection(this._projection);

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
        var countries = topojson.feature(WorldJson, WorldJson.objects.countries).features;
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

    return MapView;
});
