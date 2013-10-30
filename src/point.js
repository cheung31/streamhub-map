define([], function () {

    var Point = function (opts) {
        opts = opts || {};
        this.lat = opts.lat;
        this.lon = opts.lon;
    };

    Point.prototype.getCoordinates = function () {
        return [this.lon, this.lat];
    };

    Point.prototype.getLatLon = function () {
        return [this.lat, this.lon];
    };

    return Point;
});
