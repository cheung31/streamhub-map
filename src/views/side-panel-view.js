define([
    'hgn!streamhub-map/views/templates/side-panel',
    'view',
    'inherits'
], function (
    SidePanelTemplate,
    View,
    inherits
) {

    var SidePanelView = function (opts) {
        opts = opts || {};

        View.call(this, opts);
    };
    inherits(SidePanelView, View);

    SidePanelView.prototype.elTag = 'div';
    SidePanelView.prototype.elClass = 'hub-map-side-panel';
    SidePanelView.prototype.template = SidePanelTemplate;

    return SidePanelView;
});
