var deferredPrompt;
var notificationBtns = document.querySelectorAll('.turn-on-notifications');

if (!window.Promise) {
	window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/service-worker.js').then(function() {
		console.log('Service Worker registered');
	});
}

window.addEventListener('beforeinstallprompt', function(event) {
	console.log('fired');
	event.preventDefault();
	deferredPrompt = event;
});

if ('Notification' in window) {
	for (var i = 0; i < notificationBtns.length; i++) {
		notificationBtns[i].style.display = 'inline-block';
		notificationBtns[i].addEventListener('click', askNotiPermission);
	}
}

function displayNotification() {
	if ('serviceWorker' in navigator) {
		var options = {
			body: 'You will get a notification if there is a new claim added.',
			icon: '/src/images/icons/logo-icon-32x32.png',
			image: '/src/images/students.jpg',
			badge: '/src/images/icons/logo-icon-32x32.png',
			dir: 'ltr',
			lang: 'en-US',
			vibrate: [100, 20, 50],
			tag: 'confirm-turn-on-notification',
			renotify: true,
			actions: [{
				action: 'confirm',
				title: 'OK',
				icon: '/src/images/icons/tick.png'
			},
			{
				action: 'cancel',
				title: 'Cancel'
			}]
		};
		navigator.serviceWorker.ready.then(function(sw) {
			sw.showNotification('Successfully subscribed', options);
		});
	} 
}

function askNotiPermission() {
	Notification.requestPermission(function(res) {
		// User choice can be granted, default or denied
		if (res !== 'granted') {
			console.log('Cancel permission');
		} else {
			// displayNotification();
			configureSubscription();
		}
	});
}

function configureSubscription() {
	if (!('serviceWorker' in navigator)) {
		return;
	}

	var swreg;
	navigator.serviceWorker.ready.then(function(reg) {
		swreg = reg;
		return reg.pushManager.getSubscription();
	})
	.then(function(sub) {
		if (sub === null) {
			// Create a new subscription
			var vapidPublicKey = 'BHP6PXUQ_PrF8prSnf1Jo2OXenA15EhXG5WBcogE7eKdbd7H185eiV7r5XRhUaLRntQ8A0x_YV_9gvAC1QmYWHM';
			var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
			return swreg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: convertedVapidPublicKey
			});
		} else {
			console.log('Already subscription', sub);
		}
	})
	.then(function(newSub) {
		return fetch('https://us-central1-pwa-life-care.cloudfunctions.net/addSubscription', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: JSON.stringify(newSub)
		})
	})
	.then(function(res) {
		if (res.ok) {
			displayNotification();
		}
	})
	.catch(function(err) {
		console.log(err);
	});
}
