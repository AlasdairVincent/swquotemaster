const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { reportQuestion } = require('../../functions.js');
// const reportChannelID = '700297733734531162';

let loop;
let lodgingReport;

module.exports = {
    name: 'trivia',
    aliases: ['t'],
    category: 'fun',
    run: async (client, message, args, author) => {
    
        if ( loop == true || loop == undefined) {

            loop = false;

            // QUESTION EMBED
            let data = JSON.parse(fs.readFileSync('commands/fun/trivia.json'));
            let length = data.trivia.length;
            let randomNumber = Math.floor(Math.random() * length);
            let randomQuestion = data.trivia[0];
            let question = randomQuestion.question;
            let type = randomQuestion.type;
            let category = randomQuestion.category;
            let answer = randomQuestion.answer;
            let id = randomQuestion.id;
            let difficulty = randomQuestion.difficulty;
            let alias = randomQuestion.alias;

            const embed = new MessageEmbed()
                .setTitle(question)
                // .setDescription(`Type: ${type}`)
                .setFooter(`${difficulty}. ID: ${id}`)
                .setColor("#BF0000")

            const m = await message.channel.send(embed);

            await m.react('🅰️');
            
            let answerBox = true;

            // CHECK MESSAGE FOR ANSWER - UPDATE WITH COLLECTORS
            client.on('message', (message) => {
                if (message.author.bot) return; 

                    if (message.content.toLowerCase() == answer.toLowerCase() 
                            || alias.some(answer => answer.toLowerCase() === message.content.toLowerCase()))
                    {
                        message.channel.send(`**${message.member} is flexing his knowledge.**`);
                        answerBox = false;
                        m.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                        loop = true;
                    } 
            });

            const filter = (reaction) => reaction.emoji.name === '🅰️';
            await m.awaitReactions(filter, { maxUsers: 2, idle: 5000 });

            // ANSWER BOX w/ REPORT EMOJI
            if ( answerBox === true )
            {
                const embed2 = new MessageEmbed()
                    .setTitle(`**${answer}**`)
                    .setDescription(`Q: "*${question}*"`)
                    .setFooter(`React to the '📰' to report a question/answer, ID: ${id}`)
                    .setColor("#000000")
                
                const m2 = await message.channel.send(embed2);

                m.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                
                // await m2.react('📰');
            }

            // FIX REPORT FUNCTION - LOCATED IN functions.js

            // client.on('messageReactionAdd', (messageReaction, user) => {
            //     if ( lodgingReport == false || lodgingReport == undefined ) {
            //         lodgingReport = reportQuestion(client, messageReaction, user, author);
            //         lodgingReport = false;
            //     } else {
            //         client.channels.cache.get(reportChannelID).send("A report is currently being lodged.").then(m => m.delete({timeout: 15000}));
            //     };
            // });  


            loop = true;
        } else {
            message.channel.send("Woh!! There's already a question being asked!");
            return;
        }
    }
}