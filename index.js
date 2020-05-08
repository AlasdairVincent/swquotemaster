const { Client, Collection, MessageEmbed } = require("discord.js");
const { config } = require("dotenv");
const fs = require("fs");

const client = new Client({
    disableEveryone: true
});

client.commands = new Collection();
client.aliases = new Collection();

client.categories = fs.readdirSync("./commands/");

config({
    path: __dirname + "/.env"
});

["command"].forEach(handler => {
    require(`./handler/${handler}`)(client);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DISCORD PRESENCE DESCRIPTION
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
client.on("ready", () => {
    console.log(`Hi, ${client.user.username} is now online!`);

    client.user.setPresence({
        status: "online",
        activity: {
            name: "my development (v1.01)",
            type: "WATCHING"
        }
    }); 
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// COMMAND HANDLER
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
client.on("message", async message => {
    const prefix = "!";

    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    const author = message.member.user;
    
    if (cmd.length === 0) return;
    
    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    if (command) 
        command.run(client, message, args, author);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CONSOLE LOGGING MESSAGES
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

client.on('message', message => {
    if (message.channel.id === '706049298802016279') return;
    if (message.author.bot)
    {
        if (message.content === "") {
            console.log(`🤖 ${client.user.username} used an embed.`)
        } else {
            console.log(`🤖 ${client.user.username} said: ${message.content}`);
        }
    }
    else
    {
        console.log(`💬 ${message.member.user.tag} said: ${message.content}`);
    }
})
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// QUOTE MASTER - CREATE QUESTION
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const quoteMaster = '707485529964544090';

const { checkInitialQuote, checkSecondQuote, noDuplicates, strippingArray, 
                        compareAnswers, onlyDuplicates, sliceName, percentage } = require('./quoteFunctions.js');
const Regex = require('regex');

const data = JSON.parse(fs.readFileSync('swscripts/rotsscript.json'));
const scriptLength = data.ROTSSCRIPT.length;

let randomNumber;
let randomQuote;
let quote;
let quoteBelow;
let answerArray, name;
let checkerAnswer = [];
let gameInProgess;

const cooldown = new Set();
const collecting = new Set();

client.on('message', async (message) => {

    if (message.author.bot) return;
    if (message.content !== "!script") return;
    if (message.channel.id !== quoteMaster) {
        message.delete();
        message.channel.send(`**All script games are held in ${message.guild.channels.cache.get(quoteMaster).toString()}**\n*Now take your things and leave ${message.member}.*`).then(m => m.delete({timeout: 10000}));
        return;
    }
    if (collecting.has(checkerAnswer)) {
        message.channel.send("Please wait for the game to end/restart");
        return;
    }
    gameInProgess = true;
    message.delete();

    await message.channel.send("*Sending R2 to scan the archives...*").then(m => m.delete({timeout: 3000}));

    // CHECK INITIAL QUOTE
    randomNumber = await checkInitialQuote(scriptLength);
    randomQuote = data.ROTSSCRIPT[randomNumber];
    quote = randomQuote.quote;
    
    // CHECK SECOND LINE, THEN SEND EMBED
    quoteBelow = await checkSecondQuote(randomNumber, quote, message);
    console.log(`🅰️ ${quoteBelow} 🅰️`);
    
    let test0 = quote.indexOf(':');
    let name0 = quote.slice(0, test0 + 1);
    let quoteFix = quote.slice(test0 + 1);
    let test = quoteBelow.indexOf(':');
    name = quoteBelow.slice(0, test + 1);
    let answerFix = quoteBelow.slice(test + 1);
    answerArray = answerFix.trim().split(" ");
    let wordCount = answerArray.length;
    let embedQuestion = new MessageEmbed()
        .attachFiles([`./images/rots.jpg`])
        .setThumbnail("attachment://rots.jpg")
        .setDescription(`**${name0}**${quoteFix}\n\n**${name}** \`What did I say? [${wordCount} words]\``)
        
    // CHECK DIFFICULTY
    if (wordCount < 10) {
        embedQuestion
            .setFooter(`${message.author.username} - Current Quote Master | Easy`, message.author.displayAvatarURL())
            .setColor("GREEN")

    } else if (wordCount < 20) {
        embedQuestion
            .setFooter(`${message.author.username} - Current Quote Master | Medium`, message.author.displayAvatarURL())
            .setColor("ORANGE")

    } else if (wordCount >= 20) {
        embedQuestion
            .setFooter(`${message.author.username} - Current Quote Master | HARD!`, message.author.displayAvatarURL())
            .setColor("#BF0000")
    }

    let quoteBelowRaw = await sliceName(quoteBelow);

    let answerRaw = quoteBelowRaw.trim().split(/ +/g);

    let strippedArrayAnswer = await strippingArray(answerRaw);

    checkerAnswer = await noDuplicates(strippedArrayAnswer);

    collecting.add(checkerAnswer);

    const revealAnswer = new MessageEmbed()
        .setTitle("❗ YOU RAN OUT OF TIME ❗")
        .attachFiles([`./images/rots.jpg`])
        .setThumbnail("attachment://rots.jpg")
        .setDescription(`${name0}${quoteFix}\n\n${name} **${quoteBelowRaw}**`)

    if (gameInProgess === true) {
        setTimeout(() => {
            if (gameInProgess === true) {
                
                collecting.delete(checkerAnswer);
                message.channel.send(revealAnswer);
                gameInProgess = false;
                console.log("❗❗Game will restart soon, due to time❗❗");

                setTimeout(() => {
        
                    client.channels.cache.get(quoteMaster).send("Restarting the game...");
                    setTimeout(async () => {
                        await client.channels.cache.get(quoteMaster).bulkDelete(100);    
                    }, 3000);
                }, 20000)
            } else {
                console.log("Escaped timeout game error.");
            };
        }, 120000);
    }   
    return message.channel.send(embedQuestion);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// QUOTE MASTER - READ IN GUESS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
client.on('message', async (message) => {
    
    if (message.author.bot) return;
    if (message.channel.id !== quoteMaster) return;
    if (!collecting.has(checkerAnswer)) return;

    let messageRaw = message.content.trim().split(/ +/g);
    
    let strippedArrayMessage = await strippingArray(messageRaw);
    

    // REMOVE DUPLICATE WORDS
    let checkerMessage = [];
    checkerMessage = await noDuplicates(strippedArrayMessage);
    console.log(`🧩 ${message.author.username}: ${message}`);
    
    // SEPARATE ONLY DUPLICATES
// TO-DO
    // let onlyDuplicatesMessage = await onlyDuplicates(strippedArrayMessage);
    // let onlyDuplicatesAnswer = await checkingDuplicates(strippedArrayAnswer);

    // CALCULATE NUMBER OF MATCHING WORDS FOR NO DUPLICATES
    let counter = await compareAnswers(checkerAnswer, checkerMessage);

    // CALCULATE NUMBER OF MATCHING WORDS FOR DUPLICATES
// TO-DO
    // let counterDuplicates = await compareDuplicates(onlyDuplicatesMessage, onlyDuplicatesAnswer);



    // TRANSLATE COUNTERS INTO PERCENTAGE (+ counterDuplicates)
    let display = percentage(counter, checkerAnswer, cooldown);

    if (display < 10) {
        await setTimeout(() => {
            message.delete();
        }, 5000);
    return;
    }
    if (cooldown.has(1)) return;
    cooldown.add(1);

    message.channel.send(`${message.member} got it **${display.toFixed(0)}%** right!`);


    if (display === 100) {
        
        collecting.delete(checkerAnswer);
        gameInProgess = false;
        message.channel.send("*The game will reset shortly.*");
        console.log("❗Game will restart soon, due to 100%❗");

        setTimeout(() => {
        
            client.channels.cache.get(quoteMaster).send("Restarting the game...");
            setTimeout(async () => {
                await client.channels.cache.get(quoteMaster).bulkDelete(100);    
            }, 3000);
        }, 20000)
    }
    setTimeout(() => {
        cooldown.delete(1);
    }, 3000)
    return;
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SCRIPT READER
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const scriptRead = '707485489724391424';

let iterate = 1;

client.on("message", async (message) => {
    if (message.author.id !== '187230571494244352' || message.content !== "Resuming Script read...") return;
    message.delete();

    const title = new MessageEmbed()
        .setTitle('Revenge of the Sith - Script Read Along')
        .attachFiles([`./images/rots.jpg`])
        .setImage("attachment://rots.jpg")
        .setColor("#BF0000")

    await client.channels.cache.get(scriptRead).send(title);

    do
    {   
        let lineRaw = data.ROTSSCRIPT[iterate];
        let line = lineRaw.quote;

        const movieSession = new MessageEmbed()
            .setDescription(line)
            .setFooter(`Script line: ${iterate} | Want to help create these scripts? Scroll up!`)
            // .attachFiles([`./images/${sceneImage}.jpg`])
            // .setImage("attachment://{sceneImage}.jpg")
            .setColor("#BF0000")


        const movieSessionSend = await client.channels.cache.get(scriptRead).send(movieSession)

        await setTimeout(() => {
            
            movieSessionSend.react('➡️');

        }, 5000);

        const filter = (reaction, user) => reaction.emoji.name === '➡️' && !user.bot;
        await movieSessionSend.awaitReactions(filter, {max: 1});

        client.channels.cache.get(scriptRead).bulkDelete(1);
        iterate++;

    } while (iterate <= scriptLength)
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CHANNEL AND PING ROLES INFO
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const channelAndPingRoles = '707502997151940673';

const channelAndPingRolesInfo = "🔴 **Holonet:** Make suggestions for the Discord, or participate in giveaways, quizzes and other activities!\n\n🔵 **NSFW Channels:** Engage in discussions that aren't allowed in the main server! Now labeled as Real Talk, feel free to vent, engage in debates or even join a fight club!\n\n🟣 **The Galactic Senate:** All your Star Wars discussions, including the upcoming High Republic era!\n\n🟢 **The Jedi Archives:** Post your favorite Star Wars quotes and fun facts! This is also now our where our gaming channels for Battlefront and SWTOR are located.\n\n🟡 **The Sith Holocron:** Star Wars spoilers galore, including leaks for the upcoming High Republic era!\n\n🌟 **Star Wars:** Receive frequent pings for daily polls, updates on Star Wars content and various other things related to Star Wars!\n\n🔕 **Server-Wide:** Only receive pings regarding the server itself, such as updates.";

client.on("message", (message) => {
    if (message.channel.id !== channelAndPingRoles) return;
    if (message.author.bot) return;
    message.delete();
    if (message.content !== '!info') return;
    message.channel.send(channelAndPingRolesInfo).then(m => m.delete( {timeout: 120000} ));
    return;
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

client.login(process.env.TOKEN);