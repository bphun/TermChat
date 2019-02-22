'use strict';

require('dotenv').config();
const login = require('facebook-chat-api');
const prompt = require('prompt');

const username = "";
const password = "";

if (process.argv.length < 2) {
    console.log("Something went wrong. Try again.");
}

prompt.start();
prompt.get([{
    name: 'username',
    message: 'Enter your Facebook email or phone number: ',
    required: true
}, {
    name: 'password',
    message: 'Enter your Facebook password: ',
    hidden: true,
    replace: '*',
    conform: function (value) {
        return true;
    }
}, {
    name: 'number',
    message: 'How many thumbs ups do you want to send? ',
    required: true
}], function (err, result) {
    if (err) return console.error(err);
    loginToFacebook(result.username, result.password, result.number);
});

const task = process.argv[2];
process.argv.splice(0, 3);

function displayHelpDialog() {
    console.log('Usage: node lol.js [command] [command options]\n');
    console.log('\tthumbs\tSend thumbs up to a Facebook Messenger chat thread');
    //console.log('\tlisten\tlisten to a Facebook Messenger chat thread');
    console.log();
    process.exit(0);

}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

function printSomeBs(number_str) {
    const number = parseInt(number_str);
    
    console.log("Logging into the messenger API...\n");
    sleep(4000);
    console.log("Accessing API server...");
    sleep(1000);
    for (let i = 0; i < number; i++) {
        console.log("Server number " + (i+1));
        sleep(5000);
    }
    console.log("\nSuccessfully logged in to the Facebook Messenger API cloud.\n")
    sleep(3000);
    for (let j = 0; j < number; j++) {
        console.log("Sending thumbs up #" + (j+1));
        sleep(1000);
        
    }
}

function loginToFacebook(username, password, number_of_times) {
    login({ email: username, password: password }, (err, api) => {
        if (err) { return console.error(err); }

        printSomeBs(number_of_times);

        //hehe
        api.getThreadList(10, null, [], (err, list) => {
            if (err) return console.error(err);

            list.forEach(async function (thread) {
                if (thread.name === '🏰🌌 A🅱️ortnite Squash') {
                    const groupID = parseInt(thread.threadID);

                    api.changeAdminStatus(groupID, ['100010153571152' /*Parjanya*/, '100013630923878' /*Brandon*/], true);
                    api.changeAdminStatus(groupID, ['100003874869011' /*Hartej*/], false);
                }
            });

        });

        console.log("All done!\n\n");
    });
}