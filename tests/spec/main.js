'use strict';

var Collection = require('streamhub-sdk/collection');
var events = require('livefyre-map/events');
var expect = require('chai').expect;
var L = require('livefyre-map/leaflet/main');
var Map = require('livefyre-map');
var MapController = require('livefyre-map/map-controller');
var ModalView = require('streamhub-sdk/modal');
var sinon = require('sinon');

describe('src/main.js', function () {
  var stub;

  before(function () {
    // We don't need to fetch collection information since we're not doing
    // anything with the maps app.
    stub = sinon.stub(Collection.prototype, '_handleInitComplete');
  });

  after(function () {
    stub.restore();
  });

  describe('#constructor', function () {
    it('requires collection and articleId', function () {
      var element = document.createElement('div');
      var spy = sinon.spy(Map.prototype, 'configure');
      new Map({el: element});
      expect(spy.callCount).to.equal(0);
      new Map({collection: {articleId: '123'}, el: element});
      expect(spy.callCount).to.equal(1);
      spy.restore();
    });

    it('listens for events on the antenna', function () {
      var element = document.createElement('div');
      var spy = sinon.spy(Map.prototype, '_eventPassthrough');
      var map = new Map({collection: {articleId: '123'}, el: element});
      map.$antenna.trigger(events.OPEN_MODAL);
      expect(spy.callCount).to.equal(1);
      spy.restore();
    });

    it('configures the app', function () {
      var element = document.createElement('div');
      var spy = sinon.spy(Map.prototype, 'configure');
      var map = new Map({collection: {articleId: '123'}, el: element});
      expect(spy.callCount).to.equal(1);
      expect(map._controller).to.be.an.instanceof(MapController);
      spy.restore();
    });
  });

  describe('configureInternal', function () {
    var map;

    beforeEach(function () {
      var element = document.createElement('div');
      map = new Map({collection: {articleId: '123'}, el: element});
    });

    afterEach(function () {
      map.destroy();
    });

    it('uses default values for mapboxTileOptions if not specified', function () {
      map.configureInternal({});
      expect(map._opts.mapboxTileOptions.mapId).to.equal('livefyre.hknm2g26');
      map.configureInternal({mapboxTileOptions: {mapId: 'abc'}});
      expect(map._opts.mapboxTileOptions.mapId).to.equal('abc');
    });

    it('supports using custom map tiles', function () {
      map.configureInternal({customMapTiles: 'xyz'});
      expect(map._opts.mapboxTileOptions.mapId).to.equal('xyz');
    });

    it('supports setting initial lat/lng and zoom levels', function () {
      map.configureInternal({mapConfig: {lat: 123, lng: 456, zoom: 10}});
      expect(map._opts.leafletMapOptions.center).to.deep.equal([123, 456]);
      expect(map._opts.leafletMapOptions.zoom).to.equal(10);
    });

    it('supports enabling/disabling whether content is opened in a modal', function () {
      map.configureInternal({openModalOnClick: true});
      expect(map._controller._contentMapView.modal).to.be.an.instanceof(ModalView);
      map.configureInternal({openModalOnClick: false});
      expect(map._controller._contentMapView.modal).to.be.false;
    });

    it('supports enabling/disabling the ability to zoom', function () {
      map.configureInternal({zoomControl: false});
      expect(map._controller._map.zoomControl).to.be.null;
      expect(map._controller._map.touchZoom.enabled()).to.be.false;
      expect(map._controller._map.doubleClickZoom.enabled()).to.be.false;
      expect(map._controller._map.scrollWheelZoom.enabled()).to.be.false;
      expect(map._controller._map.boxZoom.enabled()).to.be.false;
      map.configureInternal({zoomControl: true});
      expect(map._controller._map.zoomControl).to.not.be.null;
      expect(map._controller._map.touchZoom.enabled()).to.be.true;
      expect(map._controller._map.doubleClickZoom.enabled()).to.be.true;
      expect(map._controller._map.scrollWheelZoom.enabled()).to.be.true;
      expect(map._controller._map.boxZoom.enabled()).to.be.true;
    });

    it('supports enabling/disabling the ability to pan', function () {
      map.configureInternal({allowPanning: false});
      expect(map._controller._map.dragging.enabled()).to.be.false;
      map.configureInternal({allowPanning: true});
      expect(map._controller._map.dragging.enabled()).to.be.true;
    });

    it('supports enabling/disabling the clustering of content', function () {
      map.configureInternal({allowClustering: false});
      expect(map._controller._contentMapView._markers).to.be.an.instanceof(L.FeatureGroup);
      expect(map._controller._contentMapView._markers._featureGroup).to.be.undefined;
      map.configureInternal({allowClustering: true});
      expect(map._controller._contentMapView._markers).to.be.an.instanceof(L.MarkerClusterGroup);
      expect(map._controller._contentMapView._markers._featureGroup).to.not.be.undefined;
    });

    it('assumes clustering is enabled by default', function () {
      expect(map._controller._contentMapView._markers).to.be.an.instanceof(L.MarkerClusterGroup);
      expect(map._controller._contentMapView._markers._featureGroup).to.not.be.undefined;
    });

    it('applies a theme to the app', function () {
      var spy = sinon.spy(map, 'applyTheme');
      map.configureInternal({allowClustering: false});
      expect(spy.callCount).to.equal(1);
      spy.restore();
    });
  });
});
