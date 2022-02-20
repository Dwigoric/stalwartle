const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Gives a random anime quote.'
        });
    }

    async messageRun(msg) {
        await send(msg, `${this.container.constants.EMOTES.loading}  ::  Loading quote...`);

        const { sentence, character, anime } = await fetch(`https://some-random-api.ml/animu/quote`)
            .then(res => res.json())
            .catch(() => ({ sentence: null, character: null, anime: null }));
        if (!sentence || !character || !anime) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`);
        return send(msg, `> ${sentence}\n> \n> _**${character}** on ${anime}_`);
    }

};
