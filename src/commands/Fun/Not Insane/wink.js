const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Gives a random wink GIF.'
        });
    }

    async messageRun(msg) {
        await send(msg, `${this.container.constants.EMOTES.loading}  ::  Loading GIF...`);

        const { link } = await fetch(`https://some-random-api.ml/animu/wink`)
            .then(res => res.json())
            .catch(() => ({ link: null }));
        if (!link) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`);
        return send(msg, { content: `${this.container.constants.EMOTES.tick}  ::  GIF loaded!`, files: [{ attachment: link, name: 'wink.gif' }] });
    }

};
