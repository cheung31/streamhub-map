define([
    'streamhub-sdk/jquery',
    'streamhub-map',
    'streamhub-map/point',
    'streamhub-map/collections/collection-point',
    'streamhub-map/views/overlay-factory',
    'streamhub-map/views/overlay-view',
    'streamhub-map/views/marker-view',
    'jasmine',
    'jasmine-jquery'
],
function (
    $,
    MapView,
    Point,
    CollectionPoint,
    OverlayViewFactory,
    OverlayView,
    MarkerView
) {
    'use strict';


    describe('A Point', function () {

        describe('can be constructed', function () {
            it ("with no options", function () {
                var point = new Point();
                expect(point).toBeDefined();
            });
            it ("with empty options", function () {
                var point = new Point({});
                expect(point).toBeDefined();
            });
            it ("with 'lat' and 'lon' options", function () {
                var point = new Point({
                    lat: 49,
                    lon: -30
                });
                expect(point).toBeDefined();
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
                expect(coords[0]).toBe(-30);
                expect(coords[1]).toBe(49);
            });

            it('in a lat, lon pair', function () {
                var coords = point.getLatLon();
                expect(coords[0]).toBe(49);
                expect(coords[1]).toBe(-30);
            });
        });
    });

    describe('A OverlayViewFactory', function () {
        var factory;
        beforeEach(function () {
            factory = new OverlayViewFactory();
        });

        describe('can be constructed', function () {
            it ("with no options", function () {
                var factory = new OverlayViewFactory();
                expect(factory).toBeDefined();
            });
            it ("with empty options", function () {
                var factory = new OverlayViewFactory({});
                expect(factory).toBeDefined();
            });
            it ("with an mapContext", function () {
                var factory = new OverlayViewFactory({
                    mapContext: { svg: 'foo', path: 'bar' }
                });
                expect(factory).toBeDefined();
            });
        });

        describe('can return a OverlayView instance', function () {
            it ('given a Point instance', function () {
                var overlayView = factory.createOverlayView(new Point());
                expect(overlayView instanceof MarkerView).toBe(true);
            });

            it ('given a CollectionPoint instance', function () {
                var overlayView = factory.createOverlayView(new CollectionPoint());
                expect(overlayView instanceof MarkerView).toBe(true);
            });
        });
    });

    describe('A OverlayView', function () {

        describe('can be constructed', function () {
            it ("with no options", function () {
                var view = new OverlayView();
                expect(view).toBeDefined();
            });
            it ("with empty options", function () {
                var view = new OverlayView({});
                expect(view).toBeDefined();
            });
        });

        describe('can set map context', function () {
            it ("sets a reference to the map's svg element and the path element to draw with", function () {
                var view = new OverlayView();
                view.setMapContext({
                    svg: 'foo',
                    path: 'bar'
                });
                expect(view._svg).toBe('foo');
                expect(view._path).toBe('bar');
            });
        });

        describe('can render', function () {
            it ('sets its #_rendered property to true', function () {
                var view = new OverlayView();
                expect(view._rendered).toBe(false);
                view.render();
                expect(view._rendered).toBe(true);
            });
        });

        describe('can be destroyed', function () {
        });
    });

    describe('A MarkerView', function () {

        describe('construction', function () {
            it ("with no options, throws an Error", function () {
                expect(function () { new MarkerView() }).toThrow();
            });

            it ("expects a Point instance", function () {
                expect(new MarkerView(new Point())).toBeDefined();
            });
        });
    });

    describe('A MapView', function () {

        describe('can be constructed', function () {
            it ("with no options", function () {
                var view = new MapView();
                expect(view).toBeDefined();
            });
            it ("with empty options", function () {
                var view = new MapView({});
                expect(view).toBeDefined();
            });
            it ("with an el", function () {
                setFixtures('<div id="hub-map-view"></div>');
                var view = new MapView({
                    el: $('#hub-map-view')
                });
                expect(view).toBeDefined();
            });
        });

        describe('draws a map', function () {
            beforeEach(function () {
                setFixtures('<div id="hub-map-view"></div>');
            });

            it ('appends a svg element', function () {
                var view = new MapView({
                    el: $('#hub-map-view')
                });

                expect($('#hub-map-view')).toContain('svg');
            });

            it ('adds a map layer representing the map geometries', function () {
                var view = new MapView({
                    el: $('#hub-map-view')
                });

                expect($('#hub-map-view')).toContain('svg > g.hub-map');
            });
        });

        describe('can add a map layer', function () {
            beforeEach(function () {
                setFixtures('<div id="hub-map-view"></div>');
            });

            it ('appends a svg group element', function () {
                var view = new MapView({
                    el: $('#hub-map-view')
                });
                view.addLayer('blah');

                expect($('#hub-map-view')).toContain('g.blah');
            });
        });

        describe('can add a Point', function () {
            beforeEach(function () {
                setFixtures('<div id="hub-map-view"></div>');
            });

            it ('draws an appropriate OverlayView on the map', function () {
                var view = new MapView({
                    el: $('#hub-map-view')
                });
                view.addDataPoint(new CollectionPoint({
                    lat: 49,
                    lon: -30
                }));
                expect($('#hub-map-view')).toContain('.hub-place');
            });
        });
    });

});
