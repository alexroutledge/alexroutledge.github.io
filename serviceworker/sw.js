self.addEventListener('fetch', function(event) {
  if (/\.jpg$/.test(event.request.url)) {
    event.respondWith(
      fetch('https://www.google.co.uk/test.gif', {
        mode: 'no-cors'
      })
    );
  }
});
