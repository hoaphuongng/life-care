var openClaimFormBtn = document.querySelector('#open-claim-form-btn');
var closeClaimFormBtn = document.querySelector('#close-claim-form-btn');
var claimFormArea = document.querySelector('#create-claim');
var claimForm = document.querySelector('#claim-form');



// Click floating button "+" to open claim form 
function openClaimForm() {
	claimFormArea.style.transform = 'translateY(0)';

	if (deferredPrompt) {
		deferredPrompt.prompt();
		deferredPrompt.userChoice.then(function(choice){
			console.log(choice.outcome);
		});
		deferredPrompt = null;
	}
}

openClaimFormBtn.addEventListener('click', openClaimForm);

// Close & reset claim form
function closeClaimForm() {
	claimFormArea.style.transform = 'translateY(100vh)';
	claimForm.reset();
}

closeClaimFormBtn.addEventListener('click', closeClaimForm);