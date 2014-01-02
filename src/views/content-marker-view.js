define([
    'streamhub-map/point',
    'streamhub-map/views/marker-view',
    'text!streamhub-map/views/svg/content-marker.svg',
    'inherits',
    'streamhub-sdk/jquery'
],
function (Point, MarkerView, ContentMarkerSvg, inherits, $) {

    var MARKER_SVG = null;

    var ContentMarkerView = function (point, opts) {
        opts = opts || {};

        if (!MARKER_SVG) {
            MARKER_SVG = $('body').append($(ContentMarkerSvg));
        }

        this._fillColor = opts.fill;
        this._avatar = opts.avatar;
        this._point = point;
        this._notifyStream = opts.notifyStream;
        var self = this;
        if (this._notifyStream) {
            this._notifyStream.on('data', function () {
                self.notify();
            });
        }

        MarkerView.apply(this, arguments);
    };
    inherits(ContentMarkerView, MarkerView);


    ContentMarkerView.prototype.render = function () {
        // Marker
        var self = this;
        this.el = this._svg.append('g')
           .datum({ type: 'Point', 'coordinates': this._point.getCoordinates() })
           .attr('class', 'hub-map-content-marker')
           .attr("transform", function (d) {
               //TODO(ryanc): Remove magic number 44
               var translation = self._projection(d.coordinates);
               translation[0] = translation[0] - 44/2;
               translation[1] = translation[1] - 44;
               return "translate(" + translation + ")";
           });
        this.el.append('use').attr('xlink:href', '#hub-map-content-marker');

        // Update marker image
        //TODO(ryanc): Remove magic number 36
        var markerImage = this._getMarkerImageFromContent();
        if (markerImage) {
            var img = this.el.append('image')
                .attr('xlink:href', markerImage)
                .attr('width', '36')
                .attr('height', '36')
                .attr('transform', 'translate(4,4)');
            img[0][0].addEventListener('error', function (e) {
                $(self._svg[0][0]).trigger('contentMarkerImageError.hub', self._point);
            });
        }

        this.notify();

        var self = this;
        this.el.on('click', function (datum, index) {
            self.notify();
            $(self.el[0][0]).trigger('focusDataPoint.hub', { data: self._point.getContent() });
        });

        MarkerView.prototype.render.call(this);
    };

    ContentMarkerView.prototype._getMarkerImageFromContent = function () {
        var imageUrl;

        var content = this._point.getContent();
        if (content.attachments && content.attachments[0]) {
            imageUrl = content.attachments[0].thumbnail_url;
        } else if (content.author && content.author.avatar) {
            imageUrl = content.author.avatar;
        }

        return imageUrl;
    };

    ContentMarkerView.prototype.notify = function () {
        return;
    };

    return ContentMarkerView;
}); 
