$.widget('fresca.carousel', {
  defaults: function () {
    $.metadata.setType('html5');
    $.metadata.setType('attr', 'data-carousel');
    this.options = this.options || {};
    this.options = $.extend(this.options, $(this.element).metadata());
    this.options.$child = $(this.options.$child);
    return this.options;
  },
  next: function () {
    var _this = this;
    $(_this.element).trigger('carousel.next');
    _this.defaults().$child.filter(':last').after(_this.defaults().$child.filter(':first'));
  },
  previous: function () {
    var _this = this;
    $(_this.element).trigger('carousel.previous');
    _this.defaults().$child.filter(':first').before(_this.defaults().$child.filter(':last'));
  },
  horizontal: function (args) {
    var _this = this;
    $(_this.element).trigger('carousel.horizontal');
    _this.defaults().$parent.filter(_this.defaults().filter)[_this.defaults().method]({
      'left': _this.options.dimensions[args]
    }, _this.defaults().speed, function () {
      _this[args]();
      _this.defaults().$parent.css({
        'left': '-' + _this.options.width
      });
    });
  },
  vertical: function (args) {
    var _this = this;
    $(_this.element).trigger('carousel.vertical');
    _this.defaults().$parent.filter(_this.defaults().filter)[_this.defaults().method]({
      'top': _this.options.dimensions[args]
    }, _this.defaults().speed, function () {
      _this[args]();
      _this.defaults().$parent.css({
        'top': '-' + _this.options.height
      });
    });
  },
  _create: function () {
    var _this = this;
    $(_this.element).trigger('carousel.create');
    _this.previous();
    _this.defaults().$controls.on(_this.defaults().events, function (e) {
      $(_this.element).trigger('carousel.' + e.type);
      _this.options.width = _this.defaults().$child.outerWidth(true) * _this.defaults().multiple;
      _this.options.height = _this.defaults().$child.outerHeight(true) * _this.defaults().multiple;
      _this.options.dimensions = {
        next: parseInt(_this.defaults().$parent.css(_this.defaults().direction)) - _this.options.width,
        previous: parseInt(_this.defaults().$parent.css(_this.defaults().direction)) + _this.options.width,
      };
      args = $(this).data('carousel-controls');
      direction = _this.defaults()['orientation'];
      _this[direction](args);
    });
  },
  _destroy: function () {
    $.Widget.prototype.destroy.call(this);
  }
});