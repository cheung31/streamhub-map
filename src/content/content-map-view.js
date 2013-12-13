define([
    'streamhub-map',
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-map/content/content-point',
    'inherits'],
function (MapView, ContentListView, ContentPoint, inherits) {

    var ContentMapView = function (opts) {
        MapView.call(this, opts);
    };
    inherits(ContentMapView, MapView);

    ContentMapView.prototype.add = function (content) {
        if (! content._annotations.geocode || ! content._annotations.geocode.latitude || ! content._annotations.geocode.longitude ) {
            return;
        }

        // Adapt Content to ContentPoint
        var contentPoint = new ContentPoint(content);

        MapView.prototype.add.call(this, contentPoint);
    };

    ContentMapView.prototype.setElement = function (el) {
        MapView.prototype.setElement.apply(this, arguments);

        var self = this;
        this.$el.on('focusDataPoint.hub', function (e, dataPoint) {
            self._displayDataPointDetails(dataPoint);
        });
    };

    ContentMapView.prototype._displayDataPointDetails = function (dataPoint) {
        var content = dataPoint.getContent();
        if (! this.modal) {
            return;
        }

        //TODO(ryanc): Toggle class instead
        //$('body').css({
        //    'overflow': 'hidden',
        //    'position': 'fixed'
        //});
        this.modal.show(content);
    };

    return ContentMapView;
});
