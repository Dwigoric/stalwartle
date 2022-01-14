const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['coin'],

            description: 'Flips one or more coins',
            usage: '[Coins:integer{0,1000}]'
        });
    }

    messageRun(msg, [coins = 0]) {
        if (coins > 1) {
            let heads = 0;
            let tails = 0;
            for (let i = 0; i < coins; i++) {
                if (Math.random() > 0.5) heads++;
                else tails++;
            }
            return msg.send(`💰  ::  You flipped ${coins} coins. ${heads} ${heads === '1' ? 'was' : 'were'} heads, and ${tails} ${tails === '1' ? 'was' : 'were'} tails.`);
        }
        return msg.send(`💰  ::  You flipped ${Math.random() > 0.5 ? 'Heads' : 'Tails'}.`);
    }

};
