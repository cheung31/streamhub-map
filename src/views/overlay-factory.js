define([
    'streamhub-map/point',
    'streamhub-map/content/content-point',
    'streamhub-map/collection/collection-point',
    'streamhub-map/views/dot-marker-view',
    'streamhub-map/views/content-marker-view',
    'streamhub-map/views/clustered-content-marker-view',
    'streamhub-map/views/symbol-view'
],
function (
    Point,
    ContentPoint,
    CollectionPoint,
    DotMarkerView,
    ContentMarkerView,
    ClusteredContentMarkerView,
    SymbolView
) {

    var OverlayViewFactory = function (opts) {
        opts = opts || {};
        this._mapContext = opts.mapContext;
    };

    OverlayViewFactory.prototype.overlayRegistry = [
        //{ type: Point, view: ContentMarkerView },
        { type: Array, view: ClusteredContentMarkerView },
        { type: ContentPoint, view: ContentMarkerView },
        { type: CollectionPoint, view: DotMarkerView }
    ];

    OverlayViewFactory.prototype._getViewTypeForPoint = function (point) {
        for (var i=0; i < this.overlayRegistry.length; i++) {
            var current = this.overlayRegistry[i];
            if (!(point instanceof current.type)) {
                continue;
            }

            if (point instanceof CollectionPoint && point._collection.heatIndex !== undefined) {
                return SymbolView;
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
        var OverlayViewType = this._getViewTypeForPoint(point);
        return new OverlayViewType(point, { mapContext: this._mapContext });
    };

    return OverlayViewFactory;
});
