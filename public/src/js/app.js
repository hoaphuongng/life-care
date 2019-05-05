var deferredPrompt;
var notificationBtns = document.querySelectorAll('.turn-on-notifications');
var logoutContainer = document.querySelector('.logout-container');

var firebaseConfig = {
	apiKey: "AIzaSyB9sK45SEchVGRSGi9qGVB0651VDNh7Gdg",
	authDomain: "pwa-life-care.firebaseapp.com",
	databaseURL: "https://pwa-life-care.firebaseio.com",
	projectId: "pwa-life-care",
	storageBucket: "pwa-life-care.appspot.com",
	messagingSenderId: "643856345237",
	appId: "1:643856345237:web:31280a48ac028c9d"
};

firebase.initializeApp(firebaseConfig);

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

function displayLogout(email) {
	var loggedInText = document.createElement('p');
	loggedInText.textContent = 'Logged in as ' + email;
	logoutContainer.appendChild(loggedInText);

	var logOutBtn = document.createElement('button');
	logOutBtn.className = 'mdl-button mdl-js-button mdl-button--raised mdl-button--colored';
	logOutBtn.textContent = 'Log out';

	logoutContainer.appendChild(logOutBtn);

	logOutBtn.addEventListener('click', function() {
		firebase.auth().signOut().then(function() {
			logoutContainer.classList.add('hide');
		});
	});
}


firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		displayLogout(user.email);
		logoutContainer.classList.remove('hide');
		console.log('logged in');
	} 
});