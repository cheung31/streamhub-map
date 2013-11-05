define([
    'streamhub-map/collections/collection-point',
    'streamhub-map/views/marker-view'
],
function (CollectionPoint, MarkerView) {

    var OverlayViewFactory = function (opts) {
        opts = opts || {};
        this._mapContext = opts.mapContext;
    };

    OverlayViewFactory.prototype.overlayRegistry = [
        { type: CollectionPoint, view: MarkerView }
    ];

    OverlayViewFactory.prototype._getViewTypeForPoint = function (point) {
        for (var i=0; i < this.overlayRegistry.length; i++) {
            var current = this.overlayRegistry[i];
            if (!(point instanceof current.type)) {
                continue;
            }

            var currentType;
            if (current.view) {
                currentType = current.view;
            } else if (current.viewFunction) {
                currentType = current.viewFunction(content);
            }
            return currentType;
        }
    };

    OverlayViewFactory.prototype.createOverlayView = function (point) {
        var OverlayViewType = this._getViewTypeForOverlay(point);
        return new OverlayViewType({ mapContext: this._mapContext });
    };

    return OverlayViewFactory;
});
