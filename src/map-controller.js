'use strict';

var base64 = require('base64');
var bind = require('mout/function/bind');
var Collection = require('streamhub-sdk/collection');
var ContentMapView = require('livefyre-map/views/content-map-view');
var delegate = require('view/delegate');
var Duplex = require('stream/duplex');
var events = require('./events');
var forEach = require('mout/array/forEach');
var isBoolean = require('mout/lang/isBoolean');
var isPlainObject = require('mout/lang/isPlainObject');
var L = require('livefyre-map/leaflet/main');
var LivefyreBootstrapClient = require('streamhub-sdk/collection/clients/bootstrap-client');
var GeoLayer = require('livefyre-map/leaflet/tilelayer-geojson');
var ModalView = require('streamhub-sdk/modal');
require('livefyre-map/leaflet/geojson');

/**
 * Map controller class. Handles setting up the collection, map, and layers.
 * @constructor
 * @param {Object} opts Configuration options
 */
function MapController(opts) {
  this._opts = opts || {};

  /**
   * Element that events will be bubbled to so that they can be handled.
   * @type {jQuery}
   */
  this.$antenna = opts.$antenna;

  /**
   * Bootstrap client to use for XHR.
   * @type {LivefyreBootstrapClient}
   * @private
   */
  this._bootstrapClient = new LivefyreBootstrapClient();

  /**
   * Collection that this map is using for it's data.
   * @type {Collection}
   * @private
   */
  this._collection = isPlainObject(opts.collection)
    ? new Collection(opts.collection)
    : opts.collection;

  /**
   * Sets up the content map view. This is what the user sees and what will
   * show all of the items on it.
   * @type {ContentMapView}
   * @private
   */
  this._contentMapView = new ContentMapView(opts);

  /**
   * The map instance for this app.
   * @type {L.Map}
   * @private
   */
  this._map = this._contentMapView.getMap();

  /**
   * List of seen comment ids. Since we will constantly be fetching duplicate
   * data from the geojson endpoint, we need to ensure dupes are removed.
   * @type {Array.<string>}
   * @private
   */
  this._seenIds = [];

  /**
   * The unique id of this controller.
   * @type {string}
   * @private
   */
  this._uid = delegate.getUniqueId();

  this._initialize();
}

/**
 * Zoom attributes on a map.
 * @type {Array.<string>}
 */
var ZOOM_ATTRS = ['touchZoom', 'doubleClickZoom', 'scrollWheelZoom', 'boxZoom'];

/** @enum {string} */
MapController.prototype.events = {
  'addPoint.hub': '_handleNewContent'
};

/**
 * Set up event handlers for this controller.
 * @private
 */
MapController.prototype._delegateEvents = function() {
  delegate.delegateEvents(this.$antenna, this.events, this._uid, this);
};

/**
 * Get a tile URL for the GeoJSON layer.
 * @return {string}
 * @private
 */
MapController.prototype._getTileUrl = function() {
  return [
    this._bootstrapClient._getUrlBase({
      network: this._collection.network,
      environment: this._collection.environment
    }),
    'bs3/v3.1',
    this._collection.network,
    this._collection.siteId,
    base64.btoa(this._collection.articleId),
    'geojson/{z}/{x}/{y}.json'
  ].join('/');
};

/**
 * Handle new content from the GeoJSON layer.
 * @param {Event} evt
 * @param {Object} state
 * @private
 */
MapController.prototype._handleNewContent = function(evt, state) {
  var authors = {};
  var updater = this._collection._updater || this._collection.createUpdater();
  // Ensure that content doesn't get added multiple times.
  if (this._seenIds.indexOf(state.content.id) > -1) {
    return;
  }
  this._seenIds.push(state.content.id);
  authors[state.content.authorId] = state.content.author;
  updater.push.apply(updater, updater._contentsFromStreamData({
    states: [state],
    authors: authors
  }));
};

/**
 * Handle the zoomend event. Triggers an event on the antenna DOM object so
 * it can be handled upstream.
 * @param {Event} evt The zoomend event.
 * @private
 */
MapController.prototype._handleZoomEvent = function(evt) {
  this.$antenna.trigger(events.ZOOM, { zoom: evt.target.getZoom() });
};

/**
 * Initialize the components. Set up streaming, initialize the geojson layer,
 * and set up the event handlers.
 * @private
 */
MapController.prototype._initialize = function() {
  Duplex.prototype.pipe.call(this._collection, this._contentMapView);
  this._initializeGeoJsonLayer();
  this._delegateEvents();

  this._map.on('zoomend', bind(this._handleZoomEvent, this));
};

/**
 * Initialize the map view. When new content arrives, it will be added onto the
 * map as a layer.
 * @private
 */
MapController.prototype._initializeGeoJsonLayer = function() {
  // Should be possible to pass an invalid collection or a mock collection that
  // doesn't have any of this data. Don't want to have a ton of errors.
  if (!this._collection.network ||
      !this._collection.siteId ||
      !this._collection.articleId) {
    return;
  }
  var options = {
    clipTiles: true,
    unique: function (feature) {
      return feature.properties.content.id;
    }
  };

  this._map.addLayer(new GeoLayer(this._getTileUrl(), options, {
    coordsToLatLng: function (coords) {
      return new L.LatLng(coords[0], coords[1]);
    }
  }));
};

/**
 * Set the modal that will open when the user clicks on an item within the map.
 * @param {boolean=} opt_modal To show the modal or not.
 * @private
 */
MapController.prototype._setModal = function(opt_modal) {
  if (!isBoolean(opt_modal)) {
    return;
  }
  this._contentMapView.modal = opt_modal ? (new ModalView()) : false;
};

/**
 * Set whether the map can be dragged or not.
 * @param {boolean=} opt_pan To enable or disable panning.
 * @private
 */
MapController.prototype._setPan = function(opt_pan) {
  if (!isBoolean(opt_pan)) {
    return;
  }
  opt_pan ? this._map.dragging.enable() : this._map.dragging.disable();
};

/**
 * Set the visibility of the zoom control button on the map.
 * @param {boolean=} enabled To enable or disable the zoom control button.
 * @private
 */
MapController.prototype._setZoomControl = function(opt_enabled) {
  if (!isBoolean(opt_enabled)) {
    return;
  }

  // The leaflet action that we want to use to enable/disable attributes.
  var action = opt_enabled ? 'enable' : 'disable';
  var self = this;

  // Enable/disable all zoom attributes based on the argument.
  forEach(ZOOM_ATTRS, function(attr) { self._map[attr][action](); });

  if (opt_enabled && !this._map.zoomControl) {
    this._map.zoomControl = new L.control.zoom();
    this._map.zoomControl.addTo(this._map);
    return;
  }
  if (!opt_enabled && this._map.zoomControl) {
    this._map.zoomControl.removeFrom(this._map);
    this._map.zoomControl = null;
  }
};

/**
 * Configure the map with the provided config object.
 * @param {Object} opts
 */
MapController.prototype.configureMap = function(opts) {
  if (opts.leafletMapOptions.center) {
    this._map.setView(opts.leafletMapOptions.center);
  }

  if (opts.leafletMapOptions.zoom) {
    this._map.setZoom(opts.leafletMapOptions.zoom);
  }

  this._setModal(opts.modal);
  this._setPan(opts.allowPanning);
  this._setZoomControl(opts.leafletMapOptions.zoomControl);

  if (opts.mapboxTileOptions) {
    this._contentMapView._tileLayer.options.mapId = opts.mapboxTileOptions.mapId;
    this._contentMapView._tileLayer.redraw();
  }
};

/**
 * Destroy all child components.
 */
MapController.prototype.destroy = function() {
  Duplex.prototype.unpipe.call(this._collection, this._contentMapView);
  delegate.undelegateEvents(this.$antenna, this._uid);
  this._contentMapView && this._contentMapView.destroy();
  this._seenIds = [];
  this._collection = null;
  this._map = null;
};

/**
 * Re-layout the map to make sure it looks good in the current view.
 */
MapController.prototype.relayoutMap = function() {
  this._map.invalidateSize(false);
};

module.exports = MapController;
