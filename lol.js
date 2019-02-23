"use strict";

require("dotenv").config();
const login = require("facebook-chat-api");

const task = process.argv[2];
process.argv.splice(0, 3);

login({email: process.env.email, password: process.env.password}, (err, api) => {
	if (err) { return console.error(err); }

	switch (task) {
		case "thumbs":
			const thumbsUpSender = require("./ThumbsUpSender.js");
			thumbsUpSender(process.argv, api);

			break; 

		case "listen":
			const threadListener = require("./ThreadListener.js");
			threadListener(process.argv, api);

			break;

		default:
			displayHelpDialog();
	}
});

function displayHelpDialog() {
	console.log("Usage: node lol.js [command] [command options]\n");
	console.log("\tthumbs\tSend thumbs up to a Facebook Messenger chat thread");
	console.log("\tlisten\tlisten to a Facebook Messenger chat thread");
	console.log();
	process.exit(0);g
}