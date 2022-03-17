const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const Dice = require('roll');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['roll'],
            description: 'Rolls a die or multiple dice for you!',
            detailedDescription: [
                'Format: #ds [ + #ds + ... ]',
                'Ex. `s.dice 2d20` or `s.dice 3d10 + 6d12`'
            ].join('\n')
        });
        this.usage = '[Rolled:string]';
    }

    async messageRun(msg, args) {
        const rolled = await args.rest('string').catch(() => null);

        const dice = new Dice();
        if (!rolled) return reply(msg, `🎲  ::  **One die** (default) was embedded with magic and resulted to **${dice.roll('d6').result}**!`);
        if (!dice.validate(rolled)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  **${rolled}** cannot be embedded with magic.`);
        return reply(msg, `🎲  ::  **${rolled}** was embedded with magic and resulted to **${dice.roll(rolled).result}**!`);
    }

};
