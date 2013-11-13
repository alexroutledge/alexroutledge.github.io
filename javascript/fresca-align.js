$.widget('fresca.align', {
  defaults: function () {
    $.metadata.setType('html5');
    $.metadata.setType('attr', 'data-align');
    this.options = this.options || {};
    this.options = $.extend(this.options, $(this.element).metadata());
    return this.options;
  },
  width: function (elements) {
    var _this = this;
    $(_this.element).trigger('align.width');
    elements.css({
      'width': 'auto'
    });
    positionLeft = elements.map(function () {
      return $(this).offset().left;
    }).get().reverse();
    $.each($.unique(positionLeft), function (e) {
      positionLeft = elements.map(function () {
        return $(this).offset().left;
      }).get().reverse();
      var left = $.unique(positionLeft)[e];
      var filteredElements = elements.filter(function () {
        return ($(this).offset().left == left)
      });
      widths = filteredElements.map(function () {
        return $(this).width();
      }).get();
      maxWidth = Math.max.apply(null, widths);
      filteredElements.filter(function () {
        return (maxWidth >= $(this).width())
      }).css({
        'width': maxWidth + 'px'
      });
    });
  },
  height: function (elements) {
    var _this = this;
    $(_this.element).trigger('align.height');
    elements.css({
      'height': 'auto'
    });
    positionTop = elements.map(function () {
      return $(this).offset().top;
    }).get().reverse();
    $.each($.unique(positionTop), function (e) {
      positionTop = elements.map(function () {
        return $(this).offset().top;
      }).get().reverse();
      var top = $.unique(positionTop)[e];
      var filteredElements = elements.filter(function () {
        return ($(this).offset().top == top)
      });
      heights = filteredElements.map(function () {
        return $(this).height();
      }).get();
      maxHeight = Math.max.apply(null, heights);
      filteredElements.filter(function () {
        return (maxHeight >= $(this).height())
      }).css({
        'height': maxHeight + 'px'
      });
    });
  },
  _create: function () {
    var _this = this;
    direction = _this.defaults().direction;
    _this[direction]($(_this.element));
  },
  _destroy: function () {
    $.Widget.prototype.destroy.call(this);
  }
});