define([
    'streamhub-sdk/modal',
    'streamhub-map/views/overlay-view',
    'streamhub-map/views/overlay-factory',
    'streamhub-map/views/symbol-view',
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-hot-collections/streams/collection-to-heat-metric',
    'json!streamhub-map/defaults.json',
    'text!streamhub-map/css/style.css',
    'd3',
    'd3-plugins-geo-tile',
    'topojson',
    'streamhub-sdk/jquery',
    'streamhub-map/leaflet',
    'inherits'
], function (
    ModalView,
    OverlayView,
    OverlayViewFactory,
    SymbolView,
    ContentListView,
    CollectionToHeatMetric,
    DefaultsJson,
    MapViewCss,
    d3,
    d3tile,
    topojson,
    $,
    L,
    inherits
) {
    'use strict';

    var STYLE_EL;
    var SVG_TEMPLATES_EL;

    /**
     * A view to visualize StreamHub content on a map
     * @constructor
     * @param [opts] {Object} Configuration options for the MapView
     * @param [opts.projection='mercator'] {String} A map projection supported by the D3 library (https://github.com/mbostock/d3/wiki/Geo-Projections#standard-projections)
     * @param [opts.mapCenter] {Array} The lat/lon coordinates of the center of the map
     * @param [opts.boundingBox] {Array} The NW and SE coordinates of the bounding box that defines the scope of the visible map. Bounding box in degrees [{ lat: x1, lon: y1 }, { lat: x2, lon: y2 }].
     * @param [opts.graticule=false] {Boolean} Whether to display the map graticule
     * @param [opts.includeAntarctica=false] {Boolean} Whether to include the continent of Antarctica on the map
     * @param [opts.colors] {Object} Specify colors for land, water, graticule, etc.
     */
    var MapView = function (opts) {
        opts = opts || {};
        opts.modal = opts.modal || new ModalView();

        this._id = new Date().getTime();
        this._projectionType = opts.projection || 'mercator';
        this._projection = new d3.geo[this._projectionType]();
        this._mapCenter = opts.mapCenter;
        this._boundingBox = opts.boundingBox;
        this._graticule = opts.graticule || false;
        this._colors = opts.colors;
        this._cluster = opts.cluster || true;
        this._clusterPixelDistance = opts.clusterPixelDistance || 50;
        this._includeAntarctica = opts.includeAntarctica || false;
        this._overlayViews = [];
        this._dataPoints = [];
        this.elId = this.elClass+'-'+this._id;

        this._tile = d3.geo.tile();
        this._tileProjection = new d3.geo[this._projectionType]();
        this._tilePath = d3.geo.path().projection(this._tileProjection);

        ContentListView.call(this, opts);

        //this._overlayViewFactory = new OverlayViewFactory({
        //    mapContext: this._createMapContext()
        //});

        if (!STYLE_EL) {
            $('<style id="'+this.elId+'-style"></style>')
                .text('.'+this.elId+MapViewCss)
                .prependTo('head');
        }
        this._draw();

        var self = this;
        $(window).on('resize', function (e) {
            for (var i=0; i < self._overlayViews.length; i++) {
                if (self._overlayViews[i]._animating) {
                    self._overlayViews[i]._animating = false;
                }
            }
            self.$el.trigger('mapResize.hub');
        });
    };
    inherits(MapView, ContentListView);

    MapView.prototype.mapClassName = 'hub-map';
    MapView.prototype.mapOverlayLayerClassName = 'hub-map-overlays';
    MapView.prototype.mapLayerClassName = 'hub-map-layer';
    MapView.prototype.mapLandClassName = 'hub-map-land';
    MapView.prototype.mapWaterClassName = 'hub-map-water';
    MapView.prototype.mapGraticuleClassName = 'hub-map-graticule';
    MapView.prototype.mapSvgTemplatesClassName = 'hub-map-svg-templates';
    MapView.prototype.elClass = 'hub-map-view';

    MapView.prototype.setElement = function (el) {
        ContentListView.prototype.setElement.call(this, el);
        this.$el.addClass(this.elId);

        var self = this;
        this.$el.on('mapUpdated.hub', function (e) {
            self._update();
        });

        this.$el.on('mapResize.hub', function (e) {
            self._drawMap();
            self.$el.trigger('mapUpdated.hub');
        });

        this.$el.on('contentMarkerImageError.hub', function (e, dataPoint) {
            self._removeDataPoint(dataPoint);
        });
    };

    MapView.prototype._getMapDimensions = function () {
        this._width = this.$el.width();
        this._height = this.$el.height();
        return { width: this._width, height: this._height };
    };

    MapView.prototype._update = function () {
        this._clearOverlays();
        //this._draw();
    };

    /**
     * Add a layer that may contain any number of views
     * @param name {String} The name of the layer. Adds a className on the
     *                      associated svg:g element.
     * @returns {SVGGElement} The svg:g element representing the layer
     */
    MapView.prototype.addLayer = function (name) {
        return this._mapContext.svg.append('svg:g')
            .attr('class', this.mapLayerClassName)
            .attr('class', name);
    };

    MapView.prototype._addDataPoint = function (dataPoint) {
        this._dataPoints.push(dataPoint);
        this.$el.trigger('mapUpdated.hub');
    };

    MapView.prototype._removeDataPoint = function (dataPoint) {
        var index = this._dataPoints.indexOf(dataPoint);
        if (index >= 0) {
            this._dataPoints.splice(index, 1);
            this.$el.trigger('mapUpdated.hub');
        }
    };

    MapView.prototype._createOverlayView = (function () {
        var maxMetricValue = 0;

        return function (dataPoint) {
            var overlayView;

            // Check if it is cluster set
            if (dataPoint.length) {
                if (dataPoint.length > 1) {
                    overlayView = this._overlayViewFactory.createOverlayView(dataPoint);
                } else {
                    overlayView = this._overlayViewFactory.createOverlayView(dataPoint[0]);
                }
                return overlayView;
            }

            // Check if it is not a CollectionPoint
            if (! this.isCollectionPoint(dataPoint)) {
                overlayView = this._overlayViewFactory.createOverlayView(dataPoint);
                return overlayView;
            }

            // Otherwise it's a CollectionPoint
            var collection = dataPoint.getCollection();
            var metric = CollectionToHeatMetric.transform(collection);
            var metricValue = metric.getValue();
            if (metricValue > maxMetricValue) {
                maxMetricValue = metricValue;
            }
            overlayView = new SymbolView(dataPoint, {
                mapContext: this._mapContext,
                maxMetricValue: function () { return maxMetricValue; },
                notifyStream: dataPoint.getCollection()
            });

            return overlayView;
        };
    }());

    /**
     * A helper function to check whether a Point instance is of type CollectionPoint
     * @param dataPoint {Point} The point instance to be checked
     */
    MapView.prototype.isCollectionPoint = function (dataPoint) {
        return dataPoint._collection !== undefined;
    };

    MapView.prototype._createMapContext = function () {
        var mapSvg = d3.select('.hub-map-svg');
        if (! mapSvg[0][0]) {
            mapSvg = d3.select(this.listElSelector).append('svg')
                .attr('class', this.mapWaterClassName+' hub-map-svg');
        }

        if (! SVG_TEMPLATES_EL) {
            SVG_TEMPLATES_EL = d3.select(this.listElSelector).append('div')
                .attr('class', this.mapSvgTemplatesClassName);
        }

        return {
            path: this._getPathForProjection(),
            svg: mapSvg,
            projection: this._projection
        };
    };

    MapView.prototype._draw = function () {
        //this._mapContext = this._createMapContext();
        this._drawMap();
        //var clusteredPoints = this.cluster(this._dataPoints, 75);
        //for (var i=0; i < clusteredPoints.length; i++) {
        //    this.addOverlay(this._createOverlayView(clusteredPoints[i]));
        //}
        //this._drawOverlays();
    };

    MapView.prototype._drawMap = function () {
        this._map = L.map(this.el).setView([37.774929499038386, -122.41941549873445], 12);
        this._map._initPathRoot();

        // Add a fake GeoJSON line to coerce Leaflet into creating the <svg> tag that d3_geoJson needs
        //new L.geoJson({"type": "LineString","coordinates":[[0,0],[0,0]]}).addTo(this._map);

        // Water Areas from OpenStreetMap
        var waterColor = "#9cb9e7";
        new L.TileLayer.TileJSON("http://tile.openstreetmap.us/vectiles-water-areas/{z}/{x}/{y}.topojson", {
            class: "water",
            layerName: "vectile",
            style: function(d) { return "fill: " + waterColor; }
        }).addTo(this._map);

        // Land
        var landColor = "#9fde7f";
        new L.TileLayer.TileJSON("http://tile.openstreetmap.us/vectiles-land-usages/{z}/{x}/{y}.topojson", {
            class: "land",
            layerName: "vectile",
            style: function(d) { 
                if (d.properties.kind != 'park') {
                    return "display: none";
                }
                return "fill: " + landColor + "; stroke: " + landColor;
            }
        }).addTo(this._map);

        // Highways from OpenStreetMap
        var roadSizes = {
          "highway": "4px",
          "major_road": "1.8px",
          "minor_road": "1.2px",
          "rail": "0.8px",
          "path": "0.5px"
        };
        var roadColors = {
          "highway": "#fa9e25",
          "major_road": "#ffe168",
          "minor_road": "#FFF",
          "rail": "#c0c0c0",
          "path": "#d6cfc2"
        };

        var self = this;
        new L.TileLayer.TileJSON("http://tile.openstreetmap.us/vectiles-highroad/{z}/{x}/{y}.topojson", {
            class: "road",
            layerName: "vectile",
            style: function(d) {
                if (self._map.getZoom() <= 12 && d.properties.kind == 'minor_road') {
                    return "display: none";
                }
                return "fill: none; stroke-width: " + roadSizes[d.properties.kind] + "; stroke: " + roadColors[d.properties.kind];
            }
        }).addTo(this._map);

        
        // Labels
        var topPane = this._map._createPane('leaflet-top-pane', this._map.getPanes().mapPane);
        var topLayer = new L.tileLayer('http://{s}.tile.stamen.com/toner-labels/{z}/{x}/{y}.png', {
          maxZoom: 17
        }).addTo(this._map);
        topPane.appendChild(topLayer.getContainer());
        topLayer.setZIndex(7);
    };

    MapView.prototype._attachZoomHandler = function () {
        this._zoom = d3.behavior.zoom()
            .scale(this._projection.scale() * 2 * Math.PI)
            .scaleExtent([ 1 << 0, 1 << 23 ])
            .on('zoom', this._handleZoom.bind(this));
    };

    MapView.prototype._handleZoom = function () {
        var tiles = this._tile
            .scale(this._zoom.scale())
            .translate(this._zoom.translate())
            ();

        this._projection
            .scale(this._zoom.scale() / 2 / Math.PI)
            .translate(this._zoom.translate());

        var prefix = '-webkit-';

        // Water
        var image = this._waterTileLayer
            .style(prefix + 'transform', this._getMatrix3d(tiles.scale, tiles.translate))
            .selectAll('.tile')
            .data(tiles, function (d) { return d; });

        image.exit()
            .remove();

        var self = this;
        image.enter().append('svg')
            .attr('class', 'tile')
            .style("left", function (d) { return d[0] * 256 + "px"; })
            .style("top", function (d) { return d[1] * 256 + "px"; })
            .each(function (d) {
                var svg = d3.select(this);
                this._xhr = d3.json("http://" + ["a", "b", "c"][(d[0] * 31 + d[1]) % 3] + ".tile.openstreetmap.us/vectiles-water-areas/" + d[2] + "/" + d[0] + "/" + d[1] + ".json", function(error, json) {
                    var k = Math.pow(2, d[2]) * 256; // size of the world in pixels

                    self._tilePath.projection()
                        .translate([k / 2 - d[0] * 256, k / 2 - d[1] * 256]) // [0°,0°] in pixels
                        .scale(k / 2 / Math.PI);

                    svg.selectAll("path")
                        .data(json.features.sort(function(a, b) { return a.properties.sort_key - b.properties.sort_key; }))
                      .enter().append("path")
                        .attr("class", function(d) { return d.properties.kind; })
                        .attr("d", self._tilePath);
                });
            });

        // Land
        var image = this._landTileLayer
            .style(prefix + 'transform', this._getMatrix3d(tiles.scale, tiles.translate))
            .selectAll('.tile')
            .data(tiles, function (d) { return d; });

        image.exit()
            .remove();

        var self = this;
        image.enter().append('svg')
            .attr('class', 'tile')
            .style("left", function (d) { return d[0] * 256 + "px"; })
            .style("top", function (d) { return d[1] * 256 + "px"; })
            .each(function (d) {
                var svg = d3.select(this);
                this._xhr = d3.json("http://" + ["a", "b", "c"][(d[0] * 31 + d[1]) % 3] + ".tile.openstreetmap.us/vectiles-land-usages/" + d[2] + "/" + d[0] + "/" + d[1] + ".json", function(error, json) {
                    var k = Math.pow(2, d[2]) * 256; // size of the world in pixels

                    self._tilePath.projection()
                        .translate([k / 2 - d[0] * 256, k / 2 - d[1] * 256]) // [0°,0°] in pixels
                        .scale(k / 2 / Math.PI);

                    svg.selectAll("path")
                        .data(json.features.sort(function(a, b) { return a.properties.sort_key - b.properties.sort_key; }))
                      .enter().append("path")
                        .attr("class", function(d) { return d.properties.kind; })
                        .attr("d", self._tilePath);
                });
            });
    };

    MapView.prototype._clearOverlays = function () {
        for (var i=0; i < this._overlayViews.length; i++) {
            var overlayView = this._overlayViews[i];
            overlayView.destroy();
        }
        this._overlayViews = [];
    };

    /**
     * Add a Point instance to be visualized on the map
     * @param dataPoint {Point} The point to be visualized on the map
     */
    MapView.prototype.add = function (point) {
        this._addDataPoint(point);
        this.$el.trigger('addDataPoint.hub', point);
    };

    MapView.prototype._drawOverlays = function () {
        if (! this._overlaysPath) {
            this._overlaysPath = this._getPathForProjection();
        }

        // Append the SVG element with which the map will be drawn on.
        if (! this._mapOverlayEl) {
            this._mapOverlayEl = this.addLayer('hub-map-overlays');
        }
        for (var i=0; i < this._overlayViews.length; i++) {
            var overlayView = this._overlayViews[i];
            if (! overlayView._rendered) {
                this._overlayViews[i].setMapContext({ el: this.el, path: this._overlaysPath, svg: this._mapOverlayEl });
                this._overlayViews[i].render();
            }
        }
    };

    MapView.prototype._getPathForProjection = function () {
        var width = this.$el.width(),
            height = this.$el.height();

        this._projection.center([0, this._includeAntarctica ? 0 : 27.55]); // Update center of map when Antarctica is removed

        if (! this._boundingBox) {
            // Scale the map (http://stackoverflow.com/a/14691788)

            this._projection
                .scale((width + 1) / 2 / Math.PI)
                .translate([width / 2, height / 2]); // Place the center, and the midpoint of the container

            return d3.geo.path().projection(this._projection);
        } else {
            this._projection
                .scale(1)
                .translate([0, 0]);

            var path = d3.geo.path().projection(this._projection);
            var bboxFeature = this._getBoundingBoxFeature();
            var b = path.bounds(bboxFeature);
            var s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
            var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

            this._projection
                .scale(s)
                .translate(t);

            return path;
        }
    };

    MapView.prototype._getBoundingBoxFeature = function () {
        // Bounding box in degrees [{ lat: x1, lon: y1 }, { lat: x2, lon: y2 }]
        // GeoJSON Feature object spec: (http://geojson.org/geojson-spec.html#feature-objects)
        return {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'Polygon',
                'coordinates': [
                    [
                        [this._boundingBox[0].lon, this._boundingBox[0].lat],
                        [this._boundingBox[1].lon, this._boundingBox[0].lat],
                        [this._boundingBox[1].lon, this._boundingBox[1].lat],
                        [this._boundingBox[0].lon, this._boundingBox[1].lat],
                        [this._boundingBox[0].lon, this._boundingBox[0].lat]
                    ]
                ]
            }
        };
    };

    /**
     * Add a OverlayView instance to the map
     * @param overlayView {OverlayView} The OverlayView to be drawn on the map
     * @returns {MapView} The MapView instance in case chaining is needed
     */
    MapView.prototype.addOverlay = function (overlayView) {
        this._overlayViews.push(overlayView);
        this._drawOverlays();
        return this;
    };

    MapView.prototype.cluster = function (elements, distance) {
        var currentElements = elements.slice(0);
        var pixelDistance = this._pixelDistance();
        var distLat = distance * pixelDistance.lat;
        var distLon = distance * pixelDistance.lon;

        var clustered = [];

        while (currentElements.length > 0) {
            var marker = currentElements.shift();
            var cluster = [];
            cluster.push(marker);
            var i = 0;
            while ( i < currentElements.length) {
                if (Math.abs(currentElements[i].lat - marker.lat) < distLat && Math.abs(currentElements[i].lon - marker.lon) < distLon) {
                    var aMarker = currentElements.splice(i, 1);
                    cluster.push(aMarker[0]);
                    i--;
                }
                i++;
            }
            clustered.push(cluster);
        }

        return clustered;
    };

    MapView.prototype._pixelDistance = function () {
        var width = this.$el.width(),
            height = this.$el.height();

        var p0, p1;
        p0 = this._projection.invert([width / 2, height / 2]);
        p1 = this._projection.invert([(width / 2) + 1, (height / 2) + 1]);

        var distance = {
            lat: Math.abs(p0[1] - p1[1]),
            lon: Math.abs(p0[0] - p1[0])
        };

        return distance;
    };

    MapView.prototype._getMatrix3d = function (scale, translate) {
        var k = scale / 256, r = scale % 1 ? Number : Math.round;
        return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1 ] + ")";
    };

    return MapView;
});
