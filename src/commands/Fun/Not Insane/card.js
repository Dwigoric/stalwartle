const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['carddraw', 'drawcard'],
            description: 'Draws some random cards from a deck.'
        });
    }

    async messageRun(msg, args) {
        const num = await args.pick('integer').catch(() => 1);
        if (num < 1 || num > 10) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Amount of card must be 1 to 10!`);

        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const suits = ['♠️', '♦', '♥️', '♠️'];
        const lines = [];

        for (let i = 0; i < num; i++) {
            lines.push(`**${ranks[Math.floor(Math.random() * ranks.length)]}**${suits[Math.floor(Math.random() * suits.length)]}`);
        }

        return reply(msg, `You drew ${lines.join(', ')}.`);
    }

};
