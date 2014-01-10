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

    return MarkerCluster;
});
