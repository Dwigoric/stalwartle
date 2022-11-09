const { Precondition } = require('@sapphire/framework');

module.exports = class IgnoredPrecondition extends Precondition {

    constructor(context, options) {
        super(context, {
            ...options,
            position: 4
        });
    }

    chatInputRun(interaction, command) {
        return this.runForAll(interaction, command);
    }

    messageRun(message, command) {
        return this.runForAll(message, command);
    }

    runForAll(medium, command) {
        if (command.name === 'ignore') return this.ok();
        if (medium.guild && this.container.stores.get('gateways').get('guildGateway').get(medium.guildId).ignored.includes(medium.channelId)) return this.error({ message: '🔇  ::  This channel is included in this server\'s ignored channels.' });
        return this.ok();
    }

};
