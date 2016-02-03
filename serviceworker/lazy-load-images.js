// Listen to fetch events
self.addEventListener('fetch', function(event) {
  if (/\.gif$|.png$/.test(event.request.url)) {
  event.respondWith(
	  fetch('lazy-load.gif', {
		  mode: 'no-cors'
		  })
		);
  }
});
