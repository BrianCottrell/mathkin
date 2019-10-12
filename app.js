const KinClient = require('@kinecosystem/kin-sdk-node').KinClient;
const Environment = require('@kinecosystem/kin-sdk-node').Environment;
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000
app.use(bodyParser.json());

console.log('First we will create our KinClient object, and direct it to our test environment');
let client = new KinClient(Environment.Testnet);

var highScoreAddress = null;

//Send high score public address in request body
app.post('/set-high-score-address', function (req, res) {
    highScoreAddress = req.body.publicAddress;
    res.send(200);
});

app.get('/create-account', function(req, res) {
	console.log("environment", client.environment);

	const KeyPair = require('@kinecosystem/kin-sdk-node').KeyPair;
	// Get keypair

	const keypair = KeyPair.generate();
	console.log("We are using the following keypair: ", keypair.publicAddress);

	console.log("Since we are on the testnet blockchain, we can use the friendbot to create our account...");
	client.friendbot({ address: keypair.publicAddress, amount: 10000 }).then(() => {
		// Do something here
		// Init KinAccount
		console.log("We can now create a KinAccount object, we will use it to interact with our account");
		const account = client.createKinAccount({ seed: keypair.seed });
		console.log("This is the app ID of our account:", account.appId);
		console.log("We can use our KinAccount object to get our balance");
		account.getBalance().then(balance => {
			console.log("Our balance is " + balance + " KIN");
		});
		res.send(keypair);
	});
});

app.post('/transfer-to-high-score-address', function(req, res) {
	console.log("environment", client.environment);

	const keypair = JSON.parse(req.body.keypair);
	// Get keypair
	console.log("We are using the following keypair: ", keypair.publicAddress);

	// Init KinAccount
	console.log("We can now create a KinAccount object, we will use it to interact with our account");
	const account = client.createKinAccount({ seed: keypair.seed });
	console.log("This is the app ID of our account:", account.appId);
	console.log("We can use our KinAccount object to get our balance");
	account.getBalance().then(balance => {
		console.log("Our balance is " + balance + " KIN");
	});

	account.buildCreateAccount({
		fee: 100,
		startingBalance: 1000,
		memoText: "Test create account",
		address: newKeypair.publicAddress
	}).then(transactionBuilder => {
		account.submitTransaction(transactionBuilder).then(transactionHash => {
			console.log("We created the account and got the transaction id: ", transactionHash);

			// Get info about a tx
			console.log("We can now use the client to get info about the transaction we did");
			client.getTransactionData(transactionHash).then(transaction => {
				console.log("Transaction data: ", JSON.stringify(transaction))
			});

			// Send kin to the new account
			account.buildSendKin({
				amount: 100,
				memoText: "Hello World",
				address: highScoreAddress,
				fee: 100
			}).then(transactionBuilder => {
				account.submitTransaction(transactionBuilder).then(transactionHash => {
					console.log("The transaction succeeded with the hash ", transactionHash);
				});
			});
		});
	});
	res.send(200);
});

app.listen(port);
console.log("Listening to port", port);