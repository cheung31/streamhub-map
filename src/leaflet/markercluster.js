'use strict';

var LeafletCss = require('text!leaflet-markercluster-css');
var MarkerCluster = require('leaflet-markercluster');

var LEAFLET_STYLE;

// Inject leaflet CSS
if (!LEAFLET_STYLE) {
  var styleEl = document.createElement('style');
  styleEl.innerHTML = LeafletCss;
  document.getElementsByTagName('head')[0].appendChild(styleEl);
}

module.exports = MarkerCluster;
