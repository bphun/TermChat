'use strict';

require('dotenv').config();
const login = require('facebook-chat-api');

const data =
{
	sticker: 369239263222822
}

if (process.argv[2] === '-h' || process.argv[2] === '--help') {
	console.log('Usage: node lol.js [count]\n\tcount\tThe number of thumbs ups stickers that will be sent');
	return;
}

login({email: process.env.email, password: process.env.password}, (err, api) => {
	if (err) { return console.error(err); }

	//lets api.listen listener capture events as well as messages
	api.setOptions({
		listenEvents: true,
		selfListen: true //also lets you listen to your own messages or events
	});

	api.getThreadList(10, null, [], (err, list) => {
		if (err) { return console.error(err); }

		list.forEach(async function(thread) {
			if (thread.name === '🏰🌌 A🅱️ortnite Squash') {
				const groupId = parseInt(thread.threadID);
				if (isNaN(groupId) || !isFinite(groupId)) {
					console.log("Unknown number of thumbs ups requested");
					return;
				}

				//this is where the listener runs, change the actions for the events in the switch statement
				let stopListening = api.listen((err, event) => {
					if (err) return console.error(err);

					switch (event.type) {
						case "message":
							console.log(event.body);
							break;
						case "event":
							console.log(event.logMessageData);
							break;
						case "typ":
							console.log(event.from);
							break;
						case "read":
							console.log(event);
							break;
						case "read_receipt":
							console.log(event);
							break;
						case "message_reaction":
							console.log(event);
							break;
						default:
							break;
					}
				});
				
				if (process.argv.length == 3) {
					for (let i = 0; i < parseInt(process.argv[2]); i++) {
						console.log('Sending Thumbs up...')
						api.sendMessage(data, thread.threadID);
						console.log('Sleeping for 1 second');
						await sleep(1000);
					}
				} else {
					//I commented this out cuz we're doing other stuff now lol
					//api.sendMessage(data, thread.threadID);
				}
			}
		});
	});
});

function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}