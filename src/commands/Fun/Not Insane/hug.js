const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Gives a random hugging GIF.'
        });
        this.usage = '<Person:member>';
    }

    async messageRun(msg, args) {
        let person = await args.pickResult('member');
        if (!person.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please mention who you want to hug.`);
        person = person.value;

        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading GIF...`);

        const { link } = await fetch(`https://some-random-api.ml/animu/hug`)
            .then(res => res.json())
            .catch(() => ({ link: null }));
        if (!link) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`);
        return reply(msg, {
            allowedMentions: { users: [person.id] },
            content: `🤗  ::  **${msg.author}** wants to hug ${person}!`,
            files: [{ attachment: link, name: 'hug.gif' }]
        });
    }

};
