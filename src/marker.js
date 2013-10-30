define([], function () {

    var Marker = function (opts) {
        opts = opts || {};
        this.lat = opts.lat;
        this.lon = opts.lon;
    };

    Marker.prototype.getCoordinates = function () {
        return [this.lon, this.lat];
    };

    Marker.prototype.getLatLon = function () {
        return [this.lat, this.lon];
    };

    return Marker;
});
