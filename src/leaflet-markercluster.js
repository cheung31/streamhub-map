define([
    'leaflet-markercluster',
    'text!leaflet-markercluster/MarkerCluster.css'
], function (MarkerCluster, LeafletCss) {
    'use strict';

    var LEAFLET_STYLE;

    // Inject leaflet CSS
    if (!LEAFLET_STYLE) {
        var styleEl = document.createElement('style');
        styleEl.innerHTML = LeafletCss;
        document.getElementsByTagName('head')[0].appendChild(styleEl);
    };

    L.MarkerCluster.prototype.zoomToBounds = function () {
        var childClusters = this._childClusters.slice(),
           map = this._group._map,
           zoom = this._zoom + 1,
           mapZoom = map.getZoom(),
           i;
        var boundsZoom = map.getBoundsZoom(this._bounds);

        //calculate how fare we need to zoom down to see all of the markers
        while (childClusters.length > 0 && boundsZoom > zoom) {
            zoom++;
            var newClusters = [];
            for (i = 0; i < childClusters.length; i++) {
                newClusters = newClusters.concat(childClusters[i]._childClusters);
            }
            childClusters = newClusters;
        }

        //if (boundsZoom > zoom) {
        //    this._group._map.setView(this._latlng, zoom, { offset: [500, 0] });
        //} else if (boundsZoom <= mapZoom) { //If fitBounds wouldn't zoom us down, zoom us down instead
        //    this._group._map.setView(this._latlng, mapZoom + 1, { offset: [500, 0] });
        //} else {
        //    this._group._map.fitBounds(this._bounds, { 
        //        paddingBottomRight: [500,0]
        //    });
        //}
        this._group._map.fitBounds(this._bounds, { 
            paddingBottomRight: [520,0]
        });
    };

    return MarkerCluster;
});
