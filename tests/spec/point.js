'use strict';

var expect = require('chai').expect;
var Point = require('livefyre-map/point');

describe('src/point.js', function () {
  describe('can be constructed', function () {
    it ("with no options", function () {
      var point = new Point();
      expect(point).to.not.be.undefined;
    });
    it ("with empty options", function () {
      var point = new Point({});
      expect(point).to.not.be.undefined;
    });
    it ("with 'lat' and 'lon' options", function () {
      var point = new Point({
        lat: 49,
        lon: -30
      });
      expect(point).to.not.be.undefined;
    });
  });

  describe('can return the coordinates', function () {
    var point;

    beforeEach(function () {
      point = new Point({
        lat: 49,
        lon: -30
      });
    });

    it('in a lon, lat pair', function () {
      var coords = point.getCoordinates();
      expect(coords[0]).to.equal(-30);
      expect(coords[1]).to.equal(49);
    });

    it('in a lat, lon pair', function () {
      var coords = point.getLatLon();
      expect(coords[0]).to.equal(49);
      expect(coords[1]).to.equal(-30);
    });
  });
});
