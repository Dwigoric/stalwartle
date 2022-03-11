const { Precondition } = require('@sapphire/framework');

module.exports = class DJOnlyPrecondition extends Precondition {

    async run(msg) {
        if (!msg.member) return this.ok();
        if (msg.member.permissions.has('ADMINISTRATOR')) return this.ok();
        const guildGateway = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id);
        if (!guildGateway.music.dj.length) return this.ok();
        if (guildGateway.music.dj.some(role => Array.from(msg.member.roles.cache.keys()).includes(role))) return this.ok();
        return this.error();
    }

};
