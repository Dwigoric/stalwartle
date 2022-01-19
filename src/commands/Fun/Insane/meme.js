const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            cooldownDelay: 10,
            requiredClientPermissions: ['ATTACH_FILES'],
            description: 'Gives a random meme.'
        });
    }

    async messageRun(msg) {
        await send(msg, `${this.container.constants.EMOTES.loading}  ::  Loading meme...`);

        const meme = await fetch(`https://some-random-api.ml/meme`)
            .then(res => res.json())
            .catch(() => null);

        if (meme === null) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`);
        send(msg, { files: [{ attachment: meme.image, name: 'meme.png' }], content: meme.caption });

        return true;
    }

};
