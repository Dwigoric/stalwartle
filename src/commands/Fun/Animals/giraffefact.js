const { Command, container } = require('@sapphire/framework');
const { reply } = container;
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            cooldownDelay: 10,
            requiredClientPermissions: ['ATTACH_FILES'],
            description: 'Grabs a random giraffe fact.'
        });
    }

    async messageRun(msg) {
        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading giraffe fact...`);

        const { fact } = await fetch(`https://some-random-api.com/facts/giraffe`)
            .then(res => res.json())
            .catch(() => ({ fact: null }));
        if (!fact) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`);
        await reply(msg, `🦒  ::  ${fact}`);

        return true;
    }

};
