const { Precondition } = require('@sapphire/framework');

module.exports = class DJOnlyPrecondition extends Precondition {

    async run(msg) {
        if (!msg.member) return this.ok();
        const musicGateway = this.container.stores.get('gateways').music.get(msg.guild.id);
        if (!musicGateway.music.dj.length) return this.ok();
        if (musicGateway.music.dj.some(role => msg.member.roles.cache.keyArray().includes(role))) return this.ok();
        return this.error();
    }

};
