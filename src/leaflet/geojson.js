'use strict';

var $ = require('jquery');
var L = require('leaflet');

/**
 * Override addLayer to trigger an event that the MapView will listen for and
 * add the content to the MarkerClusterGroup.
 * @override
 */
L.GeoJSON.prototype.addLayer = function (layer) {
  $(this._map._container).trigger('addPoint.hub', layer.feature.properties);
};
