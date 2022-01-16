const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            cooldownDelay: 10,
            requiredClientPermissions: ['ATTACH_FILES'],
            description: 'Grabs a random elephant fact.'
        });
    }

    async messageRun(msg) {
        const message = await send(msg, `${this.container.constants.EMOTES.loading}  ::  Loading elephant fact...`);

        const { fact } = await fetch(`https://some-random-api.ml/facts/elephant`)
            .then(res => res.json())
            .catch(() => ({ fact: null }));
        if (!fact) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`);
        await send(msg, `🐘  ::  ${fact}`);

        message.delete();
        return true;
    }

};
