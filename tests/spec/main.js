define([
    'streamhub-map',
    'streamhub-map/content/content-map-view',
    'streamhub-map/point',
    'streamhub-map/collection/collection-point',
    'streamhub-map/views/overlay-factory',
    'streamhub-map/views/overlay-view',
    'streamhub-map/views/marker-view',
    'json!streamhub-map/defaults.json',
    'streamhub-sdk/collection',
    'streamhub-sdk/content',
    'streamhub-sdk/jquery',
    'jasmine',
    'jasmine-jquery'
],
function (
    MapView,
    ContentMapView,
    Point,
    CollectionPoint,
    OverlayViewFactory,
    OverlayView,
    MarkerView,
    DefaultsJson,
    Collection,
    Content,
    $
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
                var overlayView = factory.createOverlayView(new CollectionPoint(new Collection()));
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

            it('has a default land/color scheme', function () {
                var view = new MapView({
                    el: $('#hub-map-view')
                });

                expect($('.hub-map-land').attr('fill')).toBe(DefaultsJson.colors.land.fill);
                expect($('.hub-map-land').attr('stroke')).toBe(DefaultsJson.colors.land.stroke);
                expect($('.hub-map-water').css('background-color')).toBe('rgb(165, 195, 202)');
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
                view.add(new CollectionPoint(new Collection(), {
                    lat: 49,
                    lon: -30
                }));
                expect($('#hub-map-view')).toContain('.hub-place');
            });
        });

        describe('can be bounded to a bounding box', function () {
            beforeEach(function () {
                setFixtures('<div id="hub-map-view"></div>');
            });

            it ("the map's projection is bounded to the boundingBox option", function () {
                var view = new MapView({
                    el: $('#hub-map-view'),
                    boundingBox: [
                        { lat: 0, lon: 0 }, // NW
                        { lat: 1, lon: 1 } // SW
                    ]
                });

                var bboxFeature = view._getBoundingBoxFeature();
                expect(bboxFeature.geometry.type).toBe('Polygon');

                expect(bboxFeature.geometry.coordinates[0][0][0]).toBe(0);
                expect(bboxFeature.geometry.coordinates[0][0][1]).toBe(0);

                expect(bboxFeature.geometry.coordinates[0][1][0]).toBe(1);
                expect(bboxFeature.geometry.coordinates[0][1][1]).toBe(0);

                expect(bboxFeature.geometry.coordinates[0][2][0]).toBe(1);
                expect(bboxFeature.geometry.coordinates[0][2][1]).toBe(1);

                expect(bboxFeature.geometry.coordinates[0][3][0]).toBe(0);
                expect(bboxFeature.geometry.coordinates[0][3][1]).toBe(1);

                expect(bboxFeature.geometry.coordinates[0][4][0]).toBe(0);
                expect(bboxFeature.geometry.coordinates[0][4][1]).toBe(0);
            });
        });

        describe('is customizable', function () {
            beforeEach(function () {
                setFixtures('<div id="hub-map-view"></div>');
            });

            it('the land color can be customized', function () {
                var view = new MapView({
                    el: $('#hub-map-view'),
                    colors: { land: { fill: 'blue', stroke: 'red' }}
                });

                expect($('.hub-map-land').attr('fill')).toBe('blue');
                expect($('.hub-map-land').attr('stroke')).toBe('red');
            });

            it('the water color can be customized', function () {
                var view = new MapView({
                    el: $('#hub-map-view'),
                    colors: { water: { fill: 'red', stroke: 'yellow' }}
                });

                expect($('.hub-map-water').attr('fill')).toBe('red');
                expect($('.hub-map-water').css('background-color')).toBe('rgb(255, 0, 0)'); // red
                expect($('.hub-map-water').attr('stroke')).toBe('yellow');
            });
        });
    });

    describe('A ContentMapView', function () {

        describe('can be constructed', function () {
            it ("with no options", function () {
                var view = new ContentMapView();
                expect(view).toBeDefined();
            });
            it ("with empty options", function () {
                var view = new ContentMapView({});
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

        describe('can add a Content instance', function () {

            var content;
            beforeEach(function () {
                setFixtures('<div id="hub-map-view"></div>');
                content = new Content();
                content._annotations = { 
                    geocode: { latitude: 37.77, longitude: -122.42 }
                };
            });

            it ('draws an appropriate ContentViewMarker on the map', function () {
                var view = new ContentMapView({
                    el: $('#hub-map-view')
                });

                view.add(content);
                expect($('#hub-map-view')).toContain('.hub-map-content-marker');
            });
        });
    });

    describe('ContentMarkerView', function () {

        describe('opens a modal', function () {

            var content;
            beforeEach(function () {
                setFixtures('<div id="hub-map-view"></div>');
                content = new Content();
                content._annotations = { 
                    geocode: { latitude: 37.77, longitude: -122.42 }
                };
            });

            afterEach(function () {
                $('.hub-modal').remove();
            });

            it ('displays the ContentView of the clicked ContentMarkerView', function () {
                var view = new ContentMapView({
                    el: $('#hub-map-view')
                });
                view.add(content);

                $('.hub-map-content-marker').trigger('focusDataPoint.hub', { data: content });

                expect($('body > .hub-modals')).toBe('div');
                expect($('body > .hub-modals')).toContain('.streamhub-content-list-view');
                expect($('body > .hub-modals .hub-content-container').length).toBe(1);
            });
        });
    });

    describe('ClusteredContentMarkerView', function () {

        describe('can add many Content instances', function () {

            var content1 = new Content();
            var content2 = new Content();
            var content3 = new Content();
            beforeEach(function () {
                setFixtures('<div id="hub-map-view"></div>');

                content1.id = 1;
                content1._annotations = { 
                    geocode: { latitude: 37.77, longitude: -122.42 }
                };
                content2.id = 2;
                content2._annotations = { 
                    geocode: { latitude: 37.77, longitude: -122.42 }
                };
                content3.id = 1;
                content3._annotations = { 
                    geocode: { latitude: 37.77, longitude: -122.42 }
                };
            });

            afterEach(function () {
                $('.hub-modal').remove();
            });


            it ('draws an appropriate ClusteredContentMarkerView on the map', function () {
                var view = new ContentMapView({
                    el: $('#hub-map-view')
                });
                view.add(content1);
                view.add(content2);
                view.add(content3);

                $('.hub-map-content-marker').trigger('focusDataPoint.hub', { data: [content1, content2, content3] });

                expect($('body > .hub-modals')).toBe('div');
                expect($('body > .hub-modals')).toContain('.streamhub-content-list-view');
                expect($('body > .hub-modals .hub-content-container').length).toBe(3);
            });
        });
    });
});
