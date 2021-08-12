const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guarded: true,
            description: language => language.get('COMMAND_INVITE_DESCRIPTION')
        });
    }

    async run(msg) {
        if (!this.client.user.bot) return msg.reply(msg.language.get('COMMAND_INVITE_SELFBOT'));
        return msg.send(msg.language.get('COMMAND_INVITE', this.client));
    }

};
