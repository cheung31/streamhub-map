define([
    'streamhub-map/views/map-view',
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-map/content/content-point',
    'hgn!streamhub-map/views/templates/marker',
    'inherits',
    'streamhub-sdk/jquery',
    'streamhub-map/leaflet',
    'streamhub-map/leaflet-markercluster'],
function (
    MapView,
    ContentListView,
    ContentPoint,
    MarkerTemplate,
    inherits,
    $,
    L) {

    var ContentMapView = function (opts) {
        this._contentToMarkerMap = {};
        this._markers = new L.MarkerClusterGroup({
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            maxClusterRadius: 100,
            spiderfyDistanceMultiplier: 2,
            iconCreateFunction: function(cluster) {
                var childMarkers = cluster.getAllChildMarkers();
                var clusterIconHtml;
                for (var i=0; i < childMarkers.length; i++) {
                    var childMarker = childMarkers[i];
                    clusterIconHtml = childMarker._icon ? childMarker._icon.innerHTML : childMarker.options.icon.options.html;
                    if (clusterIconHtml) {
                        break;
                    }
                }

                var $clusterIcon = $(clusterIconHtml);
                $clusterIcon.append('<div class="hub-map-marker-badge">'+childMarkers.length+'</div>');
                return new L.ContentDivIcon({
                    className: 'hub-map-collection-marker',
                    html: '<div class="hub-map-marker-bg">'+$clusterIcon.html()+'</div>',
                    iconSize: [54,55],
                    iconAnchor: [27,27.5]
                });
            }
        });

        MapView.call(this, opts);
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

        this._markers.on('click', function (e) {
            var content = e.layer.options.icon.options.content;
            self.$el.trigger('focusDataPoint.hub', { contentItems: [content] });
        });

        this._markers.on('clusterclick', function (e) {
            if (self._map.getMaxZoom() !== self._map.getZoom()) {
                return;
            }

            var content = [];
            for (var i=0; i < e.layer._markers.length; i++) {
                content.push(e.layer._markers[i].options.icon.options.content);
            }
            self.$el.trigger('focusDataPoint.hub', { contentItems: content });
        });
    };

    ContentMapView.prototype._drawMarker = function (dataPoint) {
        var marker = MapView.prototype._drawMarker.call(this, dataPoint);
        this._contentToMarkerMap[dataPoint.getContent().id] = marker;
        return marker;
    };

    ContentMapView.prototype._createMarker = function (dataPoint) {
        var thumbnail_url;
        var contentItem = dataPoint.getContent();
        if (contentItem.attachments.length && contentItem.attachments[0].thumbnail_url) {
            thumbnail_url = contentItem.attachments[0].thumbnail_url;
        } else if (contentItem.author && contentItem.author.avatar) {
            thumbnail_url = contentItem.author.avatar;
        }

        var latlng = this._getLatLngFromPoint(dataPoint);
        return new L.Marker(
            latlng, {
                icon: new L.ContentDivIcon({
                    className: 'hub-map-content-marker',
                    html: MarkerTemplate({
                        thumbnail_url: thumbnail_url || ''
                    }),
                    iconSize: [44,48],
                    iconAnchor: [22,48],
                    content: dataPoint.getContent()
                })
            }
        );
    };

    ContentMapView.prototype._addMarkerToMap = function (marker) {
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

    ContentMapView.prototype._removeDataPoint = function (dataPoint) {
        // Remove marker
        this._markers.removeLayer(this._contentToMarkerMap[dataPoint.getContent().id]);
        MapView.prototype._removeDataPoint.call(this, dataPoint);
    };

    return ContentMapView;
});
