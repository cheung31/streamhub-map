'use strict';

var LivefyreHttpClient = require('streamhub-sdk/collection/clients/http-client');
var merge = require('mout/object/merge');
var toLookup = require('mout/array/toLookup');
require('leaflet-tilelayer-geojson');

/**
 * Extension of the GeoJSON TileLayer found here:
 * https://github.com/glenrobertson/leaflet-tilelayer-geojson
 *
 * Main purpose is to add paging (show more) functionality to the geo layer.
 */
module.exports = L.TileLayer.GeoJSON.extend({
  /**
   * Authors lookup object.
   * @type {Object}
   * @private
   */
  _authors: {},

  /**
   * Show more content for the provided tilePoint and paging object.
   * @param {Object} paging
   * @param {TilePoint} tilePoint
   * @private
   */
  _handleShowMore: function (paging, tilePoint) {
    // TODO: Trigger a new fetch
    // TODO: Make sure the paging params are on the request
  },

  /**
   * Load the contents of a tile.
   * @param {Tile} tile
   * @param {TilePoint} tilePoint
   * @private
   */
  _loadTile: function (tile, tilePoint) {
    var self = this;
    this._adjustTilePoint(tilePoint);
    this._client._request({ url: this.getTileUrl(tilePoint) }, function(err, data) {
      if (err) {
        return;
      }
      tile.datum = data;
      self._tileLoaded(tile, tilePoint);
    });
  },

  /**
   * Handle the paging object added onto the response. This will allow us to
   * fetch more content from this tilePoint.
   * @param {Object} paging
   * @param {TilePoint} tilePoint
   * @private
   */
  _processPaging: function(paging, tilePoint) {
    var self = this;

    // If there is no paging object, there aren't any more results, or
    // there is no `showPageIcon` function, there is nothing else to do.
    if (!paging || !paging.hasPrev) {
      this._removeShowMore();
      return;
    }

    if (!this._showMoreEl) {

      // TODO: Create button
    }

    this._showMoreEl.show().click(function() {
      self._handleShowMore(paging, tilePoint);
    });
  },

  /**
   * Remove the "show more" button and the event listener.
   * @private
   */
  _removeShowMore: function() {
    if (!this._showMoreEl) {
      return;
    }
    this._showMoreEl.hide();
    this._showMoreEl.off('click');
  },

  /** @override */
  _tileLoaded: function(tile, tilePoint) {
    L.TileLayer.Ajax.prototype._tileLoaded.apply(this, arguments);
    if (tile.datum === null) { return null; }

    // Need to store the authors so that they can be used for lookups when
    // adding individual tile data. This is one master lookup object that gets
    // updated whenever new authors are added.
    if (tile.datum.authors) {
      this._authors = merge(this._authors, toLookup(tile.datum.authors, function(author) {
        return author.id;
      }));
    }
    this.addTileData(tile.datum, tilePoint);
  },

  /** @override */
  addTileData: function(geojson, tilePoint) {
    if (geojson.type === 'Feature') {
      geojson.properties.content.author = this._authors[geojson.properties.content.authorId];
    }
    L.TileLayer.GeoJSON.prototype.addTileData.call(this, geojson, tilePoint);

    // TODO: When return to paging, uncomment!
    // this._processPaging(geojson.paging, tilePoint);
  },

  /** @override */
  getTileUrl: function(tilePoint) {
    var tileUrl = L.TileLayer.GeoJSON.prototype.getTileUrl.call(this, tilePoint);
    // TODO: Add paging params to the URL
    return tileUrl;
  },

  /** @override */
  initialize: function(url, options, geojsonOptions) {
    L.TileLayer.GeoJSON.prototype.initialize.apply(this, arguments);
    this._client = new LivefyreHttpClient({ serviceName: 'bootstrap' });
  }

});
