$.widget("fresca.zoom", {
	_create: function () {
		var self = this,
			element = this.element;
		element.wrap('<div id="main_image_container" style="position:relative; overflow:hidden; width:390px; height:390px;"></div>');
		$('#main_image_container').hover(function(){
			self._zoomMarkup(element);
		}, function(){
			self._destroy();
		});
	},
	_zoomMarkup: function (element) {
		var zoomImg = element.attr('src').replace('large', 'zoom');
		$('#main_image_container').append('<div id="zoom_box"><img id="zoomed_image" src="' + zoomImg + '" /></div>');
		$('#zoomed_image').attr('width', 1000).attr('height', 1000);
		$('#zoom_box').width(element.width()).height(element.height()).css({'position':'absolute', 'top':'0', 'left':'0', 'overflow':'hidden', 'cursor': 'crosshair'});
		this._trackZoom();
	},
	_trackZoom: function () {
		var cx = ($('#zoomed_image').width() - $('#zoom_box').width()) / $('#zoom_box').width(),
			cy = ($('#zoomed_image').height() - $('#zoom_box').height()) / $('#zoom_box').height();
		$('#zoom_box').mousemove(function (e) {
			var x = e.pageX - $('#zoom_box').offset().left,
				y = e.pageY - $('#zoom_box').offset().top;
			x = -cx * x;
			y = -cy * y;
			$('#zoomed_image').css({left:x, top:y, position:'absolute'});
		});
	},
	_destroy: function () {
		$('#zoom_box').remove();
	}
});
// FRESCA LIBRARY READ ME
// Creates your namespace, if necessary (jQuery.fresca) | Encapsulated class (jQuery.fresca.zoom.prototype) | Extends jQuery prototype (jQuery.fn.zoom) | Merges defaults with user-supplied options | Stores plugin instance in .data() | Methods accessible via string - plugin( "foo" ) - or directly - .foo() | Prevents against multiple instantiation | Evented structure for handling setup, teardown, option changes | Easily expose callbacks: ._trigger( "event" ) | Sane default scoping (What is this?) | Free pseudoselector! $( ":fresca-zoom" ) | Inheritance! Widgets can extend from other widgets

// ZOOM READ ME
// The jQuery.fresca namespace will automatically be created if it doesn't exist
// These options will be used as defaults
// Create a private method
// first we need to initiate
// here we determine if the zoom is iniated on click or hover...
// create the markup and scroll
// Use the destroy method to reverse everything your plugin has applied