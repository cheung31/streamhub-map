define(['streamhub-map/point','inherits'],
function (Point, inherits) {

    var CollectionPoint = function (opts) {
        opts = opts || {};
        Point.call(this, opts);
    };
    inherits(CollectionPoint, Point);

    return CollectionPoint;
});
