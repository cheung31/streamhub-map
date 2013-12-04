define([
    'streamhub-map',
    'streamhub-map/content/content-point',
    'inherits'],
function (MapView, ContentPoint, inherits) {

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

    return ContentMapView;
});
