const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(...args) {
        super(...args, { event: Events.MessageCreate });
    }

    run(msg) {
        if (!msg.member) return;
        if (!msg.guild.settings.get('automod.antiSpam') && !msg.guild.settings.get('automod.mentionSpam')) return;
        msg.member.addMessage(msg);
    }

};
