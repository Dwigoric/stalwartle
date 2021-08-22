const { Command } = require('@sapphire/framework');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            cooldown: 10,
            requiredPermissions: ['ATTACH_FILES'],
            description: 'Grabs a random dog image and fact.'
        });
    }

    async run(msg) {
        const message = await msg.send(`${this.container.client.constants.EMOTES.loading}  ::  Loading dog...`);

        const { image, fact } = await fetch(`https://some-random-api.ml/animal/dog`)
            .then(res => res.json())
            .catch(() => { throw `${this.container.client.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`; });
        await msg.channel.sendFile(image, 'dog.jpg', `Random dog fact: ${fact}`);

        message.delete();
    }

};
