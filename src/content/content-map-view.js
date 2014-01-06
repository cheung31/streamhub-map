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
        this.$el.on('focusDataPoint.hub', function (e, focusContext) {
            self._displayDataPointDetails(focusContext.contentItems);
        });
    };

    ContentMapView.prototype._displayDataPointDetails = function (contentItems) {
        if (! this.modal || ! contentItems || ! contentItems.length) {
            return;
        }

        var modalContentView = new ContentListView();
        for (var i=0; i < contentItems.length; i++) {
            modalContentView.more.write(contentItems[i]);
        }

        this.modal.show(modalContentView);
    };

    return ContentMapView;
});
