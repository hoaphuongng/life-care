importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");
importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute([
  {
    "url": "404.html",
    "revision": "f50e79252e2654232e581b64a29151e3"
  },
  {
    "url": "index.html",
    "revision": "aed044bcbe104bcb63fac13604fcd56a"
  },
  {
    "url": "manifest.json",
    "revision": "a4e6989f1461b8f604cfccbe60ae69f4"
  },
  {
    "url": "src/css/app.css",
    "revision": "930464e539e14a3aeb5e2dd3df59547c"
  },
  {
    "url": "src/css/claim-history.css",
    "revision": "bb7936d59c2699f260df5c588b3a2759"
  },
  {
    "url": "src/css/claim.css",
    "revision": "b5c1f9745991df1e782309f716666871"
  },
  {
    "url": "src/js/app.js",
    "revision": "ea372e51fa40765d01a9366920e5a53d"
  },
  {
    "url": "src/js/claim-history.js",
    "revision": "6a8321b00d3bb5b20786b8af73cfc32c"
  },
  {
    "url": "src/js/claim.js",
    "revision": "7c6b27355409bc2353c7217c186c229f"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "6b82fbb55ae19be4935964ae8c338e92"
  },
  {
    "url": "src/js/idb.js",
    "revision": "017ced36d82bea1e08b08393361e354d"
  },
  {
    "url": "src/js/material.js",
    "revision": "60f3ee61721d5bbac709fad9c239f2ac"
  },
  {
    "url": "src/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "src/js/utility.js",
    "revision": "c6230eb690ec3c43a88999488c8400f5"
  },
  {
    "url": "sw-base.js",
    "revision": "77f891d1690284181d7efc67eee2e59b"
  },
  {
    "url": "sw.js",
    "revision": "8959338891ba2fe4dbdbd3cd0aa507c5"
  },
  {
    "url": "src/images/students.jpg",
    "revision": "81bf9519d8b1bce22026e347c10531d2"
  },
  {
    "url": "src/images/icons/logo-icon-16x16.png",
    "revision": "df4bf53a676a57443452a39a882362bd"
  },
  {
    "url": "src/images/icons/logo-icon-256x256.png",
    "revision": "8efc72f37aaf0fd61941dfd75868dc10"
  }
]);

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

self.addEventListener('push', function(event) {
	var notificationData = { title: 'New!', content: 'Something', openUrl: '/'};

	if (event.data) {
		notificationData = JSON.parse(event.data.text());
	}

	var options = {
		body: notificationData.content,
		icon: '/src/images/icons/logo-icon-64x64.png',
		badge: '/src/images/icons/logo-icon-32x32.png',
		tag: 'new-claim-push-notification',
		renotify: true,
		data: {
			url: notificationData.openUrl
		}
	};
	event.waitUntil(
		self.registration.showNotification(notificationData.title, options)
	);
});

self.addEventListener('notificationclick', function(event) {
	var notification = event.notification;
	if (notification.tag === 'new-claim-push-notification') {
		event.waitUntil(
			clients.matchAll().then(function(clis) {
				var client = clis.find(function(c) {
					return c.visibilityState === 'visible';
				});

				if (client !== undefined) {
					client.navigate(notification.data.url);
					client.focus();
				} else {
					clients.openWindow(notification.data.url);
				}
				notification.close();
			})
		);
	} 
	// else if (notification.tag === 'confirm-turn-on-notification') {}
});
