define([
    'streamhub-map',
    'streamhub-map/content/content-point',
    'inherits'],
function (MapView, ContentPoint, inherits) {

    var ContentMapView = function (opts) {
        MapView.call(this, opts);
    };
    inherits(ContentMapView, MapView);

    ContentMapView.prototype.add = function (content) {
        if (! content._annotations.geocode || ! content._annotations.geocode.latitude || ! content._annotations.geocode.longitude ) {
            return;
        }

        // Adapt Content to ContentPoint
        var contentPoint = new ContentPoint(content);

        MapView.prototype.add.call(this, contentPoint);
    };

    ContentMapView.prototype.setElement = function (el) {
        MapView.prototype.setElement.apply(this, arguments);

        var self = this;
        this.$el.on('focusDataPoint.hub', function (e, dataPoint) {
            console.log(dataPoint);
            self._displayDataPointDetails(dataPoint);
        });
    };

    ContentMapView.prototype._displayDataPointDetails = function (dataPoint) {
        var content = dataPoint.getContent();
        var contentView = this.getContentView(content);
        if (! this.modal) {
            if (contentView &&
                contentView.attachmentsView &&
                typeof contentView.attachmentsView.focus === 'function') {
                contentView.attachmentsView.focus(context.attachmentToFocus);
            }
            return;
        }
        this.modal.show(content, { attachment: content.attachments[0] });
    };

    return ContentMapView;
});
