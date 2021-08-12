const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guarded: true,
            description: 'Gives the amount of servers the bot is in.'
        });
    }

    async run(msg) {
        msg.send(`🖥  ::  The bot is in **${await this.client.guildCount()}** servers.`);
    }

};
