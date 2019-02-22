const fs = require('fs');

module.exports = function(options, api) {

	let threadsToProcess = [];
	let monitoredThreads = {};

	api.setOptions({
		listenEvents: true,
		selfListen: true, //also lets you listen to your own messages or events
		logLevel: "silent"
	});

	options.forEach(function(val, index, array) {
		switch (val) {
			case '-t':
			case '--thread':
				while (++index < array.length && !array[index].includes('-')) {
					threadsToProcess.push(array[index]);
				}
				break;
			case '-dt':
			case '--default-thread':
				threadsToProcess.push(process.env.defaultThreadName);
				break;
			case '--set-default':
				fs.readFile('.env', 'utf-8', function(err, data) {
					let splitArray = data.split('\n');
					splitArray.splice(splitArray.indexOf('defaultListenThreadName'), 1);
					splitArray[splitArray.length] = `defaultListenThreadName=${array[++index]}`
					fs.writeFile('.env', splitArray.join('\n'), (err) => {});
				});
				break;
			case '-h':
				console.log('Usage: node lol.js listen');
				console.log('\t-dt --default-thread\tMonitor your designated default thread');
				console.log('\t--set-default\t\tName of the thread that will be monitor by default if no thread name is provided');
				console.log('\t-t --thread\t\tName of threads that you would like to monitor');
				console.log('\t-h --help\t\tDisplay this help dialog');
				console.log();
				process.exit(0);
		}
	});

	if (threadsToProcess == 0) {
		threadsToProcess[0] = process.env.defaultThumbThreadName;
	}

	console.log('Listening to threads:');
	threadsToProcess.forEach(function(val) {
		console.log(`\t${val}`);
	});

	api.getThreadList(10, null, [], (err, list) => {
		if (err) { return console.error(err); }

		list.forEach(async function(thread) {
			if (threadsToProcess.includes(thread.name)) {

				monitoredThreads[thread.threadID] = thread.name;

				let stopListening = api.listen((err, event) => {
					if (err) { return console.error(err); }
					console.log(event);
					console.log(`${monitoredThreads[event.threadID]}: ${event.body}`);
					// switch (event.type) {
					// 	case "message":
					// 		console.log(event.body);
					// 		break;
					// 	case "event":
					// 		console.log(event.logMessageData);
					// 		break;
					// 	case "typ":
					// 		console.log(event.from);
					// 		break;
					// 	case "read":
					// 		console.log(event);
					// 		break;
					// 	case "read_receipt":
					// 		console.log(event);
					// 		break;
					// 	case "message_reaction":
					// 		console.log(event);
					// 		break;
					// 	default:
					// 		break;
					// }
				});
			}
		});
	});
}