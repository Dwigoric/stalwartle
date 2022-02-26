const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            cooldownDelay: 10,
            requiredClientPermissions: ['ATTACH_FILES'],
            description: 'Grabs a random fox image and fact.'
        });
    }

    async messageRun(msg) {
        const message = await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading fox...`);

        const { image, fact } = await fetch(`https://some-random-api.ml/animal/fox`)
            .then(res => res.json())
            .catch(() => ({ image: null, fact: null }));
        if (!image || !fact) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`);
        await reply(message, { files: [{ attachment: image, name: 'fox.jpg' }], content: `Random fox fact: ${fact}` });

        message.delete();
        return true;
    }

};
