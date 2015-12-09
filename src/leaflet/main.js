'use strict';

var $ = require('streamhub-sdk/jquery');
var L = require('leaflet');
var LeafletCss = require('text!leaflet-css');

var LEAFLET_STYLE;

// Inject leaflet CSS
if (!LEAFLET_STYLE) {
  var styleEl = document.createElement('style');
  styleEl.innerHTML = LeafletCss;
  document.getElementsByTagName('head')[0].appendChild(styleEl);
}

L.Icon.Default.imagePath = '/lib/leaflet/images/';

L.ContentDivIcon = L.DivIcon.extend({
  createIcon: function (oldIcon) {
    var div = L.DivIcon.prototype.createIcon.call(this, oldIcon);

    $(div).find('img').on('error', function (e) {
      $(e.target).trigger('imageError.hub');
    });

    return div;
  }
});

module.exports = L;
