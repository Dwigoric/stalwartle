const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Gives a random hugging GIF.'
        });
    }

    async messageRun(msg, args) {
        let person = args.pickResult('member');
        if (!person.success) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  Please mention who you want to hug.`);
        person = person.value;

        await send(msg, `${this.container.constants.EMOTES.loading}  ::  Loading GIF...`);

        const { link } = await fetch(`https://some-random-api.ml/animu/hug`)
            .then(res => res.json())
            .catch(() => ({ link: null }));
        if (!link) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`);
        return send(msg, { content: `🤗  ::  **${msg.member.displayName}** wants to hug ${person}!`, files: [{ attachment: link, name: 'hug.gif' }] });
    }

};
