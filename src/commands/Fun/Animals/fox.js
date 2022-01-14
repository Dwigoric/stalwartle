const { Command } = require('@sapphire/framework');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            cooldown: 10,
            requiredPermissions: ['ATTACH_FILES'],
            description: 'Grabs a random fox image and fact.'
        });
    }

    async messageRun(msg) {
        const message = await msg.send(`${this.container.client.constants.EMOTES.loading}  ::  Loading fox...`);

        const { image, fact } = await fetch(`https://some-random-api.ml/animal/fox`)
            .then(res => res.json())
            .catch(() => { throw `${this.container.client.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`; });
        await msg.channel.sendFile(image, 'fox.jpg', `Random fox fact: ${fact}`);

        message.delete();
    }

};
