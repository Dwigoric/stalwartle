const { Precondition } = require('@sapphire/framework');

module.exports = class DevsOnlyPrecondition extends Precondition {

    async run(msg) {
        if (this.container.client.options.ownerID === msg.author.id) return this.ok();
        return this.error({ message: 'You do not have permission to use this command.' });
    }

};
