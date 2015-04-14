define([
    'streamhub-sdk/modal',
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-hot-collections/streams/collection-to-heat-metric',
    'text!streamhub-map/css/style.css',
    'streamhub-sdk/jquery',
    'streamhub-map/leaflet',
    'streamhub-map/package-attribute',
    'inherits'
], function (
    ModalView,
    ContentListView,
    CollectionToHeatMetric,
    MapViewCss,
    $,
    L,
    PackageAttribute,
    inherits
) {
    'use strict';

    var STYLE_EL;
    var SVG_TEMPLATES_EL;

    /**
     * A view to visualize StreamHub content on a map
     * @constructor
     * @param [opts] {Object} Configuration options for the MapView
     * @param [opts.leafletMapOptions] {Object} An object representing the options passed into the creation of a Leaflet Map (L.Map)
     * @param [opts.mapboxTileOptions] {Number} The mapbox map id and other tile options
     */
    var MapView = function (opts) {
        opts = opts || {};

        this._id = new Date().getTime();
        this._mapboxTileOptions = opts.mapboxTileOptions || {};
        this._mapboxTileOptions.mapId = this._mapboxTileOptions.mapId || 'livefyre.hknm2g26';
        this._mapboxTileOptions.format = this._mapboxTileOptions.format || 'png';
        this._mapboxTileOptions.accessToken = this._mapboxTileOptions.accessToken || null;
        this._leafletMapOptions = opts.leafletMapOptions || {};

        this._overlayViews = [];
        this._dataPoints = [];
        this.elId = this.elClass+'-'+this._id;

        ContentListView.call(this, opts);

        if(this.el){
            PackageAttribute.decorate(this.el);
        }

        if(this.modal) {
            PackageAttribute.decorateModal(this.modal);
        }

        if (!STYLE_EL) {
            $('<style id="'+this.elId+'-style"></style>')
                .text('.'+this.elId+MapViewCss)
                .prependTo('head');
        }

        this._drawMap();
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

        this.$el.on('imageError.hub', function (e) {
            var badImageSrc = $(e.target).attr('src');
            var dataPoint;
            self._dataPoints.forEach(function (dataPoint) {
                if (typeof dataPoint.getContent !== 'function') {
                    return;
                }
                var content = dataPoint.getContent() || {};
                var attachments = content.attachments || [];
                var firstAttachment = attachments[0] || {};
                // Remove datapoint of image is broken
                if (firstAttachment.thumbnail_url === badImageSrc) {
                    self._removeDataPoint(dataPoint);
                }
            });
        });

        this.$el.on('addDataPoint.hub', function (e, dataPoint) {
            self._drawMarker(dataPoint);
        });
    };

    MapView.prototype._drawMarker = function (dataPoint) {
        var marker = this._createMarker(dataPoint);
        if (marker) {
            this._addMarkerToMap(marker);
        }
        return marker;
    };

    MapView.prototype._createMarker = function (dataPoint) {
        return new L.Marker(this._getLatLngFromPoint(dataPoint));
    };

    MapView.prototype._addMarkerToMap = function (marker) {
        marker.addTo(this._map);
    };

    MapView.prototype._getLatLngFromPoint = function (point) {
        return new L.LatLng(point.lat, point.lon);
    };

    MapView.prototype._getMapDimensions = function () {
        this._width = this.$el.width();
        this._height = this.$el.height();
        return { width: this._width, height: this._height };
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
        this.$el.trigger('addDataPoint.hub', dataPoint);
    };

    MapView.prototype._removeDataPoint = function (dataPoint) {
        var index = this._dataPoints.indexOf(dataPoint);
        if (index >= 0) {
            this._dataPoints.splice(index, 1);
            this.$el.trigger('removeDataPoint.hub');
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

    MapView.prototype._drawMap = function () {
        var urlTemplate;

        this._map = new L.Map(this.el, this._leafletMapOptions).setView(
            this._leafletMapOptions.center || [0,0],
            this._leafletMapOptions.zoom || 2
        );

        this._map.attributionControl
            .setPrefix('')
            .addAttribution("<a href='https://www.openstreetmap.org/copyright' target='_blank'>&copy; OpenStreetMap</a>");

        // No Mapbox accessToken, use Mapbox v3
        if(this._mapboxTileOptions.accessToken == null) {
            urlTemplate = "https://{s}.tiles.mapbox.com/v3/"+this._mapboxTileOptions.mapId+"/{z}/{x}/{y}."+this._mapboxTileOptions.format;
        } else {
            // Mapbox accessToken supplied, use Mapbox v4
            urlTemplate = "https://{s}.tiles.mapbox.com/v4/"+this._mapboxTileOptions.mapId+"/{z}/{x}/{y}."+this._mapboxTileOptions.format+"?access_token="+this._mapboxTileOptions.accessToken;
        }
        new L.TileLayer(urlTemplate)
            .addTo(this._map);
    };

    /**
     * Add a Point instance to be visualized on the map
     * @param dataPoint {Point} The point to be visualized on the map
     */
    MapView.prototype.add = function (point) {
        this._addDataPoint(point);
    };

    return MapView;
});
