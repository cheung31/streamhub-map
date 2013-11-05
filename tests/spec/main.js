define([
    'streamhub-sdk/jquery',
    'streamhub-map',
    'jasmine',
    'jasmine-jquery'
],
function ($, MapView) {
    'use strict';

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
});
