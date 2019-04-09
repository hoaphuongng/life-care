var openClaimFormBtn = document.querySelector('#open-claim-form-btn');
var closeClaimFormBtn = document.querySelector('#close-claim-form-btn');
var claimFormArea = document.querySelector('#create-claim');
var claimForm = document.querySelector('#claim-form');

var addressInput = document.querySelector('#claimer_address');

var locationBtn = document.querySelector('#location-btn');
var locationSpinner = document.querySelector('#location-spinner');
var fetchedLocation = { lat: 0, long: 0 };

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
			fetchLocation(fetchedLocation.lat, fetchedLocation.long);
			document.querySelector('#manual-location').classList.add('is-focused');
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
function fetchLocation(lat, long) {
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