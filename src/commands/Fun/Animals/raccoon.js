const { Command } = require('@sapphire/framework');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            cooldown: 10,
            requiredPermissions: ['ATTACH_FILES'],
            description: 'Grabs a random raccoon image and fact.'
        });
    }

    async run(msg) {
        const message = await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading raccoon...`);

        const { image, fact } = await fetch(`https://some-random-api.ml/animal/racoon`)
            .then(res => res.json())
            .catch(() => { throw `${this.client.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`; });
        await msg.channel.sendFile(image, 'raccoon.jpg', `Random raccoon fact: ${fact}`);

        message.delete();
    }

};
