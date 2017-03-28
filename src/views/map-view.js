'use strict';

var $ = require('streamhub-sdk/jquery');
var ContentListView = require('streamhub-sdk/content/views/content-list-view');
var get = require('mout/object/get');
var inherits = require('inherits');
var L = require('livefyre-map/leaflet/main');
var PackageAttribute = require('livefyre-map/package-attribute');
var util = require('streamhub-sdk/util');

/**
 * A view to visualize StreamHub content on a map.
 * @constructor
 * @param [opts] {Object} Configuration options for the MapView
 * @param [opts.leafletMapOptions] {Object} An object representing the options
 *   passed into the creation of a Leaflet Map (L.Map)
 * @param [opts.mapboxTileOptions] {number} The mapbox map id and other tile options
 */
function MapView(opts) {
  opts = opts || {};

  this._id = new Date().getTime();
  this._mapboxTileOptions = opts.mapboxTileOptions || {};
  this._mapboxTileOptions.format = this._mapboxTileOptions.format || 'png';
  this._leafletMapOptions = opts.leafletMapOptions || {};

  this._overlayViews = [];
  this._dataPoints = [];
  this._imgSrcToDataPoint = {};
  this._elClass = 'hub-map-view hub-map-view-' + this._id;

  ContentListView.call(this, opts);

  this.el && PackageAttribute.decorate(this.el);

  if (this.modal) {
    PackageAttribute.decorateModal(this.modal);
    this.modal.$el.attr(opts.prefix, opts.uuid);
  }

  this._drawMap();
}
inherits(MapView, ContentListView);

/**
 * The URL for tile images being loaded.
 * @const {string}
 */
var TILE_URL = 'https://{s}.tiles.mapbox.com/{version}/{mapId}/{z}/{x}/{y}.{format}';

/**
 * Draw the map and add a tile layer.
 * @private
 */
MapView.prototype._drawMap = function () {
  this._map = new L.Map(this.el, this._leafletMapOptions).setView(
    this._leafletMapOptions.center || [0,0],
    this._leafletMapOptions.zoom || 2
  );

  this._map.attributionControl
    .setPrefix('')
    .addAttribution('<a href=\'https://www.openstreetmap.org/copyright\' target=\'_blank\'>&copy; OpenStreetMap</a>');

  this._tileLayer = new L.TileLayer(this._getVersionedTileURL(), {
    mapId: this._mapboxTileOptions.mapId,
    format: this._mapboxTileOptions.format
  }).addTo(this._map);
};

/**
 * Create a LagLng object from a point.
 * @param {ContentPoint} point The point to convert.
 * @return {L.LatLng}
 * @private
 */
MapView.prototype._getLatLngFromPoint = function (point) {
  return new L.LatLng(point.lat, point.lon);
};

/**
 * Gets a versioned tile URL based on the config options.
 * @return {string}
 * @private
 */
MapView.prototype._getVersionedTileURL = function () {
  var accessToken = this._mapboxTileOptions.accessToken;
  if (!accessToken) {
    return TILE_URL.replace('{version}', 'v3');
  }
  return [TILE_URL.replace('{version}', 'v4'), '?access_token=', accessToken].join('');
};

/**
 * Add a Point instance to be visualized on the map
 * @param {Point} point The point to be visualized on the map
 */
MapView.prototype.add = function (point) {
  this._dataPoints.push(point);
  this.$el.trigger('addDataPoint.hub', point);

  var content = point.getContent ? point.getContent() || {} : {};
  var attachment = (content.attachments || []).length ? content.attachments[0] : {};

  [attachment.thumbnail_url, get(content, 'author.avatar')].forEach(function (url) {
    if (url) {
      this._imgSrcToDataPoint[url] = point;
    }
  }, this);
};

/**
 * Add the marker to the map.
 * @param {L.Marker} marker The marker to add to the map.
 */
MapView.prototype.addMarkerToMap = function (marker) {
  util.raf(function (m) {
    m.addTo(this._map);
  }.bind(this, marker));
};

/**
 * Create a marker for a specific data point.
 * @param {ContentPoint} dataPoint The point to create.
 * @return {L.Marker} The marker based on the data point.
 */
MapView.prototype.createMarker = function (dataPoint) {
  return new L.Marker(this._getLatLngFromPoint(dataPoint));
};

/** @override */
MapView.prototype.destroy = function () {
  this._map && this._map.remove();
  this._map = null;
  ContentListView.prototype.destroy.call(this);
};

/**
 * Draw the marker on the map.
 * @param {ContentPoint} dataPoint The data point to draw on the map.
 * @return {L.Marker}
 */
MapView.prototype.drawMarker = function (dataPoint) {
  var marker = this.createMarker(dataPoint);
  marker && this.addMarkerToMap(marker);
  return marker;
};

/**
 * Remove a data point from the map.
 * @param {ContentPoint} dataPoint The data point to remove.
 */
MapView.prototype.removeDataPoint = function (dataPoint) {
  var index = this._dataPoints.indexOf(dataPoint);
  if (index === -1) {
    return;
  }
  this._dataPoints.splice(index, 1);
  this.$el.trigger('removeDataPoint.hub');
};

/**
 * Set the element that the map view will use.
 * @param {Element} el The element to set.
 * @override
 */
MapView.prototype.setElement = function (el) {
  ContentListView.prototype.setElement.call(this, el);
  this.$el.addClass(this._elClass);

  this.$el.on('imageError.hub', function (evt) {
    var badImageSrc = $(evt.target).attr('src');
    var dataPoint = this._imgSrcToDataPoint[badImageSrc];
    if (dataPoint) {
      this.removeDataPoint(dataPoint);
    }
  }.bind(this));

  this.$el.on('addDataPoint.hub', function (evt, dataPoint) {
    this.drawMarker(dataPoint);
  }.bind(this));
};

module.exports = MapView;
