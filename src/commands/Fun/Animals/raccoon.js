const { Command, container } = require('@sapphire/framework');
const { reply } = container;
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            cooldownDelay: 10,
            requiredClientPermissions: ['ATTACH_FILES'],
            description: 'Grabs a random raccoon image and fact.'
        });
    }

    async messageRun(msg) {
        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading raccoon...`);

        const { image, fact } = await fetch(`https://some-random-api.com/animal/raccoon`)
            .then(res => res.json())
            .catch(() => ({ image: null, fact: null }));
        if (!image || !fact) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`);
        await reply(msg, { files: [{ attachment: image, name: 'raccoon.jpg' }], content: `Random raccoon fact: ${fact}` });

        return true;
    }

};
