const { Precondition } = require('@sapphire/framework');

module.exports = class DevsOnlyPrecondition extends Precondition {

    chatInputRunner(interaction) {
        return this.runForAll(interaction);
    }

    messageRun(message) {
        return this.runForAll(message);
    }

    runForAll(medium) {
        if (this.container.client.options.ownerID === medium.author.id) return this.ok();
        return this.error({ message: 'You do not have permission to use this command.' });
    }

};
