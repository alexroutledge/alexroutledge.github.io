self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});
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
