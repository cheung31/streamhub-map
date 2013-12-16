define([
    'streamhub-map/point',
    'streamhub-map/views/marker-view',
    'text!streamhub-map/views/svg/cluster-marker.svg',
    'inherits',
    'streamhub-sdk/jquery'
],
function (Point, MarkerView, ClusterMarkerSvg, inherits, $) {

    var MARKER_SVG = null;

    var ClusteredContentMarkerView = function (cluster, opts) {
        opts = opts || {};

        if (!MARKER_SVG) {
            MARKER_SVG = $('body').append($(ClusterMarkerSvg));
        }

        this._fillColor = opts.fill;
        this._avatar = opts.avatar;
        this._cluster = cluster;
        this._point = cluster[0];
        this._notifyStream = opts.notifyStream;
        var self = this;
        if (this._notifyStream) {
            this._notifyStream.on('data', function () {
                self.notify();
            });
        }

        MarkerView.call(this, this._point, opts);
    };
    inherits(ClusteredContentMarkerView, MarkerView);

    ClusteredContentMarkerView.prototype.render = function () {
        //this.notifierEl = this._svg.append("path")
        //    .datum({ type: 'Point', 'coordinates': this._point.getCoordinates() })
        //    .attr("d", this._path)
        //    .attr("class", "hub-place-notifier")
        //    .attr('fill', 'red');

        // Marker
        var self = this;
        this.el = this._svg.append('g')
           .datum({ type: 'Point', 'coordinates': this._point.getCoordinates() })
           .attr('class', 'hub-map-content-marker')
           .attr("transform", function (d) {
               //TODO(ryanc): Remove magic number 44
               var translation = self._projection(d.coordinates);
               translation[0] = translation[0] - 55/2;
               translation[1] = translation[1] - 55/2;
               return "translate(" + translation + ")";
           });
        this.el.append('use').attr('xlink:href', '#hub-map-clustered-content-marker');

        // Update marker image
        //TODO(ryanc): Remove magic number 36
        var markerImage = this._getMarkerImageFromContent();
        if (markerImage) {
            this.el.append('image')
                .attr('xlink:href', markerImage)
                .attr('width', '36')
                .attr('height', '36')
                .attr('transform', 'translate(9,10)');
            this.el.append('use').attr('xlink:href', '#hub-map-clustered-content-marker-badge');
        }

        // Add badge count
        this.el.append('text')
            .text(this._cluster.length)
            .attr('stroke', 'white')
            .attr('font-size', '12')
            .attr('font-family', 'Helvetica')
            .attr('transform', 'translate(38,12)');

        this.notify();

        var self = this;
        this.el.on('click', function (datum, index) {
            self.notify();
            $(self.el[0][0]).trigger('focusDataPoint.hub', self._point);
        });

        MarkerView.prototype.render.call(this);
    };

    ClusteredContentMarkerView.prototype._getMarkerImageFromContent = function () {
        var imageUrl;

        if (this._point._content.attachments) {
            imageUrl = this._point._content.attachments[0].thumbnail_url;
        } else {
            imageUrl = this._point._content.author.avatar;
        }

        return imageUrl;
    };

    ClusteredContentMarkerView.prototype.notify = function () {
        return;
    };

    return ClusteredContentMarkerView;
}); 
