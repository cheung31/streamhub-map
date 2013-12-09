define(function(require) {
    var View = require('streamhub-map/collection/collection-map-view');
    var Collection = require('streamhub-sdk/collection');
    var MockHotCollectionsStream = require('streamhub-hot-collections-tests/mocks/streams/mock-hot-collections');

    return function(el) {
        var opts = {
            "network": "livefyre.com",
            "siteId": "290596",
            "articleId": "172",
            "environment": "qa-ext.livefyre.com"
        };
        var collection = new Collection(opts);

        var mapView = new View({
            el: el
        });

        collection.pipe(mapView);
  
        return view;
    };
});
