define([
    'streamhub-map/views/map-view',
    'streamhub-map/collection/collection-point',
    'inherits'],
function (MapView, CollectionPoint, inherits) {

    var CollectionMapView = function (opts) {
        opts = opts || {};

        this._collectionToLocation = opts.collectionToLocation;
        if (opts.drawMarker && typeof(opts.drawMarker) === 'function') {
            CollectionMapView.prototype._drawMarker = opts.drawMarker;
        }

        MapView.call(this, opts);
    };
    inherits(CollectionMapView, MapView);

    CollectionMapView.prototype.add = function (collection) {
        if (! this._collectionToLocation || ! collection.id in this._collectionToLocation) {
            return;
        }

        // Adapt Collection to CollectionPoint
        var location = this._collectionToLocation[collection.id];
        if (!location) {
            return;
        }
        var collectionPoint = new CollectionPoint(collection, location);
        MapView.prototype.add.call(this, collectionPoint);
    };

    return CollectionMapView;
});
