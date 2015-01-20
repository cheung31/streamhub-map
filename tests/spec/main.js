define([
    'streamhub-map',
    'streamhub-map',
    'streamhub-map/point',
    'streamhub-map/collection/collection-point',
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

        it('attributes OpenStreetMap', function () {
            var view = new ContentMapView({});
            var rendersAttribution = (view.el.innerHTML.indexOf('© OpenStreetMap') !== -1)
            expect(rendersAttribution).toBe(true);
        });

        describe('can add a Content instance', function () {

            var content;
            beforeEach(function () {
                setFixtures('<div id="hub-map-view"></div>');
                content = new Content();
                content.geocode = { latitude: 37.77, longitude: -122.42 };
            });

            xit ('draws an appropriate ContentViewMarker on the map', function () {
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
                $('svg').remove();
            });

            xit ('displays the ContentView of the clicked ContentMarkerView', function () {
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
                $('svg').remove();
            });


            xit ('draws an appropriate ClusteredContentMarkerView on the map', function () {
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
