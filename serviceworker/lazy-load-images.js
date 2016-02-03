// Listen to fetch events
self.addEventListener('fetch', function(event) {
  event.respondWith(
	  fetch('lazy-load.gif', {
		  mode: 'no-cors'
		  })
		);
});
