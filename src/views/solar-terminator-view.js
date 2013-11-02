define([
    'streamhub-map/views/animated-overlay-view',
    'd3',
    'inherits'
], function (AnimatedOverlayView, d3, inherits) {

    var π = Math.PI,
        radians = π / 180,
        degrees = 180 / π;

    // Equations based on NOAA’s Solar Calculator; all angles in radians.
    // // http://www.esrl.noaa.gov/gmd/grad/solcalc/
    var SolarTerminatorOverlayView = function (opts) {
        this._circle = d3.geo.circle().angle(90);
        this.el;

        AnimatedOverlayView.call(this, opts);
    };
    inherits(SolarTerminatorOverlayView, AnimatedOverlayView);

    SolarTerminatorOverlayView.prototype.tick = function () {
        this.el.datum(this._circle.origin(this.antipode(this.solarPosition(new Date))))
            .attr("d", this._path);
    };

    SolarTerminatorOverlayView.prototype.render = function () {
        if (this._animating) {
            return;
        }
        this.el = this._svg.append("path")
            .attr("class", "night")
            .attr("d", this._path);

        this._animating = true;
        this.tick();
        this._intervalId = setInterval(this.tick.bind(this), 1000*60);

        AnimatedOverlayView.prototype.render.call(this);
    };

    SolarTerminatorOverlayView.prototype.antipode = function (position) {
        return [position[0] + 180, -position[1]];
    };

    SolarTerminatorOverlayView.prototype.solarPosition = function (time) {
        var centuries = (time - Date.UTC(2000, 0, 1, 12)) / 864e5 / 36525, // since J2000
            longitude = (d3.time.day.utc.floor(time) - time) / 864e5 * 360 - 180;
        return [
            longitude - this.equationOfTime(centuries) * degrees,
            this.solarDeclination(centuries) * degrees
        ];
    };

    SolarTerminatorOverlayView.prototype.equationOfTime = function (centuries) {
      var e = this.eccentricityEarthOrbit(centuries),
          m = this.solarGeometricMeanAnomaly(centuries),
          l = this.solarGeometricMeanLongitude(centuries),
          y = Math.tan(this.obliquityCorrection(centuries) / 2);
      y *= y;
      return y * Math.sin(2 * l)
          - 2 * e * Math.sin(m)
          + 4 * e * y * Math.sin(m) * Math.cos(2 * l)
          - 0.5 * y * y * Math.sin(4 * l)
          - 1.25 * e * e * Math.sin(2 * m);
    };

    SolarTerminatorOverlayView.prototype.solarDeclination = function (centuries) {
      return Math.asin(Math.sin(this.obliquityCorrection(centuries)) * Math.sin(this.solarApparentLongitude(centuries)));
    };

    SolarTerminatorOverlayView.prototype.solarApparentLongitude = function (centuries) {
      return this.solarTrueLongitude(centuries) - (0.00569 + 0.00478 * Math.sin((125.04 - 1934.136 * centuries) * radians)) * radians;
    };

    SolarTerminatorOverlayView.prototype.solarTrueLongitude = function (centuries) {
      return this.solarGeometricMeanLongitude(centuries) + this.solarEquationOfCenter(centuries);
    };

    SolarTerminatorOverlayView.prototype.solarGeometricMeanAnomaly = function (centuries) {
      return (357.52911 + centuries * (35999.05029 - 0.0001537 * centuries)) * radians;
    };

    SolarTerminatorOverlayView.prototype.solarGeometricMeanLongitude = function (centuries) {
      var l = (280.46646 + centuries * (36000.76983 + centuries * 0.0003032)) % 360;
      return (l < 0 ? l + 360 : l) / 180 * π;
    };

    SolarTerminatorOverlayView.prototype.solarEquationOfCenter = function (centuries) {
      var m = this.solarGeometricMeanAnomaly(centuries);
      return (Math.sin(m) * (1.914602 - centuries * (0.004817 + 0.000014 * centuries))
          + Math.sin(m + m) * (0.019993 - 0.000101 * centuries)
          + Math.sin(m + m + m) * 0.000289) * radians;
    };

    SolarTerminatorOverlayView.prototype.obliquityCorrection = function (centuries) {
      return this.meanObliquityOfEcliptic(centuries) + 0.00256 * Math.cos((125.04 - 1934.136 * centuries) * radians) * radians;
    };

    SolarTerminatorOverlayView.prototype.meanObliquityOfEcliptic = function (centuries) {
      return (23 + (26 + (21.448 - centuries * (46.8150 + centuries * (0.00059 - centuries * 0.001813))) / 60) / 60) * radians;
    };

    SolarTerminatorOverlayView.prototype.eccentricityEarthOrbit = function (centuries) {
      return 0.016708634 - centuries * (0.000042037 + 0.0000001267 * centuries);
    };

    return SolarTerminatorOverlayView;
});
