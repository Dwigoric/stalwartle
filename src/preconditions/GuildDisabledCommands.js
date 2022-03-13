const { Precondition } = require('@sapphire/framework');

module.exports = class extends Precondition {

    constructor(context, options) {
        super(context, {
            ...options,
            position: 3
        });
    }

    async run(msg, cmd) {
        if (!msg.guild) return this.ok();
        if (cmd.guarded) return this.ok();

        const disabled = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'disabledCommands');
        if (disabled.includes(cmd.name)) return this.error({ message: `This server has disabled the \`${cmd.name}\` command.` });
        return this.ok();
    }

};
