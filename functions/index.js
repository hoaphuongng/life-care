const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

var admin = require('firebase-admin');
var cors = require('cors')({ origin: true });

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
		.then(() => {
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