const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.MessageCreate });
    }

    run(msg) {
        if (!msg.member) return;
        if (!this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'automod.antiSpam') && !this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'automod.mentionSpam')) return;
        this.container.cache.members.get(msg.member.id).addMessage(msg);
    }

};
