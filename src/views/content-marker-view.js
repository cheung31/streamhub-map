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

        this._fillColor = opts.fill;
        this._avatar = opts.avatar;

        if (!MARKER_SVG) {
            MARKER_SVG = $('body').append($(ContentMarkerSvg));
        }

        MarkerView.apply(this, arguments);
    };
    inherits(ContentMarkerView, MarkerView);

    ContentMarkerView.prototype.render = function () {
        //this.notifierEl = this._svg.append("path")
        //    .datum({ type: 'Point', 'coordinates': this._point.getCoordinates() })
        //    .attr("d", this._path)
        //    .attr("class", "hub-place-notifier")
        //    .attr('fill', 'red');

        // Marker
        var self = this;
        this.el = this._svg.append('g')
           .datum({ type: 'Point', 'coordinates': this._point.getCoordinates() })
           .attr("transform", function (d) {
               //TODO(ryanc): Remove magic number 44
               var translation = self._projection(d.coordinates);
               translation[0] = translation[0] - 44/2;
               translation[1] = translation[1] - 44;
               return "translate(" + translation + ")";
           })
           .append('use')
           .attr('xlink:href', '#hub-map-content-marker');

        this.notify();

        var self = this;
        this.el.on('click', function (datum, index) {
            self.notify();
            $(self.el[0][0]).trigger('focusDataPoint.hub', self._point);
        });

        MarkerView.prototype.render.call(this);
    };

    ContentMarkerView.prototype.notify = function () {
        return;
    };

    return ContentMarkerView;
}); 
