const { Precondition } = require('@sapphire/framework');

module.exports = class extends Precondition {

    constructor(context, options) {
        super(context, {
            ...options,
            position: 0
        });
    }

    run(msg) {
        if (!msg.guild) return this.ok();
        if (this.container.client.settings.userBlacklist.includes(msg.author.id)) return this.error();
        return this.ok();
    }

};
