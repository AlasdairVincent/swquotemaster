const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const fetch = require('node-fetch');
const congrats = JSON.parse(fs.readFileSync('./winner.json'));


// const reportChannelID = '700297733734531162';
const answerTime = 60000;
let loop;

const cooldown = new Set();

const starWarsTrivia = '707485572825874492';

module.exports = {
    name: 'trivia',
    aliases: ['t'],
    description: 'Use `!trivia -q` to ask a question without a quote',
    category: 'fun',
    run: async (client, message, args, author) => {
        
        if (message.channel.id !== starWarsTrivia) {
            message.delete();
            await message.channel.send(`**Please take all trivia games to ${message.guild.channels.cache.get(starWarsTrivia).toString()}**\n*Now take your things and leave ${message.member}.*`).then(m => m.delete({timeout: 10000}));
            return;
        }
    
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
                .setFooter(`ID: ${id}`) //Easy - Hard | 
                .setColor("#BF0000")
                .attachFiles([`../swquotemaster/images/${category}.jpg`])
                .setThumbnail(`attachment://${category}.jpg`)

            let quote = await fetch('http://swquotesapi.digitaljedi.dk/api/SWQuote/RandomStarWarsQuote')
                .then(res => res.json())
                .then(json => json.starWarsQuote);
            
            if (args[0] != '-q') embed.setDescription(`*${quote}*`);

            const m = await message.channel.send(embed);

            await setTimeout(() => {
                m.react('🅰️');
            }, 2000);
            
            let answerBox = true;


// REMOVE client.on INSIDE COMMAND HANDLER

            // CHECK MESSAGE FOR ANSWER - UPDATE WITH COLLECTORS
            client.on('message', (message) => {
                if (message.author.bot) return; 


                    if (answer === undefined) return;
                    if (message.content.toLowerCase() == answer.toLowerCase() 
                            || alias.some(answer => answer.toLowerCase() === message.content.toLowerCase()))
                    {
                        if (cooldown.has(1)) return;
                        cooldown.add(1);

                        let random = Math.floor(Math.random() * congrats.winner.length);
                        let randomCongrats = congrats.winner[random];
                        let congratulations = randomCongrats.congrats;

                        message.channel.send(`**${message.member} ${congratulations}**`);
                        answerBox = false;
                        m.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                        loop = true;
                        answer = undefined;
                        setTimeout(() => {
                            cooldown.delete(1);
                        }, 3000);
                    } 
            });

            const filter = (reaction, user) => reaction.emoji.name === '🅰️' && user.id === author.id;
            await m.awaitReactions(filter, { max: 1, idle: answerTime });

            // ANSWER BOX w/ REPORT EMOJI
            if ( answerBox === true && !(answer === undefined))
            {
                const embed2 = new MessageEmbed()
                    .setTitle(`**${answer}**`)
                    .setDescription(`Q: "*${question}*"`)
                    .setFooter(`ID: ${id} | See an error? Use !help report`)
                    .setColor("#000000")
                
                await message.channel.send(embed2);

                m.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));

                answer = undefined;
            }

            loop = true;
        } else {
            message.channel.send("Woh!! There's already a question being asked!");
            return;
        }
        return;
    }
}