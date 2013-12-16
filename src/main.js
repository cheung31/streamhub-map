define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/modal/views/content-list-view-modal',
    'streamhub-map/views/overlay-view',
    'streamhub-map/views/overlay-factory',
    'streamhub-map/views/symbol-view',
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-hot-collections/streams/collection-to-heat-metric',
    'json!streamhub-map/defaults.json',
    'json!streamhub-map-resources/world-50m.json',
    'text!streamhub-map/css/style.css',
    'd3',
    'topojson',
    'inherits'
], function (
    $,
    ContentListViewModal,
    OverlayView,
    OverlayViewFactory,
    SymbolView,
    ContentListView,
    CollectionToHeatMetric,
    DefaultsJson,
    WorldJson,
    MapViewCss,
    d3,
    topojson,
    inherits
) {
    'use strict';

    var STYLE_EL;

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
        opts.modal = opts.modal || new ContentListViewModal();

        this._id = new Date().getTime();
        this._projectionType = opts.projection || 'mercator';
        this._projection = new d3.geo[this._projectionType]();
        this._mapCenter = opts.mapCenter;
        this._boundingBox = opts.boundingBox;
        this._graticule = opts.graticule || false;
        this._colors = opts.colors;
        this._includeAntarctica = opts.includeAntarctica || false;
        this._overlayViews = [];
        this._dataPoints = [];
        this.elId = this.elClass+'-'+this._id;

        ContentListView.call(this, opts);

        this._overlayViewFactory = new OverlayViewFactory({
            mapContext: this._createMapContext()
        });

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
            self.$el.trigger('mapUpdated.hub');
        });
    };
    inherits(MapView, ContentListView);

    MapView.prototype.mapClassName = 'hub-map';
    MapView.prototype.mapOverlayLayerClassName = 'hub-map-overlays';
    MapView.prototype.mapLayerClassName = 'hub-map-layer';
    MapView.prototype.mapLandClassName = 'hub-map-land';
    MapView.prototype.mapWaterClassName = 'hub-map-water';
    MapView.prototype.mapGraticuleClassName = 'hub-map-graticule';
    MapView.prototype.elClass = 'hub-map-view';

    MapView.prototype.setElement = function (el) {
        ContentListView.prototype.setElement.call(this, el);
        this.$el.addClass(this.elId);

        var self = this;
        this.$el.on('mapUpdated.hub', function (e) {
            self._update();
        });
    };

    MapView.prototype._update = function () {
        this._clearOverlays();
        this._draw();
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
        return {
            path: this._getPathForProjection(),
            svg: mapSvg,
            projection: this._projection
        };
    };

    MapView.prototype._draw = function () {
        this._mapContext = this._createMapContext();
        this._drawMap();
        var clusteredPoints = this.cluster(this._dataPoints, 75);
        for (var i=0; i < clusteredPoints.length; i++) {
            this.addOverlay(this._createOverlayView(clusteredPoints[i]));
        }
        this._drawOverlays();
    };

    MapView.prototype._drawMap = function () {
        // Country ids map to ISO 3166-1 code
        // (http://en.wikipedia.org/wiki/ISO_3166-1_numeric)
        var countries = topojson.feature(WorldJson, WorldJson.objects.countries).features;
        if (! this._includeAntarctica) {
            countries = countries.filter(function (feature) {
                return feature.id !== 10;
            });
        }

        // Append the SVG element with which the map will be drawn on.
        if (this._mapEl) {
            this._mapEl.remove();
        }
        if (this._mapOverlayEl) {
            this._mapEl = this._mapContext.svg
                .insert('svg:g', '.'+this.mapOverlayLayerClassName)
                .attr('class', this.mapClassName);
        } else {
            this._mapEl = this._mapContext.svg.append('svg:g')
                .attr('class', this.mapClassName);
        }

        // Draw the path of the map in SVG.
        var landElements = this._mapEl.selectAll('.'+this.mapLandClassName).data(countries);
        landElements
           .enter()
           .insert("path")
           .attr("class", this.mapLandClassName)
           .attr("d", this._mapContext.path);
        if (this._colors) {
            if (this._colors.land) {
                this._setLandColor(this._colors.land);
            }
            if (this._colors.water) {
                this._setWaterColor(this._colors.water);
            }
        } else {
            this._setLandColor(DefaultsJson.colors.land);
            this._setWaterColor(DefaultsJson.colors.water);
        }

        // Draw graticule
        if (this._graticule) {
            var graticule = d3.geo.graticule();

            // Draw the path for the graticule
            this._mapEl.append("path")
                .attr("class", "hub-map-graticule")
                .datum(graticule)
                .attr("d", this._mapContext.path);

            // Draw the path for the bounding outline of the graticule
            this._mapEl.append("path")
                .datum(graticule.outline)
                .attr("class", this.mapLandClassName)
                .attr("d", this._mapContext.path);
        }
    };

    MapView.prototype._getLandElements = function () {
        return this._mapEl.selectAll('.'+this.mapLandClassName);
    };

    MapView.prototype._getWaterElements = function () {
        return this._mapContext.svg;
    };

    MapView.prototype._setLandColor = function (color) {
        var landElements = this._getLandElements();
        if (typeof color === 'string') {
            landElements
                .attr("stroke", color)
                .attr("stroke-width", "1px")
                .attr("fill", color);
        } else if (typeof color === 'object') {
            landElements
                .attr("stroke", color.stroke)
                .attr("stroke-width", color.strokeWidth)
                .attr("fill", color.fill);
        }
    };

    MapView.prototype._setWaterColor = function (color) {
        var waterElements = this._getWaterElements();
        if (typeof color === 'string') {
            waterElements
                .attr("stroke", color)
                .attr("fill", color)
                .style("background-color", color);
        } else if (typeof color === 'object') {
            waterElements
                .attr("stroke", color.stroke)
                .attr("fill", color.fill)
                .style("background-color", color.fill);
        }
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
        var p0, p1;
        p0 = this._projection.invert([0, 0]);
        p1 = this._projection.invert([1, 1]);

        var distance = {
            lat: Math.abs(p0[1] - p1[1]),
            lon: Math.abs(p0[0] - p1[0])
        };

        return distance;
    };

    return MapView;
});
