const { Precondition } = require('@sapphire/framework');

module.exports = class extends Precondition {

    constructor(context, options) {
        super(context, {
            ...options,
            position: 1
        });
    }

    run(msg) {
        if (!msg.guild) return this.ok();
        if (this.container.client.settings.guildBlacklist.includes(msg.guild.id)) return this.error();
        return this.ok();
    }

};
