define([
    'streamhub-map',
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-map/content/content-point',
    'inherits',
    'streamhub-map/leaflet',
    'streamhub-map/leaflet-markercluster'],
function (
    MapView,
    ContentListView,
    ContentPoint,
    inherits,
    L) {

    var ContentMapView = function (opts) {
        MapView.call(this, opts);

        this._markers = new L.MarkerClusterGroup({
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            maxClusterRadius: 100,
            spiderfyDistanceMultiplier: 2,
            iconCreateFunction: function(cluster) {
                return new L.Icon({
                    iconUrl: '/src/images/CollectionMarker.png',
                    iconRetinaUrl: '/src/images/CollectionMarker@2x.png',
                    iconSize: [54,55],
                    iconAnchor: [27,27.5]
                });
            }
        });
    };
    inherits(ContentMapView, MapView);

    ContentMapView.prototype.add = function (content) {
        if (! content._annotations.geocode || ! content._annotations.geocode.latitude || ! content._annotations.geocode.longitude ) {
            return;
        }

        // Adapt Content to ContentPoint
        var contentPoint = new ContentPoint(content);

        MapView.prototype.add.call(this, contentPoint);
    };

    ContentMapView.prototype.setElement = function (el) {
        MapView.prototype.setElement.apply(this, arguments);

        var self = this;
        this.$el.on('focusDataPoint.hub', function (e, focusContext) {
            self._displayDataPointDetails(focusContext.contentItems);
        });
    };

    ContentMapView.prototype._drawMap = function () {
        MapView.prototype._drawMap.call(this);
    };

    ContentMapView.prototype._drawMarker = function (dataPoint) {
        var marker = new L.Marker(
            new L.LatLng(dataPoint.lat, dataPoint.lon), {
                icon: new L.Icon({
                    iconUrl: '/src/images/ContentMarker.png',
                    iconRetinaUrl: '/src/images/ContentMarker@2x.png',
                    iconSize: [44,48],
                    iconAnchor: [22,48]
                })
            }
        );
        this._markers.addLayer(marker);
        this._map.addLayer(this._markers);
    };

    ContentMapView.prototype._displayDataPointDetails = function (contentItems) {
        if (! this.modal || ! contentItems || ! contentItems.length) {
            return;
        }

        var modalContentView = new ContentListView();
        for (var i=0; i < contentItems.length; i++) {
            modalContentView.more.write(contentItems[i]);
        }

        this.modal.show(modalContentView);
    };

    return ContentMapView;
});
