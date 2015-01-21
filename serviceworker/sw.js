importScripts("/serviceworker/cache-polyfill.js");

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.create('v1').then(function(cache) {
      return cache.add(
        '/serviceworker/',
        '/serviceworker/test.css',
        '/serviceworker/test2.css'
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  var cachedResponse = caches.match(event.request).catch(function() {
    return event.default().then(function(response) {
      return caches.get('v1').then(function(cache) {
        cache.put(event.request, response.clone());
        return response;
      });  
    });
  }).catch(function() {
    return caches.match('/sw-test/gallery/myLittleVader.jpg');
  });
  event.respondWith(cachedResponse);
});
