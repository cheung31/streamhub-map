define([
    'streamhub-map/leaflet'
], function (L) {
    'use strict';

    var MapCenterOffsetMixin = {
        setView: function (center, zoom, options) {
            options = options || {};
            zoom = zoom === undefined ? this.getZoom() : zoom;
            if (options.offset) {
                var size = this.getSize();
                var offsetX;
                var offsetY;

                var containerCenter = this.latLngToContainerPoint(center);
                var x = containerCenter.x;
                var y = containerCenter.y;

                if (options.offset[0]) {
                    var actualWidth = size.x - options.offset[0];
                    offsetX = containerCenter.x - actualWidth/2;
                    x = x + offsetX;
                }

                if (options.offset[1]) {
                    var actualHeight = size.y - options.offset[1];
                    offsetY = containerCenter.y - actualHeight/2;
                    y = y + offsetY;
                }

                center = this.containerPointToLatLng([x, y]);
            }
            this._resetView(L.latLng(center), this._limitZoom(zoom));
            return this;
        },

        setZoom: function (zoom, options) {
            if (options) {
                options.zoom = options;
            } else {
                options = {};
            }

            if (!this._loaded) {
                this._zoom = this._limitZoom(zoom);
                return this;
            }
            return this.setView(this.getCenter(), zoom, options);
        },

        zoomIn: function (delta, options) {
            options = options || {};
            options.offset = [-250, 0];
            return this.setZoom(this._zoom + (delta || 1), options);
        },

        zoomOut: function (delta, options) {
            options = options || {};
            options.offset = [500, 0];
            return this.setZoom(this._zoom - (delta || 1), options);
        }
    };
    L.MapCenterOffset = L.Map.extend(MapCenterOffsetMixin);

    return L;
});
