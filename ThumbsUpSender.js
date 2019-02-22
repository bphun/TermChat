const fs = require("fs");

module.exports = function(options, api) {

	const payload = { sticker: 369239263222822 };

	let thumbsToSend = 1;
	let threadsToProcess = [];

	options.forEach(function(val, index, array) {
		switch (val) {
			case "-c":
			case "--count":
				thumbsToSend = array[++index];
				if (isNaN(thumbsToSend) || !isFinite(thumbsToSend)) {
					console.log("Invalid number of thumbs ups requested");
					process.exit(0);
				}
				break;
			case "-dt":
			case "--default-thread":
				threadsToProcess.push(process.env.defaultThreadName);
				break;
			case "-t":
			case "--thread":
				while (++index < array.length && !array[index].includes("-")) {
					threadsToProcess.push(array[index]);
				}
				break;
			case "--set-default":
				fs.readFile(".env", "utf-8", function(err, data) {
					let splitArray = data.split("\n");
					splitArray.splice(splitArray.indexOf("defaultThumbThreadName"), 1);
					splitArray[splitArray.length] = `defaultThumbThreadName=${array[++index]}`
					fs.writeFile(".env", splitArray.join("\n"), (err) => {});
				});
				break;
			case "-h":
			case "--help":
				console.log("Usage: node lol.js thumbs");
				console.log("\t-c --count\t\tNumber of thumbs ups stickers that will be sent");
				console.log("\t-dt --default-thread\tSend thumbs ups to your designated default thread");
				console.log("\t--set-default\t\tName of the thread where thumbs ups will be sent by default if no thread name is provided");
				console.log("\t-t --thread\t\tName of threads that you would like to send thumbs ups to");
				console.log("\t-h --help\t\tDisplay this help dialog");
				console.log();
				process.exit(0);
		}
	});

	if (threadsToProcess == 0) {
		threadsToProcess[0] = process.env.defaultThumbThreadName;
	}

	console.log(`Sending ${thumbsToSend} thumbs up to:`);
	threadsToProcess.forEach(function(val) {
		console.log(`\t${val}`);
	});

	api.getThreadList(10, null, [], (err, list) => {
		if (err) { return console.error(err); }

		list.forEach(async function(thread) {
			if (threadsToProcess.includes(thread.name)) {
				for (var i = 0; i < thumbsToSend; i++) {
					api.sendMessage(payload, thread.threadID);
					await sleep(500);					
				}
			}
		});
	});
}
	

function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}
