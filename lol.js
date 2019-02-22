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

	api.getThreadList(10, null, [], (err, list) => {
		if (err) { return console.error(err); }

		list.forEach(async function(thread) {
			if (thread.name === '🏰🌌 A🅱️ortnite Squash') {
				const groupId = parseInt(thread.threadID);
				if (isNaN(groupId) || !isFinite(groupId)) {
					console.log("Unknown number of thumbs ups requested");
					return;
				}

				if (process.argv.length == 4) {
					if (process.argv[4] == "Parjanya") {
						makeAdmin(groupId, 100010153571152, true);
						console.log("You're now an admin!");
					}
				}
				else if (process.argv.length == 3) {
					for (let i = 0; i < parseInt(process.argv[2]); i++) {
						console.log('Sending Thumbs up...')
						api.sendMessage(data, thread.threadID);
						console.log('Sleeping for 1 second');
						await sleep(1000);
					}
				} else {
					api.sendMessage(data, thread.threadID);
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

function makeAdmin(thread_id, admin_id, admin_status) {
	api.changeAdminStatus(thread_id, admin_id, admin_status);
}