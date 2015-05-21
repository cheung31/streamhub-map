# livefyre-map

livefyre-map is a [StreamHub App](http://apps.livefyre.com) that displays social content on a geographical map.

## Getting Started

The quickest way to use livefyre-map is to use the built version hosted on Livefyre's CDN.

### Usage
#### Visualizing a Livefyre Collection (```LivefyreMap```)
1. Add Livefyre.js to your page

        <script src="//cdn.livefyre.com/Livefyre.js">

1. Position the element in which the map will appear.

        <div id="myMap"></div>

1. Use Livefyre.require to construct the component.

        Livefyre.require(['livefyre-map'], function(LivefyreMap) {
            var map = new LivefyreMap({
                collection: {
                    "network": "livefyre.com",
                    "siteId": "290596",
                    "articleId": "172",
                    "environment": "qa-ext.livefyre.com"
                },
                el: document.getElementById("myMap")
            });
        });


## Map Customization
The default center point, zoom level, and appearance of map tiles can be
configured with the ```leafletMapOptions``` option.

### Default center point
To set the default center point of the map, specify the lat/lon coordinate in the ```leafletMapOptions```:

        var view = new LivefyreMap({
            collection: {```...```},
            el: document.getElementById("myMap"),
            leafletMapOptions: {
                center: [37.774929499038386, -122.41941549873445]
            }
        });

### Default zoom level
To set the default zoom level of the map, specify the zoom level in the ```leafletMapOptions```:

        var view = new LivefyreMap({
            collection: {```...```},
            el: document.getElementById("myMap"),
            leafletMapOptions: {
                zoom: 4
            }
        });

### Map Tile theme
Out of the box, the map tiles are powered by [Mapbox](http://www.mapbox.com). To change the appearance of map tiles, specify ```mapboxTileOptions``` option:

        var view = new LivefyreMap({
            collection: {```...```},
            el: document.getElementById("myMap"),
            mapboxTileOptions: {
                mapId: 'myuser.map-0l53fhk2',
                format: 'jpg70',
                accessToken: 'XXXXXX'
            }
        });

  **mapId**: The Map ID of your Mapbox Studio project.
   
  **format:** The [Mapbox image format](https://www.mapbox.com/developers/api/maps/#format) your tiles should use.
   
  **accessToken:** Your [Mapbox public access token](https://www.mapbox.com/developers/api/#access-tokens).

To use a custom map tiles, [create a Mapbox account](https://www.mapbox.com/plans/).

Specifying a [Mapbox public access token](https://www.mapbox.com/developers/api/#access-tokens) will use the latest verison (v4) of the Mapbox API. This is required when using a Mapbox account created after January 2015. If your Mapbox account was created before then, your project has access to v3 of Mapbox's API which does not require an access token, though we recommend specifying an access token in case v3 is deprecated in the future.

## Local Development

Instead of using a built version of livefyre-map from Livefyre's CDN, you may wish to fork, develop on the repo locally, or include it in your existing JavaScript application.

Clone this repo

    git clone https://github.com/Livefyre/livefyre-map

Development dependencies are managed by [npm](https://github.com/isaacs/npm), which you should install first.

With npm installed, install livefyre-map's dependencies. This will also download [Bower](https://github.com/bower/bower) and use it to install browser dependencies.

    cd livefyre-map
    npm install

This repository's package.json includes a helpful script to launch a web server for development

    npm start

You can now visit [http://localhost:8080/](http://localhost:8080/) to see an example feed loaded via RequireJS.

### Jasmine Tests
To see Jasmine tests:

    npm run test
    
# StreamHub

[Livefyre StreamHub](http://www.livefyre.com/streamhub/) is used by the world's biggest brands and publishers to power their online Content Communities. StreamHub turns your site into a real-time social experience. Curate images, videos, and Tweets from across the social web, right into live blogs, chats, widgets, and dashboards. Want StreamHub? [Contact Livefyre](http://www.livefyre.com/contact/).
