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
        this._subView = opts.subView || null;

        View.call(this, opts);
    };
    inherits(SidePanelView, View);

    SidePanelView.prototype.elTag = 'div';
    SidePanelView.prototype.elClass = 'hub-map-side-panel';
    SidePanelView.prototype.template = SidePanelTemplate;


    /**
     * Creates DOM structure of gallery to be displayed
     */
    SidePanelView.prototype.render = function () {
        View.prototype.render.call(this);
        this._subView.setElement(this.$el);
        this._subView.render();
    };

    return SidePanelView;
});
