const { Precondition } = require('@sapphire/framework');

module.exports = class extends Precondition {

    constructor(context, options) {
        super(context, {
            ...options,
            position: 3
        });
    }

    chatInputRun(interaction, command) {
        return this.runForAll(interaction, command);
    }

    messageRun(message, command) {
        return this.runForAll(message, command);
    }

    runForAll(medium, command) {
        if (!medium.guild) return this.ok();
        if (command.guarded) return this.ok();

        const disabled = this.container.stores.get('gateways').get('guildGateway').get(medium.guildId, 'disabledCommands');
        if (disabled.includes(command.name)) return this.error({ message: `This server has disabled the \`${command.name}\` command.` });
        return this.ok();
    }

};
