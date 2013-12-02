define(['streamhub-map/point','inherits'],
function (Point, inherits) {
    'use strict';

    var ContentPoint = function (content, opts) {
        opts = opts || {};

        if (content === undefined) {
            throw new Error('ContentPoint expected a Content instance as its first argument');
        }
        this._content = content;

        opts.lat = content._annotations.geocode.latitude;
        opts.lon = content._annotations.geocode.longitude;

        Point.call(this, opts);
    };
    inherits(ContentPoint, Point);

    ContentPoint.prototype.getContent = function () {
        return this._content;
    };

    return ContentPoint;
});
