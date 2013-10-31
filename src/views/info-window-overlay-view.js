define([
    'streamhub-map/views/overlay-view',
    'hgn!streamhub-map/templates/info-window',
    'inherits'
],
function (OverlayView, InfoWindowTemplate, inherits) {

    var InfoWindowView = function (opts) {
        opts = opts || {};
        this._visible = false;

        OverlayView.call(this, opts);
        this.setElement(this.template());
    };
    inherits(InfoWindowView, OverlayView);

    InfoWindowView.prototype.template = InfoWindowTemplate;

    InfoWindowView.prototype.setElement = function (element) {
        if (element instanceof $) {
            element = element[0];
        }
        this.el = element;
        this.$el = $(element);

        if (this.elClass) {
            this.$el.addClass(this.elClass);
        }

        return this;
    };

    InfoWindowView.prototype.render = function () {
        $(this._mapEl).append(this.$el);
        this.show();
    };

    InfoWindowView.prototype.show = function () {
        this.$el.show();
        this._visible = true;
    };

    InfoWindowView.prototype.hide = function () {
        this.$el.hide();
        this._visible = false;
    };

    InfoWindowView.prototype.isVisible = function () {
        return this._visible;
    };

    InfoWindowView.prototype.position = function (target) {
        var clientRect = target.getBoundingClientRect();
        this.$el.css({
            'top': clientRect.top+'px',
            'left': clientRect.left+'px'
        });
    };

    return InfoWindowView;
});
