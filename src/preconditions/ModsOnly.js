const { Precondition } = require('@sapphire/framework');

module.exports = class ModsOnlyPrecondition extends Precondition {

    async run(msg) {
        if (!msg.member) return this.ok();
        const musicGateway = this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (musicGateway.moderators.roles.some(role => msg.member.roles.cache.keyArray().includes(role))) return this.ok();
        if (musicGateway.moderators.users.includes(msg.author.id)) return this.ok();
        return this.error();
    }

};
