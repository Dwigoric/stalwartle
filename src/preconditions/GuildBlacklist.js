const { Precondition } = require('@sapphire/framework');

module.exports = class extends Precondition {

    constructor(context, options) {
        super(context, {
            ...options,
            position: 2
        });
    }

    chatInputRun(interaction) {
        return this.runForAll(interaction);
    }

    messageRun(message) {
        return this.runForAll(message);
    }

    runForAll(medium) {
        if (!medium.guild) return this.ok();
        if (this.container.client.settings.guildBlacklist.includes(medium.guildId)) return this.error();
        return this.ok();
    }

};
