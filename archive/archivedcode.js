        /** !report <id> <reason> was built instead
        *    // FIX REPORT FUNCTION - LOCATED IN functions.js
        *
        *    // client.on('messageReactionAdd', (messageReaction, user) => {
        *    //     if ( lodgingReport == false || lodgingReport == undefined ) {
        *    //         lodgingReport = reportQuestion(client, messageReaction, user, author);
        *    //         lodgingReport = false;
        *    //     } else {
        *    //         client.channels.cache.get(reportChannelID).send("A report is currently being lodged.").then(m => m.delete({timeout: 15000}));
        *    //     };
        *    // });  
        */

        /** !report <id> <reason> was built instead
        * 
        *         reportQuestion: function(client, messageReaction, user, author) {
        *
        *       if(!user.bot) {
        *           
        *           if (messageReaction.emoji.name === '📰') {
        *
        *               const { MessageEmbed } = require('discord.js');
        *               const trivia = require('./commands/fun/trivia.js');
        *               const reportChannelID = '700297733734531162';
        *
        *               const embedReportQ = new MessageEmbed()
        *                   .setDescription(`Q: **${trivia.question}**\nA: **${trivia.answer}**`)
        *                   .setFooter("Expires in [1] minutes")
        *                   .setColor("RED")
        *               
        *               const feedback = `${user} **PLEASE TYPE FEEDBACK:**`
        * 
        *               client.channels.cache.get(reportChannelID).send(embedReportQ).then(msg => msg.delete({timeout: 50000}));;
        *               client.channels.cache.get(reportChannelID).send(feedback).then(msg => msg.delete({timeout: 50000}));;
        *
        *               client.on('message', (message) => {
        *
        *                   if (message.content == feedback) return;
        *                   if (message.channel == reportChannelID && message.author == author) {
        * 
        *                       message.delete();
        * 
        *                       client.channels.cache.get(reportChannelID)
        *                           .send(embedReportQ
        *                               .setDescription(`Q: **${trivia.question}**\nA: **${trivia.answer}**\n\nFeedback: \`\`\`${message.content}\`\`\``)
        *                               .setColor("GREEN")
        *                               .setFooter("Submitted!! Thank you for your feedback!"))
        *
        *                   } else if (message.channel == reportChannelID && user.id != author.id) {
        *
        *                       message.delete();
        *                   }
        *               });
        *           } 
        *       }
        *   },
        */