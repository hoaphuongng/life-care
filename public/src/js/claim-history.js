var claimHistory = document.querySelector('#claim-history');

fetchClaim();

function showClaimHistory(claim, claimKey) {
	var claimCard = document.createElement('div');
	claimCard.className = 'claim-card mdl-card mdl-shadow--2dp';

	var dateContainer = document.createElement('div');
	dateContainer.className = 'mdl-card__supporting-text';
	var dateText = document.createElement('span');
	dateText.textContent = claim.date;
	claimCard.appendChild(dateContainer);
	dateContainer.appendChild(dateText);

	var addressContainer = document.createElement('div');
	addressContainer.className = 'mdl-card__title';
	var addressText = document.createElement('p');
	addressText.className = 'mdl-card__title-text';
	addressText.textContent = claim.address;
	claimCard.appendChild(addressContainer);
	addressContainer.appendChild(addressText);
	
	var nameContainer = document.createElement('div');
	nameContainer.className = 'mdl-card__supporting-text';
	var nameText = document.createElement('span');
	nameText.textContent = claim.name;
	claimCard.appendChild(nameContainer);
	nameContainer.appendChild(nameText);

	var detailsLossContainer = document.createElement('div');
	detailsLossContainer.className = 'mdl-card__actions mdl-card--border';
	var detailsLossText = document.createElement('p');
	detailsLossText.textContent = claim.details_loss;
	claimCard.appendChild(detailsLossContainer);
	detailsLossContainer.appendChild(detailsLossText);

	var deleteBtnContainer = document.createElement('div');
	deleteBtnContainer.className = 'mdl-card__menu';
	var deleteBtn = document.createElement('button');
	deleteBtn.className = 'mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect mdl-button--colored';
	var deleteIcon = document.createElement('i');
	deleteIcon.className = 'material-icons';
	deleteIcon.textContent = 'delete_forever';
	claimCard.appendChild(deleteBtnContainer);
	deleteBtnContainer.appendChild(deleteBtn);
	deleteBtn.appendChild(deleteIcon);
	deleteBtn.addEventListener('click', function() {
		deleteClaim(claimKey);
	});

	componentHandler.upgradeElement(claimCard);
	claimHistory.appendChild(claimCard);
}

function clearClaimHistory() {
	while(claimHistory.hasChildNodes()) {
		claimHistory.removeChild(claimHistory.lastChild);
	}
}

function updateUI(data, key) {
	clearClaimHistory();
	for (var i = 0; i < data.length; i++) {
		showClaimHistory(data[i], key[i]);
	}
}

function fetchClaim() {
	fetch('https://pwa-life-care.firebaseio.com/claims.json')
	.then(function(res) {
		return res.json();
	})
	.then(function(data) {
		var dataArray = [];
		var keyArray = [];
		for (var key in data) {
			dataArray.push(data[key]);
			keyArray.push(key);
		}
		updateUI(dataArray, keyArray);
	});
}


function deleteClaim(claim) {
	fetch('https://us-central1-pwa-life-care.cloudfunctions.net/deleteClaim', {
		method: 'delete',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: JSON.stringify({
			item: claim
		})
	})
	.then(function(res) {
		fetchClaim();
	});
}
