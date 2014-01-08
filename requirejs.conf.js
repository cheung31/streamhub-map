requirejs.config({
  baseUrl: '/',
  include: [
    'streamhub-wall',
    'streamhub-multiview',
    'streamhub-map/views/solar-terminator-view',
    'streamhub-map/collection/collection-map-view',
    'streamhub-map/content/content-map-view',
    'streamhub-hot-collections-tests/mocks/streams/mock-hot-collections',
    'json!streamhub-hot-collections-tests/mocks/clients/hot-collections-response.json'],
  paths: {
    jquery: 'lib/jquery/jquery',
	jasmine: 'lib/jasmine/lib/jasmine-core/jasmine',
    'jasmine-html': 'lib/jasmine/lib/jasmine-core/jasmine-html',
    'jasmine-jquery': 'lib/jasmine-jquery/lib/jasmine-jquery',
    text: 'lib/requirejs-text/text',
    hgn: 'lib/requirejs-hogan-plugin/hgn',
    hogan: 'lib/hogan/web/builds/2.0.0/hogan-2.0.0.amd',
    json: 'lib/requirejs-plugins/src/json',
    base64: 'lib/base64/base64',
    'event-emitter': 'lib/event-emitter/src/event-emitter',
    inherits: 'lib/inherits/inherits',
    d3: 'lib/d3/d3',
    colorbrewer: 'lib/colorbrewer/colorbrewer',
    topojson: 'lib/topojson/topojson'
  },
  packages: [{
    name: "streamhub-sdk",
    location: "lib/streamhub-sdk/src/"
  },{
    name: "streamhub-sdk/auth",
    location: "lib/streamhub-sdk/src/auth"
  },{
    name: "streamhub-sdk/collection",
    location: "lib/streamhub-sdk/src/collection"
  },{
    name: "streamhub-sdk/content",
    location: "lib/streamhub-sdk/src/content"
  },{
    name: "streamhub-sdk/modal",
    location: "lib/streamhub-sdk/src/modal"
  },{
    name: "streamhub-sdk-tests",
    location: "lib/streamhub-sdk/tests/"
  },{
    name: "stream",
    location: "lib/stream/src"
  },{
	name: "streamhub-map",
  	location: "src"
  },{
    name: "streamhub-map-resources",
    location: "src/resources/"
  },{
    name: "streamhub-hot-collections",
    location: "lib/streamhub-hot-collections/src/"
  },{
    name: "streamhub-hot-collections-tests",
    location: "lib/streamhub-hot-collections/tests/"
  },{
    name: "streamhub-metrics",
    location: "lib/streamhub-metrics/src/"
  },{
    name: "streamhub-multiview",
    location: "lib/streamhub-multiview/src/"
  },{
    name: "streamhub-wall",
    location: "lib/streamhub-wall/src/"
  },{
    name: "view",
    location: "lib/view/src",
    main: "view"
  },{
    name: 'd3-plugins-geo-tile',
    location: 'lib/d3-plugins/geo/tile/',
    main: 'tile.js'
  },{
    name: 'leaflet',
    location: 'lib/leaflet/dist/',
    main: 'leaflet-src'
  }],
  shim: {
    jasmine: {
      exports: 'jasmine'
    },
    'jasmine-html': {
      deps: ['jasmine'],
      exports: 'jasmine'
    },
    'jasmine-jquery': {
      deps: ['jquery', 'jasmine']
    },
    jquery: {
        exports: '$'
    },
    d3: {
        exports: 'd3'
    },
    'd3-plugins-geo-tile': {
        deps: ['d3'],
        exports: 'd3.geo.tile'
    },
    colorbrewer: {
        exports: 'colorbrewer'
    },
    topojson: {
        exports: 'topojson'
    }
  },
  urlArgs: "_=" +  (new Date()).getTime()
});
