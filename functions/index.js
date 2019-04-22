const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

var admin = require('firebase-admin');
var cors = require('cors')({ origin: true });
var webpush = require('web-push');

var serviceAccount = require("./pwa-life-care.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://pwa-life-care.firebaseio.com"
});

exports.addClaim = functions.https.onRequest((request, response) => {
	cors(request, response, () => {
		admin.database().ref('claims').push({
			id: request.body.id,
			name: request.body.name,
			address: request.body.address,
			details_loss: request.body.details_loss,
			raw_location: {
				lat: request.body.raw_location.lat,
				long: request.body.raw_location.long
			},
			date: request.body.date
		})
		.then(function() {
			webpush.setVapidDetails(
				"mailto:hoaphuong310596@gmail.com",
				"BHP6PXUQ_PrF8prSnf1Jo2OXenA15EhXG5WBcogE7eKdbd7H185eiV7r5XRhUaLRntQ8A0x_YV_9gvAC1QmYWHM",
				"aawh8bomXmF5wbbMDAMnfVr7K-jlyw90cFYXXcKf38g"
			);
			return admin.database().ref("subscriptions").once("value");
		})
		.then((subscriptions) => {
			subscriptions.forEach(function(sub) {
				var pushConfig = {
					endpoint: sub.val().endpoint,
					keys: {
						auth: sub.val().keys.auth,
						p256dh: sub.val().keys.p256dh
					}
				};

				webpush.sendNotification(
					pushConfig,
					JSON.stringify({
						title: "New Claim!",
						content: "A new claim has been added.",
						openUrl: "/claim-history"
					})
				)
				.catch(function(err) {
					console.log(err);
				});
			});
			return response.status(201).json({
				message: 'stored',
				id: request.body.id
			});
		})
		.catch((err) => {
			return response.status.status(500).json({
				error: err
			})
		});
	});
});

exports.deleteClaim = functions.https.onRequest((request, response) => {
	cors(request, response, () => {
		var key = request.body.item;
		admin.database().ref('claims').child(key).remove()
		.then(() => {	
			return response.status(201).json({
				message: 'deleted'
			});
		})
		.catch((err) => {
			return response.status.status(500).json({
				error: err
			})
		});
	});
});

exports.addSubscription = functions.https.onRequest((request, response) => {
	cors(request, response, () => {
		admin.database().ref('subscriptions').push(request.body)
		.then(() => {
			return response.status(201).json({
				message: 'added'
			});
		})
		.catch((err) => {
			return response.status.status(500).json({
				error: err
			})
		});
	});
});