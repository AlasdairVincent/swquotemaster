//Short term TO-DO
//Read trivia.json
//Read preset questions from trivia.json and send them to discord
//Listen for correct answer
//message.channel.send(`Congratulations! ${member.user.displayName} got it!`); when correct answer is given


const fs = require('fs');

module.exports = {
    name: 'trivia',
    category: 'fun',
    run: (client, message, args) => {
        
        var data = fs.readdirSync();
        var length = data.trivia.length;
        var randomNumber = Math.floor(Math.random * length);

        console.log(randomNumber);

    }
}