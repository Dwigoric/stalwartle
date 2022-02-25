const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.MessageCreate });
    }

    run(msg) {
        if (!msg.member) return;
        if (!msg.guild.settings.get('automod.antiSpam') && !msg.guild.settings.get('automod.mentionSpam')) return;
        this.container.client.cache.members.get(msg.member.id).addMessage(msg);
    }

};
