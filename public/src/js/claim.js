var openClaimFormBtn = document.querySelector('#open-claim-form-btn');
var closeClaimFormBtn = document.querySelector('#close-claim-form-btn');
var claimFormArea = document.querySelector('#create-claim');
var claimForm = document.querySelector('#claim-form');

var locationBtn = document.querySelector('#location-btn');
var locationSpinner = document.querySelector('#location-spinner');
var fetchedLocation = { lat: 0, long: 0 };

var nameInput = document.querySelector('#claimer_name');
var addressInput = document.querySelector('#claimer_address');
var detailsLossInput = document.querySelector('#claimer_loss');
var sendClaimBtn = document.querySelector('#send-claim-btn');


// Click floating button "+" to open claim form, init location
function openClaimForm() {
	setTimeout(function() {
		claimFormArea.style.transform = 'translateY(0)';
	}, 1);

	if (deferredPrompt) {
		deferredPrompt.prompt();
		deferredPrompt.userChoice.then(function(choice){
			console.log(choice.outcome);
		});
		deferredPrompt = null;
	}

	initLocation();
}

openClaimFormBtn.addEventListener('click', openClaimForm);

// Close & reset claim form
function closeClaimForm() {
	setTimeout(function() {
		claimFormArea.style.transform = 'translateY(100vh)';
		claimForm.reset();
	}, 1);
	
	
	locationBtn.style.display = 'inline';
	locationSpinner.style.display = 'none';
}

closeClaimFormBtn.addEventListener('click', closeClaimForm);


// Get location
locationBtn.addEventListener('click', function() {
	locationBtn.style.display = 'none';
	locationSpinner.style.display = 'block';

	if (!('geolocation' in navigator)) {
		return;
	}

	navigator.geolocation.getCurrentPosition(
		function(position) {
			locationBtn.style.display = 'inline';
			locationSpinner.style.display = 'none';
			fetchedLocation = { lat: position.coords.latitude, long: position.coords.longitude };
			reverseLocation(fetchedLocation.lat, fetchedLocation.long);
			document.querySelector('#address_container').classList.add('is-focused');
		},
		function(err) {
			locationBtn.style.display = 'inline';
			locationSpinner.style.display = 'none';
			fetchedLocation = { lat: 0, long: 0 };
		},
		{ timeout: 7000 });
});

// Check if we have Geolocation
function initLocation() {
	if (!('geolocation' in navigator)) {
		locationBtn.style.display = none;
	}
}

// Fetch location 
function reverseLocation(lat, long) {
	fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + long)
	.then(function(res) {
		return res.clone();
	})
	.then(function(resClone) {
		return resClone.json();
	})
	.then(function(data) {
		console.log(data);
		addressInput.value = data.address.city + ', ' + data.address.country;
	});
}

function sendClaim() {
	var date = new Date();
	var month = date.getMonth() + 1;
	fetch('https://us-central1-pwa-life-care.cloudfunctions.net/addClaim', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: JSON.stringify({
			id: date.toISOString(),
			name: nameInput.value,
			address: addressInput.value,
			details_loss: detailsLossInput.value,
			raw_location: fetchedLocation,
			date: date.getDate() + '.' + month + '.' + date.getFullYear()
		})
	})
	.then(function(res) {
		console.log('Data sent', res);
	});
}

claimForm.addEventListener('submit', function() {
	event.preventDefault();

	if (nameInput.value.trim() === '' || addressInput.value.trim() === '') {
		alert('Please enter valid data!');
		return;
	}

	closeClaimForm();

	if ('serviceWorker' in navigator && 'SyncManager' in window) {
		navigator.serviceWorker.ready.then(function(sw) {
			var date = new Date();
			var claim = {
				id: date.toISOString(),
				name: nameInput.value,
				address: addressInput.value,
				details_loss: detailsLossInput.value,
				raw_location: fetchedLocation,
				date: date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear()
			};
			writeData('sync-claims', claim)
				.then(function() {
					return sw.sync.register('sync-new-claim');
				})
				.then(function() {
					var notification = document.querySelector('.mdl-js-snackbar');
					var data = {
						message: 'Claim was sync for adding later.',
						timeout: 5000
					};
					notification.MaterialSnackbar.showSnackbar(data);
				})
				.catch(function(err){
					console.log(err); 
				});
		});
	} else {
		sendClaim(); 
	}
});
