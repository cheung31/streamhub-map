define([
    'streamhub-sdk/modal',
    'inherits'
], function (
    ModalView,
    inherits
) {

    var SidePanelView = function (opts) {
        opts = opts || {};

        ModalView.call(this, opts);
    };
    inherits(SidePanelView, ModalView);

    SidePanelView.$el = $('<div class="hub-map-side-panels"></div>');
    SidePanelView.el = SidePanelView.$el[0];

    SidePanelView.prototype.elClass = ' hub-map-side-panel';

    return SidePanelView;
});
