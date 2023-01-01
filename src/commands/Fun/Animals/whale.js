const { Command, container } = require('@sapphire/framework');
const { reply } = container;
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            cooldownDelay: 10,
            requiredClientPermissions: ['ATTACH_FILES'],
            description: 'Grabs a random whale image and fact.'
        });
    }

    async messageRun(msg) {
        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading whale...`);

        const { link } = await fetch(`https://some-random-api.ml/img/whale`)
            .then(res => res.json())
            .catch(() => ({ link: null }));

        const { fact } = await fetch(`https://some-random-api.ml/facts/whale`)
            .then(res => res.json())
            .catch(() => ({ fact: null }));

        if (!fact || !link) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`);
        await reply(msg, { files: [{ attachment: link, name: 'whale.gif' }], content: `Random whale fact: ${fact}` });

        return true;
    }

};
