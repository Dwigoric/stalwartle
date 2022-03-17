const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            guarded: true,
            description: 'Gives the amount of servers the bot is in.'
        });
        this.guarded = true;
    }

    async messageRun(msg) {
        reply(msg, `🖥  ::  The bot is in **${await this.container.client.guildCount()}** servers.`);
    }

};
