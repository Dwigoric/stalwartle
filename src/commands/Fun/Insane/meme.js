const { Command, container } = require('@sapphire/framework');
const { reply } = container;
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            cooldownDelay: 10,
            requiredClientPermissions: ['ATTACH_FILES'],
            description: 'Gives a random meme.'
        });
    }

    async messageRun(msg) {
        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading meme...`);

        const meme = await fetch(`https://some-random-api.ml/meme`)
            .then(res => res.json())
            .catch(() => null);

        if (meme === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`);
        reply(msg, { files: [{ attachment: meme.image, name: 'meme.png' }], content: meme.caption });

        return true;
    }

};
