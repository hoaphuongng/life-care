var deferredPrompt;

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