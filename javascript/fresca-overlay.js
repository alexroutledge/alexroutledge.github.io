$.widget('fresca.overlay', {
  defaults: function () {
    var _this = this;
    _this.options = _this.options || $(_this.element).metadata();
    return _this.options;
  },
  open: function() {
    var _this = this;
    $(_this.element).trigger('overlay.open');
    $deferredCollection = [
      $.ajax(_this.defaults().data)
    ];
    $.when.apply($, $deferredCollection).then(function(data) {
      $(_this.element).trigger('overlay.before-load');
      var data = Mustache.render(_this.defaults().template, {content:data});
      $(document.body).append(data);
      $(_this.element).trigger('overlay.after-load');
      $('[data-close-overlay]', '[data-overlay-container]').on('click', function() {
        _this.close();
      });
    });
    return false;
  },
  close: function() {
    var _this = this;
    $(_this.element).trigger('overlay.close');
    $('[data-overlay-container]').fadeOut('normal', function() {
      $(_this.element).trigger('overlay.before-remove');
      $(this).remove();
      $(_this.element).trigger('overlay.after-remove');
    });
    return false;
  },
  _create: function () {
    var _this = this;
    $(_this.element).trigger('overlay.create');
    $(_this.element).on('click', function() {
      _this.open();
    })
  }
});