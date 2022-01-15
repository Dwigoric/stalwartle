const { Command } = require('@sapphire/framework');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            nsfw: true,
            requiredPermissions: ['ATTACH_FILES'],
            description: 'Gives a random NSFW image. Must be in a NSFW channel.',
            extendedHelp: 'If you use the flag `--gif`, it will give a GIF instead of a static image.'
        });
    }

    async messageRun(msg) {
        const message = await msg.send(`${this.container.constants.EMOTES.loading}  ::  Loading image...`);
        const result = await fetch(`https://api.ksoft.si/images/random-nsfw?gifs=${Boolean(msg.flagArgs.gif)}`, { headers: { Authorization: `Bearer ${this.container.auth.ksoftAPIkey}` } }).then(res => res.json()); // eslint-disable-line max-len
        await msg.channel.sendFile(result.image_url, undefined, `<${result.source}>`);
        message.delete();
    }

};
