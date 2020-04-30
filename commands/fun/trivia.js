const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const fetch = require('node-fetch');

// const reportChannelID = '700297733734531162';
const answerTime = 60000;
let loop;

const cooldown = new Set();


module.exports = {
    name: 'trivia',
    aliases: ['t'],
    description: 'Use `!trivia -q` to ask a question without a quote',
    category: 'fun',
    run: async (client, message, args, author) => {
    
        // HELP COMMAND
        if (args[0] === 'help') {
            const helpEmbed = new MessageEmbed()
                .setDescription(`**Name:** trivia, t\n**Description:** Posts a random Star Wars question for everyone to answer!\n**Other:** Use \`!trivia -q\` to remove quotes\n`)
                .setColor('BLACK')

            message.channel.send(helpEmbed);
            return;
            
        }
        if ( loop == true || loop == undefined) {

            loop = false;

            // QUESTION EMBED
            let data = JSON.parse(fs.readFileSync('commands/fun/trivia.json'));
            let length = data.trivia.length;
            let randomNumber = Math.floor(Math.random() * length);
            let randomQuestion = data.trivia[randomNumber];
            let question = randomQuestion.question;
            let type = randomQuestion.type;
            let category = randomQuestion.category;
            let answer = randomQuestion.answer;
            let id = randomQuestion.id;
            // let difficulty = randomQuestion.difficulty;
            let alias = randomQuestion.alias;

            const embed = new MessageEmbed()
                .setTitle(question)
                // .setDescription(`Type: ${type}`)
                .setFooter(`Easy - Hard | ID: ${id}`)
                .setColor("#BF0000")
                .attachFiles([`../swquotemaster/images/${category}.jpg`])
                .setThumbnail(`attachment://${category}.jpg`)

            let quote = await fetch('http://swquotesapi.digitaljedi.dk/api/SWQuote/RandomStarWarsQuote')
                .then(res => res.json())
                .then(json => json.starWarsQuote);
            
            if (args[0] != '-q') embed.setDescription(`*${quote}*`);

            const m = await message.channel.send(embed);

            await m.react('🅰️');
            
            let answerBox = true;

            // CHECK MESSAGE FOR ANSWER - UPDATE WITH COLLECTORS
            client.on('message', (message) => {
                if (message.author.bot) return; 



                    if (message.content.toLowerCase() == answer.toLowerCase() 
                            || alias.some(answer => answer.toLowerCase() === message.content.toLowerCase()))
                    {
                        if (cooldown.has(message.author.id)) return;
                        cooldown.add(message.author.id);

                        message.channel.send(`**${message.member} is flexing his knowledge.**`);
                        answerBox = false;
                        m.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                        loop = true;

                        setTimeout(() => {
                            cooldown.delete(message.author.id);
                        }, 3000);
                    } 
            });

            const filter = (reaction, user) => reaction.emoji.name === '🅰️' && user.id === author.id;
            await m.awaitReactions(filter, { max: 1, idle: answerTime });

            // ANSWER BOX w/ REPORT EMOJI
            if ( answerBox === true )
            {
                const embed2 = new MessageEmbed()
                    .setTitle(`**${answer}**`)
                    .setDescription(`Q: "*${question}*"`)
                    .setFooter(`ID: ${id} | See an error? Use !help report`)
                    .setColor("#000000")
                
                await message.channel.send(embed2);

                m.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
            }

            loop = true;
        } else {
            message.channel.send("Woh!! There's already a question being asked!");
            return;
        }
    }
}