'use strict';

var $ = require('jquery');
var chai = require('chai');
var Collection = require('streamhub-sdk/collection');
var expect = chai.expect;
var MapController = require('livefyre-map/map-controller');
var ModalView = require('streamhub-sdk/modal');
var sinon = require('sinon');
require('chai-jquery');

function setFixtures(str) {
  var elem = $(str);
  $(document.body).append(elem);
  return elem;
}

describe('src/map-controller.js', function () {
  var $antenna;
  var collectionCfg = {articleId: 'abc', network: 'test.fyre.co', siteId: '123'};
  var controller;
  var mapCfg = {mapId: 'examples.map-i86nkdio'};
  var state = {
    source: 0,
    collectionId: '2486057',
    content: {
      generator: {
        id: 'livefyre.com'
      },
      author: null,
      parentId: '',
      bodyHtml: '<p>body 1428010381.97</p>',
      annotations: {
        geocode: {
          latitude: 33.6054149,
          longitude: -112.125051
        }
      },
      authorId: '_up1770408@livefyre.com',
      updatedAt: 1428010382,
      id: '7748f878a320412db9e24a22975fd808@livefyre.com',
      createdAt: 1428010381
    },
    vis: 1,
    type: 0,
    event: 1428010382027468
  };
  var stub;

  beforeEach(function () {
    $antenna = setFixtures('div');
    stub = sinon.stub(Collection.prototype, '_handleInitComplete');
    controller = new MapController({
      collection: collectionCfg,
      $antenna: $antenna,
      mapboxTileOptions: mapCfg
    });
  });

  afterEach(function () {
    stub.restore();
  });

  describe('_getTileUrl', function () {
    it('returns the correct url', function () {
      expect(controller._getTileUrl()).to.equal('http://bootstrap.test.fyre.co/bs3/v3.1/test.fyre.co/123/YWJj/geojson/{z}/{x}/{y}.json');
    });
  });

  describe('_handleNewContent', function () {
    it('should keep out duplicate comments', function () {
      var spy = sinon.spy(controller._collection._updater, 'push');
      controller._handleNewContent(null, state);
      expect(spy.callCount).to.equal(1);
      controller._handleNewContent(null, state);
      expect(spy.callCount).to.equal(1);
      controller._seenIds = [];
      controller._handleNewContent(null, state);
      expect(spy.callCount).to.equal(2);
      spy.restore();
    });
  });

  describe('_setModal', function () {
    it('creates a new ModalView if enabled', function () {
      controller._contentMapView.modal = false;
      expect(controller._contentMapView.modal).to.be.false;
      controller._setModal(true);
      expect(controller._contentMapView.modal).to.be.an.instanceof(ModalView);
    });

    it('removes the modal value if disabled', function () {
      expect(controller._contentMapView.modal).to.be.an.instanceof(ModalView);
      controller._setModal(false);
      expect(controller._contentMapView.modal).to.be.null;
    });
  });

  describe('_setPan', function () {
    it('enables panning if true', function () {
      controller._map.dragging.disable();
      expect(controller._map.dragging.enabled()).to.be.false;
      controller._setPan(true);
      expect(controller._map.dragging.enabled()).to.be.true;
    });

    it('disables panning if false', function () {
      expect(controller._map.dragging.enabled()).to.be.true;
      controller._setPan(false);
      expect(controller._map.dragging.enabled()).to.be.false;
    });
  });

  describe('_setZoomControl', function () {
    it('enables zooming and adds zoom controls when true', function () {
      controller._map.zoomControl.removeFrom(controller._map);
      controller._map.zoomControl = null;
      controller._map.touchZoom.disable();
      controller._map.doubleClickZoom.disable();
      controller._map.scrollWheelZoom.disable();
      controller._map.boxZoom.disable();
      controller._setZoomControl(true);
      expect(controller._map.zoomControl).to.not.be.null;
      expect(controller._map.touchZoom.enabled()).to.be.true;
      expect(controller._map.doubleClickZoom.enabled()).to.be.true;
      expect(controller._map.scrollWheelZoom.enabled()).to.be.true;
      expect(controller._map.boxZoom.enabled()).to.be.true;
    });

    it('disables zooming and removes zoom controls when false', function () {
      controller._setZoomControl(false);
      expect(controller._map.zoomControl).to.be.null;
      expect(controller._map.touchZoom.enabled()).to.be.false;
      expect(controller._map.doubleClickZoom.enabled()).to.be.false;
      expect(controller._map.scrollWheelZoom.enabled()).to.be.false;
      expect(controller._map.boxZoom.enabled()).to.be.false;
    });
  });

  describe('configureMap', function () {
    it('updates the map center position', function (done) {
      var spy = sinon.spy(window, 'setTimeout');
      var stub = sinon.stub(controller._map, 'setView', function () {
        expect(spy.callCount).to.equal(1);
        expect(stub.callCount).to.equal(1);
        expect(stub.calledWith([1, 2])).to.be.true;
        done();
      });
      controller.configureMap({leafletMapOptions: {center: [1, 2]}});
      spy.restore();
      stub.restore();
    });

    it('updates the map zoom level', function (done) {
      var spy = sinon.spy(controller._map, 'setView');
      controller.configureMap({leafletMapOptions: {zoom: 3}});
      setTimeout(function () {
        expect(spy.callCount).to.equal(1);
        expect(spy.lastCall.args[1], controller._map.getCenter());
        expect(spy.lastCall.args[2], 3);
        spy.restore();
        done();
      }, 15);
    });

    it('updates the mapId and redraws the tilelayer', function (done) {
      var tl = controller._contentMapView._tileLayer;
      var stub = sinon.stub(tl, 'redraw', function () {
        expect(tl.options.mapId).to.equal('foo');
        done();
      });
      controller.configureMap({
        leafletMapOptions: {},
        mapboxTileOptions: {mapId: 'foo'}
      });
      expect(stub.callCount).to.equal(1);
      stub.restore();
    });
  });

  describe('destroy', function () {
    it('unlistens to $antenna', function () {
      var cbStub = sinon.stub();
      controller.events = {'test': cbStub};
      controller._delegateEvents();
      controller.$antenna.trigger('test');
      controller.destroy();
      controller.$antenna.trigger('test');
      expect(cbStub.callCount).to.equal(1);
    });
  });
});
