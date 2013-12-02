define(['streamhub-map/point','inherits'],
function (Point, inherits) {
    'use strict';

    var CollectionPoint = function (collection, opts) {
        opts = opts || {};

        if (collection === undefined) {
            throw new Error('CollectionPoint expected a Collection instance as its first argument');
        }
        this._collection = collection;

        Point.call(this, opts);
    };
    inherits(CollectionPoint, Point);

    CollectionPoint.prototype.getCollection = function () {
        return this._collection;
    };

    return CollectionPoint;
});
