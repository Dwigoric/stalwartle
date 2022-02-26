const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            cooldownDelay: 10,
            requiredClientPermissions: ['ATTACH_FILES'],
            description: 'Grabs a random elephant fact.'
        });
    }

    async messageRun(msg) {
        const message = await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading elephant fact...`);

        const { fact } = await fetch(`https://some-random-api.ml/facts/elephant`)
            .then(res => res.json())
            .catch(() => ({ fact: null }));
        if (!fact) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`);
        await reply(msg, `🐘  ::  ${fact}`);

        message.delete();
        return true;
    }

};
