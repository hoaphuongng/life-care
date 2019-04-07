self.addEventListener('install', function(event) {
	console.log('Installing SW');
});

self.addEventListener('activate', function(event) {
	console.log('Activate');
	return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
	event.respondWith(fetch(event.request));
});