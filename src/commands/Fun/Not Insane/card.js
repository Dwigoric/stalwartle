const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['carddraw', 'drawcard'],
            description: 'Draws some random cards from a deck.',
            usage: '[Num:integer{1,10}]'
        });
    }

    async messageRun(msg, [num = 1]) {
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const suits = ['♠️', '♦', '♥️', '♠️'];
        const lines = [];

        for (let i = 0; i < num; i++) {
            lines.push(`**${ranks[Math.floor(Math.random() * ranks.length)]}**${suits[Math.floor(Math.random() * suits.length)]}`);
        }

        return msg.send(`You drew ${lines.join(', ')}.`);
    }

};
