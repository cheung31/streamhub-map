'use strict';

var $ = require('streamhub-sdk/jquery');
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
var defaultIconAnchor = [22, 48];
var defaultIconSize = [54, 55];

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
  var clusterFn = isBoolean(opts.allowClustering) && !opts.allowClustering
    ? this._initializeFeatureGroup
    : this._initializeMarkerCluster;

  clusterFn.call(this);
  MapView.call(this, opts);
}
inherits(ContentMapView, MapView);

/**
 * Open a modal to show all content for a specific data point.
 * @param {Array.<>} contentItems The content items to show.
 * @private
 */
ContentMapView.prototype._displayDataPointDetails = function (contentItems) {
  var modalContentView;
  if (!this.modal || !contentItems || !contentItems.length) {
    return;
  }
  modalContentView = new ContentListView();
  for (var i=0; i < contentItems.length; i++) {
    modalContentView.more.write(contentItems[i]);
  }
  this.$antenna.trigger(events.OPEN_MODAL);
  this.modal.show(modalContentView);
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
        clusterIconHtml = childMarker._icon
          ? childMarker._icon.innerHTML
          : childMarker.options.icon.options.html;
        if (clusterIconHtml) {
          break;
        }
      }

      $clusterIcon = $(clusterIconHtml);
      $clusterIcon.append(markerBadgeTemplate({markers: childMarkers.length}));
      return new L.ContentDivIcon({
        className: 'hub-map-collection-marker',
        html: markerIconTemplate({clusterIcon: $clusterIcon.html()}),
        iconSize: defaultIconSize,
        iconAnchor: defaultIconAnchor
      });
    }
  });
};

/**
 * Add a piece of content the map view.
 * @param {Object} content The content to be added.
 * @override
 */
ContentMapView.prototype.add = function (content) {
  if (!content.geocode || !content.geocode.latitude || !content.geocode.longitude) {
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
  return new L.Marker(
    latlng, {
      icon: new L.ContentDivIcon({
        className: 'hub-map-content-marker',
        html: markerTemplate({
          thumbnail_url: thumbnail_url || ''
        }),
        iconSize: defaultIconSize,
        iconAnchor: defaultIconAnchor,
        content: dataPoint.getContent()
      })
    }
  );
};

/**
 * Draw the marker on the map.
 * @param {ContentPoint} dataPoint The data point to draw on the map.
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

  var self = this;

  // Listen for events when the user focuses on a datapoint
  this.$el.on('focusDataPoint.hub', function (e, focusContext) {
    self._displayDataPointDetails(focusContext.contentItems);
  });

  // Listen for the click event on markers
  this._markers.on('click', function (e) {
    var content = e.layer.options.icon.options.content;
    self.$antenna.trigger(events.MARKER_CLICK);
    self.$el.trigger('focusDataPoint.hub', {contentItems: [content]});
  });

  // Listen for the click event on marker clusters
  this._markers.on('clusterclick', function (e) {
    var content = [];
    self.$antenna.trigger(events.CLUSTER_CLICK);
    if (self._map.getMaxZoom() !== self._map.getZoom()) {
      return;
    }
    for (var i=0; i < e.layer._markers.length; i++) {
      content.push(e.layer._markers[i].options.icon.options.content);
    }
    self.$el.trigger('focusDataPoint.hub', {contentItems: content});
  });
};

module.exports = ContentMapView;
