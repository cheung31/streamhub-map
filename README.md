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
#### Visualizing Livefyre Hot Collections

1. Require streamhub-sdk and streamhub-map

        var MapView = Livefyre.require('streamhub-map');
    
1. Your ```site``` on Livefyre keeps track of the hottest conversations. To access these hot conversations Livefyre provides ```Hot Collections```. To visualize Hot Collections on the ```MapView```:

    1. **Define the mapping of ```Collection``` to ```Location```.** This requires prior knowledge of Collection ```articleId```s, and their respective latitude/longitude coordinates. (**Note**: *In the future this explicit mapping may be deprecated by allowing Collections to be geotagged through the Livefyre admin.*)
    
        ```
        // A map of articleIds from a set of Hot Collections to their respective locations
        var collectionToLocation = {
        	'articleId1': { lat: 30.52, lon: -58.23 },
        	'articleId2': { lat: 60.52, lon: 8.23 },
        	...
        };
        ```
        
    1. **Construct ```CollectionPointTransform```.** The MapView can consume ```Collection```s and ```Content```. A ```Transform``` is required to translate the set of Collections/Hot Collections and Location pairings into a consumbale form for the MapView.
    
        ```
        var collectionPointTransform = new CollectionPointTransform(collectionToLocation);
        ```
        
1. Create a MapView, passing the DOMElement to render it in (```el``` option).

        var view = new MapView({
        	el: document.getElementById("myMap")
    	});
    
1. Pipe the collection's content into the ```MapView```


        hotCollections
            .pipe(collectionPointTransform)
            .pipe(view);

#### Visualizing a Livefyre Collection
*Coming Soon - Livefyre geotagged content*

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
