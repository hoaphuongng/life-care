
var CACHE_STATIC_NAME = 'static-v1';
var CACHE_DYNAMIC_NAME = 'dynamic-v1';

var STATIC_FILES = [
	'/',
	'/index.html',
	'/src/js/app.js',
	'/src/js/claim.js',
	'/src/css/app.css',
	'/src/css/claim.css',
	'/src/images/students.jpg',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'https://code.getmdl.io/1.3.0/material.teal-red.min.css',
	'https://fonts.googleapis.com/css?family=Open+Sans',
	'https://storage.googleapis.com/code.getmdl.io/1.0.6/material.min.js'
];


self.addEventListener('install', function(event) {
	console.log('Installing SW');
	event.waitUntil(
		caches.open(CACHE_STATIC_NAME)
		.then(function(cache) {
			cache.addAll(STATIC_FILES);
		})
	);
});

self.addEventListener('activate', function(event) {
	console.log('Activate');
	return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
	event.respondWith(fetch(event.request));
});