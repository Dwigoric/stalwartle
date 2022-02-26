const { Precondition } = require('@sapphire/framework');

module.exports = class IgnoredPrecondition extends Precondition {

    async run(msg, cmd) {
        if (!msg.guild) return this.ok();
        if (cmd.name === 'ignore') return this.ok();
        if (this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).ignored.includes(msg.channel.id)) return this.error({ message: '🔇  ::  This channel is included in this server\'s ignored channels.' });
        return this.ok();
    }

};
