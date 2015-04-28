'use strict';

var $ = require('jquery');
var AppBase = require('app-base');
var bind = require('mout/function/bind');
var events = require('./events');
var inherits = require('inherits');
var isArray = require('mout/lang/isArray');
var isBoolean = require('mout/lang/isBoolean');
var isObject = require('mout/lang/isObject');
var MapController = require('livefyre-map/map-controller');
var merge = require('mout/object/merge');
var packageJson = require('json!../package.json');
var themableCss = require('text!livefyre-map/css/theme.css');
var values = require('mout/object/values');

/**
 * Map component.
 * @constructor
 * @extends {AppBase}
 * @param {Object} opts
 */
function MapComponent(opts) {
  AppBase.call(this, opts);

  // If there is no collection or the articleId is not set, don't load the app.
  if (!opts.collection || !opts.collection.articleId) {
    return;
  }

  this._initializeDOM(opts);

  /**
   * Set up the antenna that we will be listening on.
   * @type {jQuery.Element}
   */
  this.$antenna = opts.$antenna = $(this.el);

  // Listen to all DOM events and emit them.
  this.$antenna.on(values(events).join(' '), bind(this._eventPassthrough, this));

  /**
   * Apply the theme to the app.
   */
  this.configure(opts);
}
inherits(MapComponent, AppBase);

/**
 * Passes through DOM events to the EventEmitter emit flow.
 * @param {Event} evt The DOM event to pass through.
 * @param {Object=} opt_data Optional data object.
 * @private
 */
MapComponent.prototype._eventPassthrough = function(evt, opt_data) {
  evt.stopPropagation();
  this.emit(evt.type, opt_data);
};

/**
 * Initialize the DOM by adding an element which will be decorated by the
 * content views. When destroyed, this element will be removed and will need
 * to be added again.
 * @param {Object} opts The app configuration options.
 * @private
 */
MapComponent.prototype._initializeDOM = function(opts) {
  if (this.el.childNodes.length > 0) {
    return;
  }
  opts.el = document.createElement('div');
  this.el.appendChild(opts.el);
};

/** @override */
MapComponent.prototype.configureInternal = function(opts) {
  this._opts = merge(this._opts, opts);

  var resetController = false;

  this._opts.leafletMapOptions = this._opts.leafletMapOptions || {};
  this._opts.mapboxTileOptions = this._opts.mapboxTileOptions || {
    mapId: 'livefyre.hknm2g26'
  };

  if (opts.customMapTiles) {
    this._opts.mapboxTileOptions = { mapId: opts.customMapTiles };
  }

  if (opts.accessToken) {
    this._opts.mapboxTileOptions.accessToken = opts.accessToken;
  }

  if (isObject(opts.mapConfig)) {
    opts.mapCenter = [opts.mapConfig.lat, opts.mapConfig.lng];
    opts.mapZoom = opts.mapConfig.zoom;
  }

  if (isArray(opts.mapCenter)) {
    this._opts.leafletMapOptions.center = opts.mapCenter;
  }

  if (isBoolean(opts.openModalOnClick)) {
    this._opts.modal = opts.openModalOnClick;
  }

  if (opts.mapZoom) {
    this._opts.leafletMapOptions.zoom = opts.mapZoom;
  }

  if (isBoolean(opts.zoomControl)) {
    this._opts.leafletMapOptions.zoomControl = opts.zoomControl;
  }

  this._opts.allowPanning = isBoolean(opts.allowPanning)
    ? opts.allowPanning
    : true;

  if (opts.collection) {
    this._opts.collection = opts.collection;
    resetController = true;
  }

  if (isBoolean(opts.allowClustering)) {
    this._opts.allowClustering = opts.allowClustering;
    resetController = true;
  } else {
    this._opts.allowClustering = true;
  }

  if (resetController || !this._controller) {
    this._controller && this._controller.destroy();
    this._initializeDOM(this._opts);
    this._controller = new MapController(this._opts);
  } else {
    this._controller.configureMap(this._opts);
  }
  this.applyTheme(this._opts);
};

/** @override */
MapComponent.prototype.destroy = function() {
  AppBase.prototype.destroy.call(this);
  this.$antenna.off();
};

/**
 * Called when the app enters the view. This is called by app-embed.
 */
MapComponent.prototype.enteredView = function() {
  this._controller && this._controller.relayoutMap();
};

/** @override */
MapComponent.prototype.getPackageJson = function() {
  return packageJson;
};

/** @override */
MapComponent.prototype.getPrefix = function() {
  return 'lf-maps-uuid';
};

/** @override */
MapComponent.prototype.getThemableCss = function() {
  return themableCss;
};

/** @override */
MapComponent.prototype.unconfigureInternal = function() {
  this._controller && this._controller.destroy();
  this._controller = null;
};

module.exports = MapComponent;
