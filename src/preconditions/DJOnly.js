const { Precondition } = require('@sapphire/framework');

module.exports = class DJOnlyPrecondition extends Precondition {

    chatInputRun(interaction) {
        return this.runForAll(interaction);
    }

    messageRun(message) {
        return this.runForAll(message);
    }

    runForAll(medium) {
        if (!medium.member) return this.ok();
        if (medium.member.permissions.has('ADMINISTRATOR')) return this.ok();
        const guildGateway = this.container.stores.get('gateways').get('guildGateway').get(medium.guildId);
        if (!guildGateway.music.dj.length) return this.ok();
        if (guildGateway.music.dj.some(role => Array.from(medium.member.roles.cache.keys()).includes(role))) return this.ok();
        return this.error({ message: 'This server has implemented music DJs, and you are not in the DJ list.' });
    }

};
