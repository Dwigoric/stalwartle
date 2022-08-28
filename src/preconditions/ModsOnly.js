const { Precondition } = require('@sapphire/framework');

module.exports = class ModsOnlyPrecondition extends Precondition {

    chatInputRun(interaction) {
        return this.runForAll(interaction);
    }

    messageRun(message) {
        return this.runForAll(message);
    }

    runForAll(medium) {
        if (!medium.member) return this.error();
        if (medium.member.permissions.has('ADMINISTRATOR')) return this.ok();
        const guildGateway = this.container.stores.get('gateways').get('guildGateway').get(medium.guildId);
        if (guildGateway.moderators.roles.some(role => Array.from(medium.member.roles.cache.keys()).includes(role))) return this.ok();
        if (guildGateway.moderators.users.includes(medium.author.id)) return this.ok();
        return this.error({ message: 'Only moderators are allowed to use this command.' });
    }

};
