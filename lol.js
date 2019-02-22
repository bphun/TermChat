'use strict';

require('dotenv').config();
const fs = require('fs');
const login = require('facebook-chat-api');

const data =
{
	sticker: 369239263222822
}

let thumbsToSend = 1;
let threadsToProcess = [];

process.argv.forEach(function(val, index, array) {
	switch (val) {
		case '-c':
		case '--count':
			thumbsToSend = array[++index];
			if (isNaN(thumbsToSend) || !isFinite(thumbsToSend)) {
				console.log('Invalid number of thumbs ups requested');
				process.exit(0);
			}
			break;
		case '-dt':
		case '--default-thread':
			threadsToProcess.push(process.env.defaultThreadName);
			break;
		case '-t':
		case '--thread':
			while (++index < array.length && !array[index].includes('-')) {
				threadsToProcess.push(array[index]);
			}
			break;
		case '--set-default':
			fs.readFile('.env', 'utf-8', function(err, data) {
				let splitArray = data.split('\n');
				splitArray.splice(splitArray.indexOf('defaultThreadName'), 1);
				splitArray[splitArray.length] = `defaultThreadName=${array[++index]}`
				console.log(splitArray.join('\n'));
				fs.writeFile('.env', splitArray.join('\n'), (err) => {});
			});
			break;
		case '-h':
		case '--help':
			console.log('Usage: node lol.js');
			console.log('\t-c --count\t\tNumber of thumbs ups stickers that will be sent');
			console.log('\t-dt --default-thread\tSend thumbs ups to your designated default thread');
			console.log('\t--set-default\t\tName of the thread that will be sent by default if no thread name is provided');
			console.log('\t-t --thread\t\tName of threads that you would like to send thumbs ups to');
			console.log('\t-h --help\t\tDisplay this help dialog');
			console.log();
			process.exit(0);
	}
}); 

console.log(`Sending ${thumbsToSend} thumbs up to:`);
threadsToProcess.forEach(function(val) {
	console.log(`\t${val}`);
})

if (threadsToProcess.length == 0) {
	threadsToProcess[0] = process.env.defaultThreadName;
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
        if (threadsToProcess.includes(thread.name)) {
				/*
					Since this is an asynchronous function, thumbsToSend = thumbsToSend / threadsToProcess.length
					so we need to correct that my multiplying thumbsToSend by threadsToProcess.length.
				 */
				for (var i = 0; i < thumbsToSend * threadsToProcess.length; i++) {
					api.sendMessage(data, thread.threadID);
					await sleep(500);					
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