'use strict';

var $ = require('streamhub-sdk/jquery');
var bind = require('mout/function/bind');
var ContentListView = require('streamhub-sdk/content/views/content-list-view');
var ContentPoint = require('livefyre-map/content/content-point');
var events = require('livefyre-map/events');
var inherits = require('inherits');
var isBoolean = require('mout/lang/isBoolean');
var L = require('livefyre-map/leaflet/main');
var MapView = require('livefyre-map/views/map-view');
var markerBadgeTemplate = require('hgn!livefyre-map/views/templates/marker-badge');
var markerIconTemplate = require('hgn!livefyre-map/views/templates/marker-icon');
var markerTemplate = require('hgn!livefyre-map/views/templates/marker');
require('livefyre-map/leaflet/markercluster');

// Default values
var DEFAULT_ICON_ANCHOR = [22, 48];
var DEFAULT_ICON_SIZE = [54, 55];

/**
 * Content map view.
 * @constructor
 * @extends {MapView}
 * @param {Object} opts
 */
function ContentMapView(opts) {
  /**
   * Element that events will be bubbled to so that they can be handled.
   * @type {jQuery}
   */
  this.$antenna = opts.$antenna;

  /**
   * Mapping between content and markers on the map.
   * @type {Object}
   * @private
   */
  this._contentToMarkerMap = {};

  // The cluster function is determined by the config option.
  var clusterFn = isBoolean(opts.allowClustering) && !opts.allowClustering ?
    this._initializeFeatureGroup :
    this._initializeMarkerCluster;

  clusterFn.call(this);
  MapView.call(this, opts);
}
inherits(ContentMapView, MapView);

/**
 * Add a piece of content the map view as long as there is geocode data and it
 * hasn't already been added.
 * @param {Object} content - The content to be added.
 * @override
 */
ContentMapView.prototype.add = function (content) {
  if (!content.geocode || !content.geocode.latitude || !content.geocode.longitude) {
    return;
  }
  // This protects us against showing the same content multiple times. This can
  // happen when the content is in bootstrap init AND gets pulled in by the
  // geojson requests based on map location.
  if (content.id in this._contentToMarkerMap) {
    return;
  }
  MapView.prototype.add.call(this, new ContentPoint(content));
};

/**
 * Add the marker to the map.
 * @param {L.Marker} marker The marker to add to the map.
 * @override
 */
ContentMapView.prototype.addMarkerToMap = function (marker) {
  this._markers.addLayer(marker);
  this._map.addLayer(this._markers);
};

/**
 * Create a marker for a specific data point.
 * @param {ContentPoint} dataPoint The point to create.
 * @return {L.Marker} The marker based on the data point.
 * @override
 */
ContentMapView.prototype.createMarker = function (dataPoint) {
  var thumbnail_url;
  var contentItem = dataPoint.getContent();
  var hasAttachments = contentItem.attachments && contentItem.attachments.length;

  if (hasAttachments && contentItem.attachments[0].thumbnail_url) {
    thumbnail_url = contentItem.attachments[0].thumbnail_url;
  } else if (contentItem.author && contentItem.author.avatar) {
    thumbnail_url = contentItem.author.avatar;
  }

  var latlng = this._getLatLngFromPoint(dataPoint);
  return new L.Marker(latlng, {
    icon: new L.ContentDivIcon({
      className: 'hub-map-content-marker',
      html: markerTemplate({
        thumbnail_url: thumbnail_url || ''
      }),
      iconSize: DEFAULT_ICON_SIZE,
      iconAnchor: DEFAULT_ICON_ANCHOR,
      content: dataPoint.getContent()
    })
  });
};

/**
 * Open a modal to show all content for a specific data point.
 * @param {Array.<LivefyreContentView>} contentItems - The content items to show.
 * @private
 */
ContentMapView.prototype._displayDataPointDetails = function (contentItems) {
  var modalContentView;
  if (!this.modal || !contentItems || !contentItems.length) {
    return;
  }
  modalContentView = new ContentListView({modal: this.modal});

  this.$antenna.trigger(events.OPEN_MODAL);
  this.modal.show(modalContentView);

  for (var i=0; i < contentItems.length; i++) {
    modalContentView.more.write(contentItems[i]);
  }
};

/**
 * Draw the marker on the map.
 * @param {ContentPoint} dataPoint - The data point to draw on the map.
 * @return {L.Marker}
 * @override
 */
ContentMapView.prototype.drawMarker = function (dataPoint) {
  var marker = MapView.prototype.drawMarker.call(this, dataPoint);
  this._contentToMarkerMap[dataPoint.getContent().id] = marker;
  return marker;
};

/**
 * Get the map object.
 * @return {L.Map} The map object.
 */
ContentMapView.prototype.getMap = function () {
  return this._map;
};

/**
 * Initialize the feature group. This will not do any grouping, but supports
 * the same events that the cluster group does.
 * @private
 */
ContentMapView.prototype._initializeFeatureGroup = function () {
  this._markers = L.featureGroup();
};

/**
 * Initialize the marker cluster group. This is where all content goes once
 * added so that it can be grouped together.
 * @private
 */
ContentMapView.prototype._initializeMarkerCluster = function () {
  this._markers = new L.MarkerClusterGroup({
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    maxClusterRadius: 100,
    spiderfyOnMaxZoom: false,
    iconCreateFunction: function (cluster) {
      var $clusterIcon;
      var childMarker;
      var childMarkers = cluster.getAllChildMarkers();
      var clusterIconHtml;

      for (var i=0; i < childMarkers.length; i++) {
        childMarker = childMarkers[i];
        clusterIconHtml = childMarker._icon ?
          childMarker._icon.innerHTML :
          childMarker.options.icon.options.html;

        if (clusterIconHtml) {
          break;
        }
      }

      $clusterIcon = $(clusterIconHtml);
      $clusterIcon.append(markerBadgeTemplate({markers: childMarkers.length}));
      return new L.ContentDivIcon({
        className: 'hub-map-collection-marker',
        html: markerIconTemplate({clusterIcon: $clusterIcon.html()}),
        iconSize: DEFAULT_ICON_SIZE,
        iconAnchor: DEFAULT_ICON_ANCHOR
      });
    }
  });
};

/**
 * Handle the `clusterclick` event. Supports the following scenarios:
 * 1. Cluster is clicked but is not zoomed in all the way
 *    The content of all markers will be displayed if the cluster does not have
 *    any children clusters.
 * 2. Cluster is clicked and is zoomed in all the way
 *    The content of all markers is displayed.
 * @param {Event} evt - Event.
 * @private
 */
ContentMapView.prototype._onClusterClick = function (evt) {
  var content = [];
  var cluster = evt.layer;
  var bottomCluster = cluster;
  var markers = [];
  var maxZoom = this._map.getMaxZoom();
  var skipZoomCheck = false;

  this.$antenna.trigger(events.CLUSTER_CLICK);

  while (bottomCluster._childClusters.length === 1) {
    bottomCluster = bottomCluster._childClusters[0];
  }

  // If the clicked cluster is at its final zoom depth, meaning zooming any
  // further will not reveal any additional clusters, it should show the
  // contents in a modal at this point.
  if (bottomCluster._zoom === maxZoom && bottomCluster._childCount === cluster._childCount) {
    markers = bottomCluster._markers;
    skipZoomCheck = true;
  }

  // If the max zoom has not been reached, don't do anything since it will
  // automatically zoom in further.
  if (!skipZoomCheck && maxZoom !== this._map.getZoom()) {
    return;
  }

  // If the markers variable wasn't assigned above, attempt to set it now.
  if (!markers && evt.layers) {
    markers = evt.layers._markers;
  }

  // Build up the content array of items to show in the modal.
  for (var i=0; i < markers.length; i++) {
    content.push(markers[i].options.icon.options.content);
  }
  this.$el.trigger('focusDataPoint.hub', {contentItems: content});
};

/**
 * Handle the `focusDataPoint.hub` event and display the `focusContext` content
 * in a modal.
 * @param {Event} evt - Event.
 * @param {Object} focusContext - Focused context to aid with displaying content.
 * @private
 */
ContentMapView.prototype._onFocusDataPointHub = function (evt, focusContext) {
  this._displayDataPointDetails(focusContext.contentItems);
};

/**
 * Handle the marker click event. Focus on a piece of content by triggering
 * the appropriate event.
 * @param {Event} evt - Event.
 * @private
 */
ContentMapView.prototype._onMarkerClick = function (evt) {
  var content = evt.layer.options.icon.options.content;
  this.$antenna.trigger(events.MARKER_CLICK);
  this.$el.trigger('focusDataPoint.hub', {contentItems: [content]});
};

/**
 * Remove a data point from the map.
 * @param {ContentPoint} dataPoint The data point to remove.
 */
ContentMapView.prototype.removeDataPoint = function (dataPoint) {
  this._markers.removeLayer(this._contentToMarkerMap[dataPoint.getContent().id]);
  MapView.prototype.removeDataPoint.call(this, dataPoint);
};

/**
 * Set the element that the map view will use.
 * @param {Element} el The element to set.
 */
ContentMapView.prototype.setElement = function (el) {
  MapView.prototype.setElement.apply(this, arguments);
  this.$el.on('focusDataPoint.hub', bind(this._onFocusDataPointHub, this));
  this._markers.on('click', bind(this._onMarkerClick, this));
  this._markers.on('clusterclick', bind(this._onClusterClick, this));
};

module.exports = ContentMapView;
