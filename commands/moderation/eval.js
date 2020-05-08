module.exports = {
    name: 'eval',
    category: 'moderation',
    run: async (client, message, args) => {

        if (message.author.id !== '187230571494244352') return;

        try {
        const code = args.join(" ");
        let evaled = eval(code);
    
        if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
    
        } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${client.clean(err)}\n\`\`\``);
        }
        
    }
}