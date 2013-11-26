define([
    'streamhub-map',
    'streamhub-map/collection/collection-point',
    'inherits'],
function (MapView, CollectionPoint, inherits) {

    var CollectionMapView = function (opts) {
        opts = opts || {};

        this._collectionToLocation = opts.collectionToLocation;
        MapView.call(this, opts);
    };
    inherits(CollectionMapView, MapView);

    CollectionMapView.prototype.add = function (collection) {
        if (! this._collectionToLocation || ! collection.id in this._collectionToLocation) {
            return;
        }

        // Adapt Collection to CollectionPoint
        var collectionPoint = new CollectionPoint(collection, this._collectionToLocation[collection.id]);

        this.addDataPoint(collectionPoint);
        this.$el.trigger('addDataPoint.hub', collectionPoint);
    };

    return CollectionMapView;
});
