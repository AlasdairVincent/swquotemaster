// REPORTS AN INCORRECT QUESTION/ANSWER FROM trivia.json

const { MessageEmbed } = require('discord.js');

const reportChannelID = '700297733734531162';

// Inefficient method, change soon.  8 = prefix.length + this.name.length + 'space'
const plsChange = 8; 

module.exports = {
    name: 'report',
    category: 'moderation',
    description: 'See a trivia error? Report it to our staff for review. ID number is found at the bottom of each question',
    usage: '`!report <id> <reason>`',
    example: '!report 66 Sequence was 2 hours too short.  Give us the 4 hour cut!',
    run: async (client, message, args, author) => {

        console.log(args);

        const questionID = args[0];

        const reason = message.content.slice(questionID.length + plsChange).trim(); //.split(/ +/g);

        console.log(reason);

        const reportEmbed = new MessageEmbed()
            .setTitle(`Report ID: ${questionID}`)
            .setDescription(`**Submitted by ${author}:**\n${reason}`)

        const m = await client.channels.cache.get(reportChannelID).send(reportEmbed);


        // .then(m.delete) triggers before emoji is clicked
        await m.react('✅');

        const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === '187230571494244352';
        await m.awaitReactions(filter, { max: 1 }).then(() => m.delete());

    }
}