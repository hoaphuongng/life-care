importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute([]);

workbox.routing.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/, 
	workbox.strategies.staleWhileRevalidate({
		cacheName: 'google-fonts'
	}));

workbox.routing.registerRoute('https://code.getmdl.io/1.3.0/material.teal-red.min.css', 
	workbox.strategies.staleWhileRevalidate({
		cacheName: 'material-css'
	}));

workbox.routing.registerRoute(/.*(?:firebasestorage\.googleapis)\.com.*$/, 
	workbox.strategies.staleWhileRevalidate({
		cacheName: 'claim-images'
	}));

