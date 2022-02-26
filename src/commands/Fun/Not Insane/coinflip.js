const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['coin'],
            description: 'Flips one or more coins'
        });
    }

    messageRun(msg, args) {
        const coins = args.pick('integer').catch(() => 1);
        if (coins < 1 || coins > 1000) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Amount of coins must be 1 to 1000.`);

        if (coins > 1) {
            let heads = 0;
            let tails = 0;
            for (let i = 0; i < coins; i++) {
                if (Math.random() > 0.5) heads++;
                else tails++;
            }
            return reply(msg, `💰  ::  You flipped ${coins} coins. ${heads} ${heads === '1' ? 'was' : 'were'} heads, and ${tails} ${tails === '1' ? 'was' : 'were'} tails.`);
        }
        return reply(msg, `💰  ::  You flipped ${Math.random() > 0.5 ? 'Heads' : 'Tails'}.`);
    }

};
