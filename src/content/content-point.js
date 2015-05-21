'use strict';

var inherits = require('inherits');
var Point = require('livefyre-map/point');

function ContentPoint(content, opts) {
  opts = opts || {};

  if (content === undefined) {
    throw new Error('ContentPoint expected a Content instance as its first argument');
  }
  this._content = content;

  opts.lat = content.geocode.latitude;
  opts.lon = content.geocode.longitude;

  Point.call(this, opts);
};
inherits(ContentPoint, Point);

ContentPoint.prototype.getContent = function () {
  return this._content;
};

module.exports = ContentPoint;
