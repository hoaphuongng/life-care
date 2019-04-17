importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");
importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute([]);

workbox.routing.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/, 
	workbox.strategies.staleWhileRevalidate({
		cacheName: 'google-fonts',
		plugins: [
			new workbox.expiration.Plugin({
				maxEntries: 3,
				maxAgeSeconds: 60 * 60 * 24 * 30
			}),
		]
	}));

workbox.routing.registerRoute('https://code.getmdl.io/1.3.0/material.teal-red.min.css', 
	workbox.strategies.staleWhileRevalidate({
		cacheName: 'material-css',
		plugins: [
			new workbox.expiration.Plugin({
				maxEntries: 3,
				maxAgeSeconds: 60 * 60 * 24 * 30
			}),
		]
	}));

workbox.routing.registerRoute(/.*(?:firebasestorage\.googleapis)\.com.*$/, 
	workbox.strategies.staleWhileRevalidate({
		cacheName: 'claim-images',
		plugins: [
			new workbox.expiration.Plugin({
				maxEntries: 3,
				maxAgeSeconds: 60 * 60 * 24 * 30
			}),
		]
	}));

workbox.routing.registerRoute('https://pwa-life-care.firebaseio.com/claims.json', function(args) {
	return fetch(args.event.request)
		.then(function(res) {
			var clonedRes = res.clone();
			clearAllData('claims')
				.then(function () {
					return clonedRes.json();
				})
				.then(function (data) {
					for (var key in data) {
						writeData('claims', data[key]);
					}
				});
			return res;
		});
});

workbox.routing.registerRoute(function(routeData) {
	return (routeData.event.request.headers.get('accept').includes('text/html'));
}, function(args) {
	return caches.match(args.event.request)
		.then(function(response) {
			if (response) {
				return response;
			} else {
				return fetch(args.event.request).then(function(res) {
					return caches.open('dynamic').then(function(cache) {
						cache.put(args.event.request.url, res.clone());
						return res;
					})
				})
				.catch(function(err) {
					return caches.match('/404.html').then(function(res) {
						return res;
					});
				});
			}
	})
});

self.addEventListener('sync', function(event) {
	if (event.tag === 'sync-new-claim') {
		event.waitUntil(
			readAllData('sync-claims').then(function(data) {
				for (var dt of data) {
					fetch('https://us-central1-pwa-life-care.cloudfunctions.net/addClaim', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Accept': 'application/json',
						},
						body: JSON.stringify({
							id: dt.id,
							name: dt.name,
							address: dt.address,
							details_loss: dt.details_loss,
							raw_location: dt.raw_location,
							date: dt.date
						})
					})
					.then(function(res) {
						if (res.ok) {
							res.json().then(function(resData) {
								deleteItemFromData('sync-claims', resData.id);
								console.log(resData);
							});
						}
					})
					.catch(function(err) {
						console.log('Error while sending data', err);
					});
				}
			})
		);
	}
});