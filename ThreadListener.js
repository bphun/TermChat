const fs = require("fs");

let monitoredThreadInfo = {};
let outputFileName = '';

let fileOutput = false;

module.exports = function(options, api) {

	let threadsToProcess = [];

	api.setOptions({
		listenEvents: true,
		selfListen: true, //also lets you listen to your own messages or events
		logLevel: "silent",
		updatePresence: true
	});

	options.forEach(function(val, index, array) {
		switch (val) {
			case "-t":
			case "--thread":
			while (++index < array.length && !array[index].includes("-")) {
				threadsToProcess.push(array[index]);
			}
			break;
			case "-dt":
			case "--default-thread":
			threadsToProcess.push(process.env.defaultListenThreadName);
			break;
			case "--set-default":
			fs.readFile(".env", "utf-8", function(err, data) {
				let splitArray = data.split("\n");
				splitArray.splice(splitArray.indexOf("defaultListenThreadName"), 1);
				splitArray[splitArray.length] = `defaultListenThreadName=${array[++index]}`
				fs.writeFile(".env", splitArray.join("\n"), (err) => {});
			});
			break;
			case "-f":
			case "--file":
			outputFileName = array[++index];
			if (outputFileName === undefined) {
				console.log('No output file specified');
				process.exit(0);
			}
			fileOutput = true;
			fs.writeFile(outputFileName, '[\n', function(err) {
				if (err) { 
					console.log('Unable to prepare file');
					process.exit(0);
				}
			});
			console.log(`Writing received events to ${outputFileName}`);
			break;
			case "-h":
			console.log("Usage: node lol.js listen");
			console.log("\t-f --file\t\tName of the file that all events will be written to");
			console.log("\t-dt --default-thread\tMonitor your designated default thread");
			console.log("\t--set-default\t\tName of the thread that will be monitor by default if no thread name is provided");
			console.log("\t-t --thread\t\tName of threads that you would like to monitor");
			console.log("\t-h --help\t\tDisplay this help dialog");
			console.log();
			process.exit(0);
		}
	});

	if (threadsToProcess == 0) {
		threadsToProcess[0] = process.env.defaultThumbThreadName;
	}

	console.log("Listening to threads:");
	threadsToProcess.forEach(function(val) {
		console.log(`\t${val}`);
	});

	api.getThreadList(10, null, [], (err, list) => {
		if (err) { return console.error(err); }

		list.forEach(async function(thread) {
			if (threadsToProcess.includes(thread.name)) {
				monitoredThreadInfo[thread.threadID] = 
				{
					threadName: thread.name,
					members: {}

				};

				thread.participants.forEach(function(threadParticipantData) {
					monitoredThreadInfo[thread.threadID]["members"][threadParticipantData.userID] = JSON.parse(`{"name": "${threadParticipantData.name}"}`);
				});
			}
		});

		let stopListening = api.listen((err, event) => {
			if (err) { return console.error(err); }
			if (monitoredThreadInfo[event.threadID] !== undefined) {
				switch (event.type) {
					case "message":
					handleMessage(event);
					break;

					case "typ":
					handleThreadMemberType(event);
					break;

					case "read":
					handleThreadReadEvent(event);
					break;

					case "read_receipt":
					handleReadReceipt(event);
					break;

					case "message_reaction":
					handleMessageReaction(event);
					break;

					case "presence":
					handlePresence(event);
					break;
				}
				if (fileOutput) {
					writeEventToFile(event);
				}
			}
		});
	});
}

function handleMessage(event) {
	if (monitoredThreadInfo[event.threadID]["members"][event.senderID].name === monitoredThreadInfo[event.threadID].threadName) {
		console.log(`${monitoredThreadInfo[event.threadID]["members"][event.senderID].name}: ${event.body !== "" ? event.body : "Unsupported Message Type"}`)
	} else {
		console.log(`${monitoredThreadInfo[event.threadID]["members"][event.senderID].name}->${monitoredThreadInfo[event.threadID].threadName}: ${event.body !== "" ? event.body : "Unsupported Message Type"}`)
	}
}

function handleThreadMemberType(event) {}

function handleThreadReadEvent(event) {}

function handleReadReceipt(event) {}

function handleMessageReaction(event) {
	console.log(`${monitoredThreadInfo[event.threadID]["members"][event.senderID].name} reacted to your message with ${event.reaction}`);
}

function handlePresence(event) {
	api.getUserInfo(event.userID, (err, user) => {
		console.log(`${user.name} is active`);
	});
}

function writeEventToFile(event) {
	fs.appendFile(outputFileName, JSON.stringify(event, '', '\t') + ',', function(err) {
		if (err) { console.err('Unable to write event to file'); }
	});
}

process.on('SIGINT', function() {
	console.log('\nClosing...');

	process.exit();
});
