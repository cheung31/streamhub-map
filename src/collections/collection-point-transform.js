define([
    'stream/transform',
    'streamhub-map/collections/collection-point',
    'inherits'
], function (Transform, CollectionPoint, inherits) {

    var CollectionPointTransform = function (collectionToLocation) {
        this._collectionToLocation = collectionToLocation;

        Transform.apply(this, arguments);
    };
    inherits(CollectionPointTransform, Transform);

    CollectionPointTransform.prototype._transform = function (collection, done) {
        if (collection.id in this._collectionToLocation) {
            this.push(new CollectionPoint(collection, this._collectionToLocation[collection.id]));
            return done();
        }
        done();
    };

    return CollectionPointTransform;
});
