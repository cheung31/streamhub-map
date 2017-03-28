'use strict';

var $ = require('jquery');
var AppBase = require('app-base');
var bind = require('mout/function/bind');
var events = require('./events');
var inherits = require('inherits');
var isArray = require('mout/lang/isArray');
var isBoolean = require('mout/lang/isBoolean');
var isNumber = require('mout/lang/isNumber');
var isObject = require('mout/lang/isObject');
var MapController = require('livefyre-map/map-controller');
var packageJson = require('json!../package.json');
var themableCss = require('text!livefyre-map/css/theme.css');
var util = require('./util');
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

  // Initialize the DOM for the app.
  this._initializeDOM(opts);

  // Configure the app.
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
MapComponent.prototype._eventPassthrough = function (evt, opt_data) {
  evt.stopPropagation();
  this.emit(evt.type, opt_data);
};

/**
 * Handle sizing of the map within the container.
 * @private
 */
MapComponent.prototype._handleSizing = function () {
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
  this.rootAppEl.height(this.opts.mapHeight || DEFAULT_HEIGHT);
  this.rootAppEl.width(this.opts.mapWidth || DEFAULT_WIDTH);
  this._controller.relayoutMap();
};

/**
 * Initialize the DOM by adding an element which will be decorated by the
 * content views. When destroyed, this element will be removed and will need
 * to be added again.
 * @param {Object} opts The app configuration options.
 * @private
 */
MapComponent.prototype._initializeDOM = function (opts) {
  if (this.el.childNodes.length > 0) {
    return;
  }

  opts.el = document.createElement('div');
  this.el.appendChild(opts.el);
  setTimeout($.proxy(this._handleSizing, this), 1000 / 60 * 4); // Wait equiv of 4 frames
};

/**
 * Poll the container element for it to resize, then resize the map relayout
 * the map afterwards.
 * @private
 */
MapComponent.prototype._pollForResize = function () {
  var self = this;
  this._resizePoll = setInterval(function () {
    var newHeight = self.containerEl.height();
    if (newHeight !== self.currentHeight) {
      self.currentHeight = newHeight;
      self._controller.relayoutMap();
    }
  }, 500);
};

/** @override */
MapComponent.prototype.configureInternal = function (opts) {
  var newCollection;
  var resetController = false;
  this.opts.$antenna = this.$antenna;

  this._configureMap(opts);

  if (isBoolean(opts.openModalOnClick)) {
    this.opts.modal = opts.openModalOnClick;
  }

  if (isBoolean(opts.allowPanning)) {
    this.opts.allowPanning = opts.allowPanning;
  }

  if ('collection' in opts) {
    newCollection = opts.collection;
    if (newCollection && !this._isSameCollection(newCollection)) {
      this._setCollection(newCollection);
      resetController = true;
    }
  }

  if (isBoolean(opts.allowClustering)) {
    this.opts.allowClustering = opts.allowClustering;
    resetController = true;
  }

  if (!this.opts.collection) {
    return;
  }

  var env = util.getEnvironment(this.opts.collection.environment);
  var mOpts = this.opts.mapboxTileOptions;
  if (!mOpts.accessToken) {
    mOpts.accessToken = util.getAccessToken(env);
  }
  mOpts.mapId = util.getMapId(env, mOpts.mapId);

  if (resetController || !this._controller) {
    this._controller && this._controller.destroy();
    this._initializeDOM(this.opts);
    this._controller = new MapController(this.opts);
  }

  this._controller.configureMap(this.opts);
};

/**
 * Configure mapbox and leaflet options.
 * @param {Object} opts
 * @private
 */
MapComponent.prototype._configureMap = function (opts) {
  var lOpts = this.opts.leafletMapOptions = this.opts.leafletMapOptions || {};
  var mOpts = this.opts.mapboxTileOptions = this.opts.mapboxTileOptions || {};

  if (opts.accessToken) {
    mOpts.accessToken = opts.accessToken;
  }

  if (opts.customMapTiles) {
    mOpts.mapId = opts.customMapTiles;
  }

  if (opts.mapId) {
    mOpts.mapId = opts.mapId;
  }

  if (isObject(opts.mapConfig)) {
    if (isNumber(opts.mapConfig.lat) && isNumber(opts.mapConfig.lng)) {
      opts.mapCenter = [opts.mapConfig.lat, opts.mapConfig.lng];
    }
    opts.mapZoom = opts.mapConfig.zoom;
  }

  if (isArray(opts.mapCenter)) {
    lOpts.center = opts.mapCenter;
  }

  if (isBoolean(opts.zoomControl)) {
    lOpts.zoomControl = opts.zoomControl;
  }

  lOpts.zoom = opts.mapZoom || lOpts.zoom || 1;
};

/** @override */
MapComponent.prototype.destroy = function () {
  AppBase.prototype.destroy.call(this);
  this.$antenna.off();
  clearInterval(this._resizePoll);
  this._resizePoll = null;
};

/**
 * Called when the app enters the view. This is called by app-embed.
 */
MapComponent.prototype.enteredView = function () {
  this._controller && this._controller.relayoutMap();
};

/** @override */
MapComponent.prototype.getAppName = function () {
  return 'maps-component';
};

/** @override */
MapComponent.prototype.getPackageJson = function () {
  return packageJson;
};

/** @override */
MapComponent.prototype.getPrefix = function () {
  return 'lf-maps-uuid';
};

/** @override */
MapComponent.prototype.getThemableCss = function () {
  return themableCss;
};

/** @override */
MapComponent.prototype.isViewRendered = function () {
  return !!this._controller;
};

/** @override */
MapComponent.prototype.unconfigureInternal = function () {
  AppBase.prototype.unconfigureInternal.call(this);
  this._controller && this._controller.destroy();
  this._controller = null;
};

module.exports = MapComponent;
