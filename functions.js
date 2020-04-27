module.exports = {
    getMember: function(message, toFind = '') {
        toFind = toFind.toLowerCase();

        let target = message.guild.members.get(toFind);
        
        if (!target && message.mentions.members)
            target = message.mentions.members.first();

        if (!target && toFind) {
            target = message.guild.members.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                member.user.tag.toLowerCase().includes(toFind)
            });
        }
            
        if (!target) 
            target = message.member;
            
        return target;
    },

    formatDate: function(date) {
        return new Intl.DateTimeFormat('en-US').format(date)
    },

    promptMessage: async function (message, author, time, validReactions) {
        // We put in the time as seconds, with this it's being transfered to MS
        time *= 1000;

        // For every emoji in the function parameters, react in the good order.
        for (const reaction of validReactions) await message.react(reaction);

        // Only allow reactions from the author, 
        // and the emoji must be in the array we provided.
        const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === author.id;

        // And ofcourse, await the reactions
        return message
            .awaitReactions(filter, { max: 1, time: time})
            .then(collected => collected.first() && collected.first().emoji.name);
    },

    reportQuestion: function(client, messageReaction, user, author) {

        if(!user.bot) {
            
            if (messageReaction.emoji.name === '📰') {

                const { MessageEmbed } = require('discord.js');
                const trivia = require('./commands/fun/trivia.js');
                const reportChannelID = '700297733734531162';

                const embedReportQ = new MessageEmbed()
                    .setDescription(`Q: **${trivia.question}**\nA: **${trivia.answer}**`)
                    .setFooter("Expires in [1] minutes")
                    .setColor("RED")
                
                const feedback = `${user} **PLEASE TYPE FEEDBACK:**`

                client.channels.cache.get(reportChannelID).send(embedReportQ).then(msg => msg.delete({timeout: 50000}));;
                client.channels.cache.get(reportChannelID).send(feedback).then(msg => msg.delete({timeout: 50000}));;

                client.on('message', (message) => {

                    if (message.content == feedback) return;
                    if (message.channel == reportChannelID && message.author == author) {

                        message.delete();

                        client.channels.cache.get(reportChannelID)
                            .send(embedReportQ
                                .setDescription(`Q: **${trivia.question}**\nA: **${trivia.answer}**\n\nFeedback: \`\`\`${message.content}\`\`\``)
                                .setColor("GREEN")
                                .setFooter("Submitted!! Thank you for your feedback!"))

                    } else if (message.channel == reportChannelID && user.id != author.id) {

                        message.delete();
                    }
                });
            } 
        }
    },
    
    delay: function(time) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time)
        })
    },

    processPollResults: function(voteCollector, pollOptions, userVotes, pollTally) {
        return new Promise((resolve, reject) => {
            voteCollector.on('collect', msg => {
                let option = msg.content.toLowerCase();
                if(!userVotes.has(msg.author.id) && pollOptions.includes(option)) {
                    userVotes.set(msg.author.id, msg.content);
                    let voteCount = pollTally.get(option);
                    pollTally.set(option, ++voteCount);
                }
            });
            voteCollector.on('end', collected => {
                console.log("Collected " + collected.size + " votes.");
                resolve(collected);
            })
        });
    },
    
    getPollOptions: function(collector) {
        return new Promise((resolve, reject) => {
            collector.on('end', collected => resolve(collected.map(m => m.content.toLowerCase())));
        });
    }
    
}