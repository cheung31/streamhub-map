define(function(require) {
    var View = require('streamhub-map/content/content-map-view');
    var Collection = require('streamhub-sdk/collection');

    return function(el) {
        var opts = {
            "network": "livefyre.com",
            "siteId": "290596",
            "articleId": "172",
            "environment": "qa-ext.livefyre.com"
        };
        var collection = new Collection(opts);

        var view = new View({
            el: el
        });

        collection.pipe(view);
  
        return view;
    };
});
