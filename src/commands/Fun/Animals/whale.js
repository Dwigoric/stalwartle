const { Command } = require('@sapphire/framework');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            cooldown: 10,
            requiredPermissions: ['ATTACH_FILES'],
            description: 'Grabs a random whale image and fact.'
        });
    }

    async run(msg) {
        const message = await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading whale...`);

        const { link } = await fetch(`https://some-random-api.ml/img/whale`)
            .then(res => res.json())
            .catch(() => { throw `${this.client.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`; });

        const { fact } = await fetch(`https://some-random-api.ml/facts/whale`)
            .then(res => res.json())
            .catch(() => { throw `${this.client.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`; });
        await msg.channel.sendFile(link, 'whale.gif', `Random whale fact: ${fact}`);

        message.delete();
    }

};
