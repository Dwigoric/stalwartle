const { Precondition } = require('@sapphire/framework');

module.exports = class DJOnlyPrecondition extends Precondition {

    async run(msg) {
        if (!msg.member) return this.ok();
        if (msg.member.permissions.has('ADMINISTRATOR')) return this.ok();
        const musicGateway = this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (!musicGateway.music.dj.length) return this.ok();
        if (musicGateway.music.dj.some(role => Array.from(msg.member.roles.cache.keys()).includes(role))) return this.ok();
        return this.error();
    }

};
