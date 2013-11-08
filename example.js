define(function(require) {
    var View = require('streamhub-map');
    var CollectionPointTransform = require('streamhub-sdk/collections/collection-point-transform');
    var SolarTerminatorOverlayView = require('streamhub-map/views/solar-terminator-view');
    var MockHotCollectionsStream = require('streamhub-hot-collections-tests/mocks/streams/mock-hot-collections');

    return function(el) {
        var mapView = new View({
            el: el
        });

        // The Overlay API
        mapView.addOverlay(new SolarTerminatorOverlayView());

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
