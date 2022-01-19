const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            nsfw: true,
            requiredClientPermissions: ['ATTACH_FILES'],
            description: 'Gives a random NSFW image. Must be in a NSFW channel.',
            detailedDescription: 'If you use the flag `--gif`, it will give a GIF instead of a static image.',
            flags: ['gif']
        });
    }

    async messageRun(msg, args) {
        await send(msg, `${this.container.constants.EMOTES.loading}  ::  Loading image...`);
        const result = await fetch(`https://api.ksoft.si/images/random-nsfw?gifs=${args.getFlags('gif')}`, { headers: { Authorization: `Bearer ${this.container.auth.ksoftAPIkey}` } }).then(res => res.json()); // eslint-disable-line max-len
        send(msg, { files: [{ attachment: result.image_url }], content: `<${result.source}>` });
    }

};
