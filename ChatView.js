module.exports = {
    start: start
}

function start(options, api) {
    let threadListener = require('./ThreadListener.js')
    threadListener.start(process.argv, api);

    threadListener.on("ready", function(threadId, threadInfo) {
        process.stdout.write("\x1Bc");

        console.log(`Chatting with ${threadInfo[threadId].threadName}`);

        process.stdout.write("\033[" + process.stdout.rows + "B");

        const promptFixed = require("./Readline.js");
        promptFixed.start();
    
        promptFixed.on("line", function (line) {
            api.sendMessage(line, threadListener.getCurrentThread());
            
            // process.stdout.write("\033[" + process.stdout.rows + "A");
            // console.log(`Chatting with ${threadInfo[threadId].threadName}`);
            // process.stdout.write("\033[" + process.stdout.rows + "B");
            process.stdout.write("\033[1A")
        });
    });
}