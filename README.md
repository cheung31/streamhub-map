# streamhub-map

streamhub-map is a [StreamHub App](http://apps.livefyre.com) that displays social content on a geographical map. It supports basic thematic mapping visualizations for StreamHub collections and content, such as:

* Dot mapping
* Proportional symbol mapping

MapView + MediaWall
![MapView + MediaWall](http://i.imgur.com/dkdzBkB.png)

## Getting Started

The quickest way to use streamhub-map is to use the built version hosted on Livefyre's CDN.

### Dependencies

streamhub-map depends on [streamhub-sdk](https://github.com/livefyre/streamhub-sdk). Ensure it's been included in your page.

	<script src="http://cdn.livefyre.com/libs/sdk/v2.2.0/streamhub-sdk.min.gz.js"></script>

Include streamhub-map too.

	<script src="http://livefyre-cdn-dev.s3.amazonaws.com/libs/apps/cheung31/streamhub-map/v1.0.0/streamhub-map.min.js"></script>
	
Optionally, include some reasonable default CSS rules for StreamHub Content. This stylesheet is provided by the StreamHub SDK.

    <link rel="stylesheet" href="http://cdn.livefyre.com/libs/sdk/v2.2.0/streamhub-sdk.gz.css" />

### Usage
#### Visualizing a Livefyre Collection (```ContentMapView```)
1. Require streamhub-sdk and ContentMapView

        var ContentMapView = Livefyre.require('streamhub-map/content/content-map-view');
        
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

#### Visualizing Livefyre Hot Collections (```CollectionMapView```)

1. Require streamhub-sdk and CollectionMapView

        var CollectionMapView = Livefyre.require('streamhub-map/collection/collection-map-view');
    
1. Your ```site``` on Livefyre keeps track of the hottest conversations. To access these hot conversations Livefyre provides ```Hot Collections```. To visualize Hot Collections on the ```MapView```. **Define the mapping of ```Collection``` to ```Location```.** This requires prior knowledge of Collection ```articleId```s, and their respective latitude/longitude coordinates. (**Note**: *In the future this explicit mapping may be deprecated by allowing Collections to be geotagged through the Livefyre admin.*):
    
        // A map of articleIds from a set of Hot Collections to their respective locations
        var collectionToLocation = {
        	'articleId1': { lat: 30.52, lon: -58.23 },
        	'articleId2': { lat: 60.52, lon: 8.23 },
        	...
        };
        
1. Create a CollectionMapView, passing the DOMElement to render it in (```el``` option).

        var view = new CollectionMapView({
        	el: document.getElementById("myMap"),
        	collectionToLocation: collectionToLocation
    	});
    
1. Pipe the collection's content into the ```CollectionMapView```

        var hotCollectionsStream = new MockHotCollectionsStream({
            network: 'livefyre.com'
        });
        hotCollections.pipe(view);
        
## Map Customization
### Bounding box
The visible region can be specified with  the ```boundingBox``` option. The bounding box is represented by the North-West and South-East Lat/Lon coordinates.

        var view = new MapView({
            el: document.getElementById("myMap"),
            boundingBox: [
                { lat: 49.32512199104001, lon: -126.5625 }, // NW
                { lat: 24.686952411999155, lon: -65.830078125 } // SE
            ]
        });

### Land/Water colors

The ```MapView``` constructor accepts the ```colors``` option.

        var view = new MapView({
            el: document.getElementById("myMap"),
            colors: {
                land: {
                    fill: 'green',
                    stroke: 'black'
                },
                water {
               	    fill: 'blue'
                }
            }
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
