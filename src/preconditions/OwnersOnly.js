const { Precondition } = require('@sapphire/framework');

module.exports = class DevsOnlyPrecondition extends Precondition {

    chatInputRun(interaction) {
        return this.runForAll(interaction);
    }

    messageRun(message) {
        return this.runForAll(message);
    }

    runForAll(medium) {
        if (this.container.client.options.ownerID === (medium.author || medium.user).id) return this.ok();
        return this.error({ message: 'You do not have permission to use this command.' });
    }

};
