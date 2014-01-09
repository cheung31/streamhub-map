define([
    'streamhub-sdk/jquery',
    'leaflet',
    'text!leaflet/leaflet.css'
], function ($, L, LeafletCss) {
    'use strict';

    var LEAFLET_STYLE;

    // Inject leaflet CSS
    if (!LEAFLET_STYLE) {
        var styleEl = document.createElement('style');
        styleEl.innerHTML = LeafletCss;
        document.getElementsByTagName('head')[0].appendChild(styleEl)
    };

    /* Experimental vector tile layer for Leaflet
     * Uses D3 to render TopoJSON. Derived from a GeoJSON thing that was
     * Originally by Ziggy Jonsson: http://bl.ocks.org/ZJONSSON/5602552
     * Reworked by Nelson Minar: http://bl.ocks.org/NelsonMinar/5624141
     */
    L.TileLayer.D3TopoJSON = L.TileLayer.extend({
        onAdd: function(map) {
            L.TileLayer.prototype.onAdd.call(this,map);
            this._path = d3.geo.path().projection(function(d) {
                var point = map.latLngToLayerPoint(new L.LatLng(d[1],d[0]));
                return [point.x,point.y];
            });
            this.on("tileunload",function(d) {
                if (d.tile.xhr) d.tile.xhr.abort();
                if (d.tile.nodes) d.tile.nodes.remove();
                d.tile.nodes = null;
                d.tile.xhr = null;
            });
        },
        _loadTile: function(tile,tilePoint) {
            var self = this;
            this._adjustTilePoint(tilePoint);

            if (!tile.nodes && !tile.xhr) {
                tile.xhr = d3.json(this.getTileUrl(tilePoint),function(error, tjData) {
                    if (error) {
                        console.log(error);
                        return;
                    }

                    var geoJson = topojson.feature(tjData, tjData.objects['vectile']);
                    tile.xhr = null;
                    tile.nodes = d3.select(self._map._container).select("svg").append("g");
                    tile.nodes.selectAll("path")
                        .data(geoJson.features).enter()
                      .append("path")
                        .attr("d", self._path)
                        .attr("class", self.options.class)
                        .attr("style", self.options.style);
                });
            }
        }
    });

    /**
     * Experimental canvas tile layer for Leaflet
     * Originally by Diego Guidi: https://gist.github.com/DGuidi/1716010#file-tilelayer-tilejson-js
     */
    L.TileLayer.CanvasTopoJSON = L.TileLayer.Canvas.extend({
        options: {
            debug: false
        },

        tileSize: 256,

        initialize: function (baseUrl, options) {
            L.Util.setOptions(this, options);

            this._url = baseUrl;

            this.drawTile = function (canvas, tilePoint, zoom) {
                var ctx = {
                    canvas: canvas,
                    tile: tilePoint,
                    zoom: zoom
                };

                if (this.options.debug) {
                    this._drawDebugInfo(ctx);
                }
                this._draw(ctx);
            };
        },

        _drawDebugInfo: function (ctx) {
            var max = this.tileSize;
            var g = ctx.canvas.getContext('2d');
            g.strokeStyle = '#000000';
            g.fillStyle = '#FFFF00';
            g.strokeRect(0, 0, max, max);
            g.font = "12px Arial";
            g.fillRect(0, 0, 5, 5);
            g.fillRect(0, max - 5, 5, 5);
            g.fillRect(max - 5, 0, 5, 5);
            g.fillRect(max - 5, max - 5, 5, 5);
            g.fillRect(max / 2 - 5, max / 2 - 5, 10, 10);
            g.strokeText(ctx.tile.x + ' ' + ctx.tile.y + ' ' + ctx.zoom, max / 2 - 30, max / 2 - 10);
        },

        _tilePoint: function (ctx, coords) {
            // start coords to tile 'space'
            var s = ctx.tile.multiplyBy(this.tileSize);

            // actual coords to tile 'space'
            var p = this._map.project(new L.LatLng(coords[1], coords[0]));

            // point to draw        
            var x = Math.round(p.x - s.x);
            var y = Math.round(p.y - s.y);
            return {
                x: x,
                y: y
            };
        },

        _clip: function (ctx, points) {
            var nw = ctx.tile.multiplyBy(this.tileSize);
            var se = nw.add(new L.Point(this.tileSize, this.tileSize));
            var bounds = new L.Bounds([nw, se]);
            var len = points.length;
            var out = [];

            for (var i = 0; i < len - 1; i++) {
                var seg = L.LineUtil.clipSegment(points[i], points[i + 1], bounds, i);
                if (!seg) {
                    continue;
                }
                out.push(seg[0]);
                // if segment goes out of screen, or it's the last one, it's the end of the line part
                if ((seg[1] !== points[i + 1]) || (i === len - 2)) {
                    out.push(seg[1]);
                }
            }
            return out;
        },

        _isActuallyVisible: function (coords) {
            var coord = coords[0];
            var min = [coord.x, coord.y], max = [coord.x, coord.y];
            for (var i = 1; i < coords.length; i++) {
                coord = coords[i];
                min[0] = Math.min(min[0], coord.x);
                min[1] = Math.min(min[1], coord.y);
                max[0] = Math.max(max[0], coord.x);
                max[1] = Math.max(max[1], coord.y);
            }
            var diff0 = max[0] - min[0];
            var diff1 = max[1] - min[1];
            if (this.options.debug) {
                console.log(diff0 + ' ' + diff1);
            }
            var visible = diff0 > 1 || diff1 > 1;
            return visible;
        },

        _drawPoint: function (ctx, geom, style) {
            if (!style) {
                return;
            }
            
            var p = this._tilePoint(ctx, geom);
            var c = ctx.canvas;
            var g = c.getContext('2d');
            g.beginPath();
            g.fillStyle = style.fill;
            g.arc(p.x, p.y, style.radius, 0, Math.PI * 2);
            g.closePath();
            g.fill();
            g.restore();
        },

        _drawLineString: function (ctx, geom, style) {
            if (!style) {
                return;
            }
            
            var coords = geom, proj = [], i;
            coords = this._clip(ctx, coords);
            for (i = 0; i < coords.length; i++) {
                proj.push(this._tilePoint(ctx, coords[i]));
            }
            if (!this._isActuallyVisible(proj)) {
                return;
            }

            var g = ctx.canvas.getContext('2d');
            g.strokeStyle = style.stroke;
            g.lineWidth = parseInt(style.strokeWidth, 10);
            g.beginPath();
            for (i = 0; i < proj.length; i++) {
                var method = (i === 0 ? 'move' : 'line') + 'To';
                g[method](proj[i].x, proj[i].y);
            }
            g.stroke();
            g.restore();
        },

        _drawPolygon: function (ctx, geom, style) {
            if (!style) {
                return;
            }
            
            for (var el = 0; el < geom.length; el++) {
                var coords = geom[el], proj = [], i;
                coords = this._clip(ctx, coords);
                for (i = 0; i < coords.length; i++) {
                    proj.push(this._tilePoint(ctx, coords[i]));
                }
                if (!this._isActuallyVisible(proj)) {
                    continue;
                }

                var g = ctx.canvas.getContext('2d');
                var outline = style.stroke;
                g.fillStyle = style.fill;
                if (outline) {
                    g.strokeStyle = outline.color;
                    g.lineWidth = outline.size;
                }
                g.beginPath();
                for (i = 0; i < proj.length; i++) {
                    var method = (i === 0 ? 'move' : 'line') + 'To';
                    g[method](proj[i].x, proj[i].y);
                }
                g.closePath();
                g.fill();
                if (outline) {
                    g.stroke();
                }
            }
        },

        _draw: function (ctx) {
            // NOTE: this is the only part of the code that depends from external libraries (actually, jQuery only).        
            var loader = $.getJSON;

            var nwPoint = ctx.tile.multiplyBy(this.tileSize);
            var sePoint = nwPoint.add(new L.Point(this.tileSize, this.tileSize));

            // optionally, enlarge request area.
            // with this I can draw points with coords outside this tile area,
            // but with part of the graphics actually inside this tile.
            // NOTE: that you should use this option only if you're actually drawing points!
            var buf = this.options.buffer;
            if (buf > 0) {
                var diff = new L.Point(buf, buf);
                nwPoint = nwPoint.subtract(diff);
                sePoint = sePoint.add(diff);
            }

            var nwCoord = this._map.unproject(nwPoint, ctx.zoom, true);
            var seCoord = this._map.unproject(sePoint, ctx.zoom, true);
            var bounds = [nwCoord.lng, seCoord.lat, seCoord.lng, nwCoord.lat];

            var url = this.createUrl(ctx.tile);
            var self = this, j;
            loader(url, function (tjData) {
                var data = topojson.feature(tjData, tjData.objects['vectile']);
                for (var i = 0; i < data.features.length; i++) {
                    var feature = data.features[i];
                    var style = self.styleFor(feature);

                    var type = feature.geometry.type;
                    var geom = feature.geometry.coordinates;
                    var len = geom.length;
                    switch (type) {
                        case 'Point':
                            self._drawPoint(ctx, geom, style);
                            break;

                        case 'MultiPoint':
                            for (j = 0; j < len; j++) {
                                self._drawPoint(ctx, geom[j], style);
                            }
                            break;

                        case 'LineString':
                            self._drawLineString(ctx, geom, style);
                            break;

                        case 'MultiLineString':
                            for (j = 0; j < len; j++) {
                                self._drawLineString(ctx, geom[j], style);
                            }
                            break;

                        case 'Polygon':
                            self._drawPolygon(ctx, geom, style);
                            break;

                        case 'MultiPolygon':
                            for (j = 0; j < len; j++) {
                                self._drawPolygon(ctx, geom[j], style);
                            }
                            break;

                        default:
                            throw new Error('Unmanaged type: ' + type);
                    }
                }
            });
        },

        // NOTE: a placeholder for a function that, given a tile context, returns a string to a GeoJSON service that retrieve features for that context
        createUrl: function (coords) {
            return L.Util.template(this._url, L.extend({
                    r: this.options.detectRetina && L.Browser.retina && this.options.maxZoom > 0 ? '@2x' : '',
                    s: this._getSubdomain(coords),
                    x: coords.x,
                    y: this.options.tms ? this._tileNumBounds.max.y - coords.y : coords.y,
                    z: this._getZoomForUrl()
            }, this.options));
        },

        // NOTE: a placeholder for a function that, given a feature, returns a style object used to render the feature itself
        styleFor: function (feature) {
            var styles;
            if (! feature.properties.kind) {
                styles = this.options.style;
            }
            styles = this.options.style[feature.properties.kind];
            if (! styles) {
                return;
            }

            styles = $.extend({}, styles);
            if (styles.maxZoom && this._map.getZoom() <= styles.maxZoom) {
                styles.fill = 'rgba(0,0,0,0)';
                styles.stroke = 'rgba(0,0,0,0)';
            }

            return styles;
        }
    });


    return L;
});
