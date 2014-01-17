# streamhub-map

streamhub-map is a [StreamHub App](http://apps.livefyre.com) that displays social content on a geographical map.

## Getting Started

The quickest way to use streamhub-map is to use the built version hosted on Livefyre's CDN.

### Dependencies

streamhub-map depends on [streamhub-sdk](https://github.com/livefyre/streamhub-sdk). Ensure it's been included in your page.

	<script src="http://cdn.livefyre.com/libs/sdk/v2.5.0/streamhub-sdk.min.gz.js"></script>

Include streamhub-map too.

	<script src="http://livefyre-cdn-dev.s3.amazonaws.com/libs/apps/cheung31/streamhub-map/v1.0.0/streamhub-map.min.js"></script>
	
Optionally, include some reasonable default CSS rules for StreamHub Content. This stylesheet is provided by the StreamHub SDK.

    <link rel="stylesheet" href="http://cdn.livefyre.com/libs/sdk/v2.5.0/streamhub-sdk.gz.css" />

### Usage
#### Visualizing a Livefyre Collection (```ContentMapView```)
1. Require streamhub-sdk and ContentMapView

        var ContentMapView = Livefyre.require('streamhub-map');
        
1. Create a ```Collection```.

        var collection = new Collection({
            "network": "livefyre.com",
            "siteId": "290596",
            "articleId": "172",
            "environment": "qa-ext.livefyre.com"
        });
        
1. Create a ```ContentMapView```, passing the DOMElement to render it in (```el``` option).

        var view = new ContentMapView({
        	el: document.getElementById("myMap")
    	});
    
1. Pipe the collection's content into the ```ContentMapView```

        collection.pipe(view);

        
## Map Customization
The default center point, zoom level, and appearance of map tiles can be
configured with the ```leafletMapOptions``` option.

### Default center point
To set the default center point of the map, specify the lat/lon coordinate in the ```leafletMapOptions```:

        var view = new ContentMapView({
            el: document.getElementById("myMap"),
            leafletMapOptions: {
                center: [37.774929499038386, -122.41941549873445]
            }
        });

### Default zoom level
To set the default zoom level of the map, specify the zoom level in the ```leafletMapOptions```:

        var view = new ContentMapView({
            el: document.getElementById("myMap"),
            leafletMapOptions: {
                zoom: 4
            }
        });

### Map Tile theme
To change the appearance of map tiles, specify the style id of the theme from CloudMade with the ```cloudmadeStyleId``` option:

        var view = new ContentMapView({
            el: document.getElementById("myMap"),
            cloudmadeStyleId: 998
        });


## Local Development

Instead of using a built version of streamhub-map from Livefyre's CDN, you may wish to fork, develop on the repo locally, or include it in your existing JavaScript application.

Clone this repo

    git clone https://github.com/cheung31/streamhub-map

Development dependencies are managed by [npm](https://github.com/isaacs/npm), which you should install first.

With npm installed, install streamhub-map's dependencies. This will also download [Bower](https://github.com/bower/bower) and use it to install browser dependencies.

    cd streamhub-map
    npm install

This repository's package.json includes a helpful script to launch a web server for development

    npm start

You can now visit [http://localhost:8080/](http://localhost:8080/) to see an example feed loaded via RequireJS.

### Jasmine Tests
To see Jasmine tests:

    npm start
    
and navigate to: [http://localhost:8080/tests](http://localhost:8080/tests).

# StreamHub

[Livefyre StreamHub](http://www.livefyre.com/streamhub/) is used by the world's biggest brands and publishers to power their online Content Communities. StreamHub turns your site into a real-time social experience. Curate images, videos, and Tweets from across the social web, right into live blogs, chats, widgets, and dashboards. Want StreamHub? [Contact Livefyre](http://www.livefyre.com/contact/).
