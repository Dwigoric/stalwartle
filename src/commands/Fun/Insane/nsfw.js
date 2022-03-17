const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            nsfw: true,
            requiredClientPermissions: ['ATTACH_FILES'],
            description: 'Gives a random NSFW image. Must be in a NSFW channel.',
            detailedDescription: 'If you use the flag `--gif`, it will give a GIF instead of a static image.',
            flags: ['gif']
        });
    }

    async messageRun(msg, args) {
        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading image...`);
        const result = await fetch(`https://api.ksoft.si/images/random-nsfw?gifs=${args.getFlags('gif')}`, { headers: { Authorization: `Bearer ${process.env.KSOFT_API_KEY}` } }).then(res => res.json()); // eslint-disable-line max-len,no-process-env
        reply(msg, { files: [{ attachment: result.image_url }], content: `<${result.source}>` });
    }

};
