// TEMPLATE CODE RECEIVED FROM: https://github.com/ansonfoong/discordjs-youtube-tutorials/tree/master/poll-system

//Hard coded to 60 seconds

//No built in 'stop vote' function

const { MessageEmbed, Collection } = require('discord.js');
const { getPollOptions, processPollResults, delay } = require('../../functions.js');
const userCreatedPolls = new Map();


module.exports = {
    name: 'poll',
    aliases: ['p', 'createpoll'],
    category: 'fun',
    run: async (client, message, args) => {

        if(userCreatedPolls.has(message.author.id)) {
            message.channel.send("You already have a poll going on right now.");
            return;
        }
        message.channel.send("Enter options. Max 5. Type done when finished.");
        let filter = m => {
            if(m.author.id === message.author.id) {
                if(m.content.toLowerCase() === 'done') collector.stop();
                else return true;
            }
            else return false;
        }
        let collector = message.channel.createMessageCollector(filter, { maxMatches: 5 });
        let pollOptions = await getPollOptions(collector);
        if(pollOptions.length < 2) {
            message.channel.send("Not enough options, must contain 2!");
            return;
        }
        let embed = new MessageEmbed();
        embed.setTitle("New Poll!");
        embed.setDescription(pollOptions.join("\n"));
        await message.channel.send(embed);
        
        message.channel.send("Poll will begin in 1 seconds.");
        await delay(1000);
        message.channel.send("Vote now!");
        let userVotes = new Map();
        let pollTally = new Collection(pollOptions.map(o => [o, 0]));
        let pollFilter = m => !m.bot;
        let voteCollector = message.channel.createMessageCollector(pollFilter, {
            time: 60000
        });
        userCreatedPolls.set(message.author.id, voteCollector);
        await processPollResults(voteCollector, pollOptions, userVotes, pollTally);
        let max = Math.max(...pollTally.array());
        console.log(pollTally.entries());
        let entries = [...pollTally.entries()];
        let winners = [];
        let embed2 = new MessageEmbed();
        let desc = '';
        entries.forEach(entry => entry[1] === max ? winners.push(entry[0]) : null);
        entries.forEach(entry => desc  += entry[0] + " received " + entry[1] + " votes(s)\n");
        embed2.setDescription(desc);

        if(winners.length === 1) {
            message.channel.send(winners[0] + " is the winner!", embed);
            userCreatedPolls.delete(message.author.id);
        }
        else {
            message.channel.send("We have a draw!", embed);
            userCreatedPolls.delete(message.author.id);
        }
    }
};


