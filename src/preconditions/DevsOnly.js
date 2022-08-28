const { Precondition } = require('@sapphire/framework');

module.exports = class DevsOnlyPrecondition extends Precondition {

    chatInputRun(interaction) {
        if (this.container.client.options.developers.includes(interaction.user.id)) return this.ok();
        return this.error({ message: 'Only developers are allowed to use this command.' });
    }

    messageRun(message) {
        if (this.container.client.options.developers.includes(message.author.id)) return this.ok();
        return this.error({ message: 'Only developers are allowed to use this command.' });
    }

};
