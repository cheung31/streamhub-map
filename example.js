define(function(require) {
    var View = require('streamhub-map');
    var CollectionPointTransform = require('streamhub-map/collections/collection-point-transform');
    var SolarTerminatorOverlayView = require('streamhub-map/views/solar-terminator-view');
    var MockHotCollectionsStream = require('streamhub-hot-collections-tests/mocks/streams/mock-hot-collections');

    return function(el) {
        var mapView = new View({
            el: el
        });

        // The Overlay API
        mapView.addOverlay(new SolarTerminatorOverlayView());

        var sfLatLon = { lat: 37.7749295, lon: -122.4194155 };
        var usaLatLon = { lat: 37.09024, lon: -95.712891 };
        var europeLatLon = { lat: 54.5259614, lon: 15.2551187 };
        var southAmericaLatLon = { lat: -8.783195, lon: -55.491477 };
        var indiaLatLon = { lat: 20.593684, lon: 78.96288 };
        var indonesiaLatLon = { lat: -0.789275, lon: 113.921327 };

        // Collection to Location Mapping
        //TODO(ryanc): collectionId -> lat/lon or articleId -> lat/lon
        var collectionToLocation = {
            47993636: sfLatLon,
            48084932: usaLatLon,
            48078130: europeLatLon,
            48081257: southAmericaLatLon,
            48089894: indiaLatLon,
            48103282: indonesiaLatLon
        };
        var collectionPointTransform = new CollectionPointTransform(collectionToLocation);

        var hotCollectionsStream = new MockHotCollectionsStream({
            network: 'livefyre.com'
        });
        hotCollectionsStream
            .pipe(collectionPointTransform)
            .pipe(mapView);
  
        return view;
    };
});
