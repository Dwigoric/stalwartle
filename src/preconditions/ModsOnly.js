const { Precondition } = require('@sapphire/framework');

module.exports = class ModsOnlyPrecondition extends Precondition {

    async run(msg) {
        if (!msg.member) return this.error();
        if (msg.member.permissions.has('ADMINISTRATOR')) return this.ok();
        const guildGateway = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id);
        if (guildGateway.moderators.roles.some(role => Array.from(msg.member.roles.cache.keys()).includes(role))) return this.ok();
        if (guildGateway.moderators.users.includes(msg.author.id)) return this.ok();
        return this.error({ message: 'Only moderators are allowed to use this command.' });
    }

};
