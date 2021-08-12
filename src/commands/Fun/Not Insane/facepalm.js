const { Command } = require('@sapphire/framework');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            requiredPermissions: ['EMBED_LINKS'],
            description: 'Gives a random facepalm GIF.'
        });
    }

    async run(msg) {
        const message = await msg.channel.send(`${this.client.constants.EMOTES.loading}  ::  Loading GIF...`);

        const { link } = await fetch(`https://some-random-api.ml/animu/face-palm`)
            .then(res => res.json())
            .catch(() => { throw `${this.client.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`; });
        msg.channel.sendFile(link, 'facepalm.gif');

        message.delete();
    }

};
