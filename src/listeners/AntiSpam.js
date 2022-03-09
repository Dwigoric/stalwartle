const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.MessageCreate });
    }

    async run(msg) {
        if (!msg.member) return null;
        if (!this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.antiSpam) return null;
        if (msg.author.bot && this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.ignoreBots) return null;
        if ((await this.container.stores.get('preconditions').get('ModsOnly').run(msg)).success && this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.ignoreMods) return null;
        if (this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.filterIgnore.antiSpam.includes(msg.channel.id)) return null;
        if (msg.author.equals(this.container.client.user)) return null;

        if (this.container.cache.members.get(msg.member.id).messages.length <= this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.options.antiSpam.limit) return null;
        if (msg.channel.permissionsFor(this.container.client.user).has('SEND_MESSAGES')) msg.channel.send(`Hey ${msg.author}! No spamming allowed, or I'll punish you!`);
        if (msg.channel.permissionsFor(this.container.client.user).has('MANAGE_MESSAGES')) this.container.cache.members.get(msg.member.id).messages.forEach(message => message.delete().catch(() => null));

        const { duration, action } = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.options.antiSpam;

        return this.container.client.emit('modlogAction', action, this.container.client.user, msg.author, msg.guild, {
            content: msg.content,
            channel: msg.channel,
            reason: 'Spamming with AntiSpam enabled',
            duration: Date.now() + (1000 * 60 * duration)
        });
    }

};
