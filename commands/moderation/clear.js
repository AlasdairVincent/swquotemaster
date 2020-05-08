module.exports = {
    name: 'clear',
    category: 'moderation',
    run: (client, message, args, author) => {

        if (message.author.id !== '187230571494244352') return;

        let num = args[0];

        message.channel.bulkDelete(+num + 1);

        return;
    }
}