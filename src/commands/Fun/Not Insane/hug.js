const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredPermissions: ['EMBED_LINKS'],
            description: 'Gives a random hugging GIF.',
            usage: '<Person:member>'
        });
    }

    async messageRun(msg, [person]) {
        const message = await msg.send(`${this.container.client.constants.EMOTES.loading}  ::  Loading GIF...`);

        const { link } = await fetch(`https://some-random-api.ml/animu/hug`)
            .then(res => res.json())
            .catch(() => { throw `${this.container.client.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`; });
        msg.channel.sendFile(link, 'hug.gif', `🤗  ::  **${msg.member.displayName}** wants to hug ${person}!`);

        message.delete();
    }

};
