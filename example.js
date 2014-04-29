define(function(require) {
    var View = require('streamhub-map');
    var Collection = require('streamhub-sdk/collection');

    return function(el) {
        var opts = {
            "network": "strategy-prod.fyre.co",
            "siteId": "340628",
            "articleId": "custom-1389845009515"
        };
        var collection = new Collection(opts);

        var view = new View({
            el: el,
            cloudmadeStyleId: 77922,
            leafletMapOptions: {
                center: [37.774929499038386, -122.41941549873445],
                zoom: 11,
                maxZoom: 16
            }
        });

        collection.pipe(view);
  
        return view;
    };
});
