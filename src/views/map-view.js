define([
    'streamhub-sdk/modal',
    'streamhub-map/views/side-panel-view',
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-wall',
    'streamhub-hot-collections/streams/collection-to-heat-metric',
    'hgn!streamhub-map/views/templates/map-view',
    'text!streamhub-map/css/style.css',
    'd3',
    'topojson',
    'streamhub-sdk/jquery',
    'inherits',
    'streamhub-map/leaflet',
    'streamhub-map/leaflet-mapoffsetcenter'
], function (
    ModalView,
    SidePanelView,
    ContentListView,
    WallView,
    CollectionToHeatMetric,
    MapViewTemplate,
    MapViewCss,
    d3,
    topojson,
    $,
    inherits,
    L
) {
    'use strict';

    var STYLE_EL;
    var SVG_TEMPLATES_EL;

    /**
     * A view to visualize StreamHub content on a map
     * @constructor
     * @param [opts] {Object} Configuration options for the MapView
     * @param [opts.leafletMapOptions] {Object} An object representing the options passed into the creation of a Leaflet Map (L.Map)
     * @param [opts.cloudmadeStyleId] {Number} The style id of the CloudMade map tile theme
     */
    var MapView = function (opts) {
        opts = opts || {};

        this._id = new Date().getTime();
        this._cloudmadeStyleId = opts.cloudmadeStyleId || 998;
        this._leafletMapOptions = opts.leafletMapOptions || {};
        this._sidePanelView = opts.sidePanel ? new SidePanelView({ subView: new WallView() }) : null;

        this._overlayViews = [];
        this._dataPoints = [];
        this.elId = this.elClass+'-'+this._id;

        ContentListView.call(this, opts);

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
    MapView.prototype.mapContainerSelector = '.hub-map-container';
    MapView.prototype.mapSidePanelSelector = '.hub-map-side-panel';
    MapView.prototype.mapSidePanelHiddenClassName = 'hub-map-side-panel-hidden';
    MapView.prototype.template = MapViewTemplate;
    MapView.prototype.elClass = 'hub-map-view';

    MapView.prototype.setElement = function (el) {
        ContentListView.prototype.setElement.call(this, el);
        this.$el.addClass(this.elId);

        var self = this;

        this.$el.on('imageError.hub', function (e) {
            var dataPoint;
            for (var i=0; i < self._dataPoints.length; i++) {
                if ($(e.target).attr('src') == self._dataPoints[i].getContent().attachments[0].thumbnail_url) {
                    dataPoint = self._dataPoints[i];
                }
            }
            self._removeDataPoint(dataPoint);
        });

        this.$el.on('addDataPoint.hub', function (e, dataPoint) {
            self._drawMarker(dataPoint);

            if (self._sidePanelView) {
                self._sidePanelView._subView.write(dataPoint.getContent());
            }
        });
    };

    MapView.prototype.render = function () {
        ContentListView.prototype.render.call(this);

        if (this._sidePanelView) {
            this._sidePanelView.setElement(this.$el.find(this.mapSidePanelSelector));
            this._sidePanelView.render();
        } else {
            this.$el.find(this.mapSidePanelSelector).addClass('hub-map-side-panel-hidden');
        }
    };

    MapView.prototype._drawMarker = function (dataPoint) {
        new L.Marker(new L.LatLng(dataPoint.lat, dataPoint.lon)).addTo(this._map);
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

    /**
     * A helper function to check whether a Point instance is of type CollectionPoint
     * @param dataPoint {Point} The point instance to be checked
     */
    MapView.prototype.isCollectionPoint = function (dataPoint) {
        return dataPoint._collection !== undefined;
    };

    MapView.prototype._drawMap = function () {
       
        if (this._sidePanelView) { 
            this._map = new L.MapCenterOffset(
                this.$el.find(this.mapContainerSelector)[0],
                this._leafletMapOptions
            );
        } else {
            this._map = new L.Map(
                this.$el.find(this.mapContainerSelector)[0],
                this._leafletMapOptions
            );
        }

        this._map.setView(
            this._leafletMapOptions.center || [0,0],
            this._leafletMapOptions.zoom || 2
        );

        this._map.setView(
            this._leafletMapOptions.center || [0,0],
            this._leafletMapOptions.zoom || 1,
            { offset: [500, 0] }
        );

        new L.TileLayer("http://{s}.tile.cloudmade.com/9f4a9cd9d242456794a775abb4e765e1/"+this._cloudmadeStyleId+"/256/{z}/{x}/{y}.png").addTo(this._map);
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
