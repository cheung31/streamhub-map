define([
    'streamhub-map/leaflet',
    'streamhub-map/leaflet-markercluster'
], function (L) {
    'use strict';

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

        this._group._map.fitBounds(this._bounds, { 
            paddingBottomRight: [520,0]
        });
    };

    return L;
});
