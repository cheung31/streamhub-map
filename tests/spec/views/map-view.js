'use strict';

var expect = require('chai').expect;
var MapView = require('livefyre-map/views/map-view');
var sinon = require('sinon');

describe('src/views/map-view.js', function() {
  describe('_getVersionedTileURL', function() {
    it('gets the v3 url when there is no access token', function() {
      var stub = sinon.stub(MapView.prototype, '_drawMap');
      var view = new MapView();
      expect(view._getVersionedTileURL()).to.equal('https://{s}.tiles.mapbox.com/v3/{mapId}/{z}/{x}/{y}.{format}');
      stub.restore();
    });
    
    it('gets the v4 url when there is an access token', function() {
      var stub = sinon.stub(MapView.prototype, '_drawMap');
      var view = new MapView({mapboxTileOptions: { accessToken: '123' }});
      expect(view._getVersionedTileURL()).to.equal('https://{s}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}.{format}?access_token=123');
      stub.restore();
    });
  });
});
