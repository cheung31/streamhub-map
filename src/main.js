'use strict';

var $ = require('jquery');
var AppBase = require('app-base');
var bind = require('mout/function/bind');
var Collection = require('streamhub-sdk/collection');
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

  /**
   * Set up the antenna that we will be listening on.
   * @type {jQuery.Element}
   */
  this.$antenna = opts.$antenna = $(this.el);

  // Listen to all DOM events and emit them.
  this.$antenna.on(values(events).join(' '), bind(this._eventPassthrough, this));

  // If there is no collection or the articleId is not set, don't load the app.
  if (!opts.collection || !opts.collection.articleId) {
    return;
  }

  this._initializeDOM(opts);

  /**
   * Apply the theme to the app.
   */
  this.configure(opts);
}
inherits(MapComponent, AppBase);

/**
 * Default height of the map.
 * @const {number}
 */
var DEFAULT_HEIGHT = 400;

/**
 * Default width of the map.
 * @const {number}
 */
var DEFAULT_WIDTH = 600;

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
 * Handle sizing of the map within the container.
 * @private
 */
MapComponent.prototype._handleSizing = function() {
  var rootAppEl = $(this.el).parents('.lf-app-embed');
  if (!rootAppEl.length) {
    rootAppEl = $(this.el);
  }
  this.rootAppEl = $(rootAppEl);
  this.containerEl = this.rootAppEl.parent();

  // There is a height on the container, so resize the map to fit and poll for
  // changes to the size of the container.
  if (this.rootAppEl.height()) {
    this._controller.relayoutMap();
    this._pollForResize();
    return;
  }

  // There is no height on the container. Use the height and width provided by
  // designer or use the default height and width.
  this.rootAppEl.height(this._opts.mapHeight || DEFAULT_HEIGHT);
  this.rootAppEl.width(this._opts.mapWidth || DEFAULT_WIDTH);
  this._controller.relayoutMap();
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
  setTimeout($.proxy(this._handleSizing, this), 10);
};

/**
 * Poll the container element for it to resize, then resize the map relayout
 * the map afterwards.
 * @private
 */
MapComponent.prototype._pollForResize = function() {
  var self = this;
  this._resizePoll = setInterval(function() {
    var newHeight = self.containerEl.height();
    if (newHeight !== self.currentHeight) {
      self.currentHeight = newHeight;
      self._controller.relayoutMap();
    }
  }, 500);
};

/** @override */
MapComponent.prototype.configureInternal = function(opts) {
  this._opts = merge(this._opts, opts, {
    prefix: this.getPrefix(),
    uuid: this._uuid
  });
  this._opts.$antenna = this.$antenna;

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
    opts.mapZoom = opts.mapConfig.zoom || 1;
  }

  if (isArray(opts.mapCenter)) {
    this._opts.leafletMapOptions.center = opts.mapCenter;
  }

  if (isBoolean(opts.openModalOnClick)) {
    this._opts.modal = opts.openModalOnClick;
  }

  if (opts.mapZoom) {
    this._opts.leafletMapOptions.zoom = opts.mapZoom || 1;
  }

  if (isBoolean(opts.zoomControl)) {
    this._opts.leafletMapOptions.zoomControl = opts.zoomControl;
  }

  if (isBoolean(opts.allowPanning)) {
    this._opts.allowPanning = opts.allowPanning;
  }

  if (opts.collection) {
    this._opts.collection = opts.collection;
    resetController = true;
  }

  if (isBoolean(opts.allowClustering)) {
    this._opts.allowClustering = opts.allowClustering;
    resetController = true;
  }

  if (!this._opts.collection) {
    return;
  }

  if (resetController || !this._controller) {
    this._controller && this._controller.destroy();
    this._initializeDOM(this._opts);
    this._controller = new MapController(this._opts);
  }

  this._controller.configureMap(this._opts);
  this.applyTheme(this._opts);
};

/** @override */
MapComponent.prototype.destroy = function() {
  AppBase.prototype.destroy.call(this);
  this.$antenna.off();
  this._resizePoll && clearInterval(this._resizePoll);
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
