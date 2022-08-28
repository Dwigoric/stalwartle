const { Precondition } = require('@sapphire/framework');

module.exports = class extends Precondition {

    constructor(context, options) {
        super(context, {
            ...options,
            position: 1
        });
    }

    chatInputRun(interaction) {
        if (!interaction.guild) return this.ok();
        if (this.container.client.settings.userBlacklist.includes(interaction.user.id)) return this.error();
        return this.ok();
    }

    messageRun(message) {
        if (!message.guild) return this.ok();
        if (this.container.client.settings.userBlacklist.includes(message.author.id)) return this.error();
        return this.ok();
    }

};
