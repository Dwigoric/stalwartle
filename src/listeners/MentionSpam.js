const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.MessageCreate });
    }

    /* eslint complexity: ['warn', 25] */
    async run(msg) {
        if (!msg.member) return null;
        if (!this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.mentionSpam) return null;
        if (msg.author.bot && this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.ignoreBots) return null;
        if ((await this.container.stores.get('preconditions').get('ModsOnly').run(msg)).success && this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.ignoreMods) return null;
        if (this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.filterIgnore.mentionSpam.includes(msg.channel.id)) return null;
        if (msg.author.equals(this.container.client.user)) return null;

        if (this.container.cache.members.get(msg.member.id).messages.length && this.container.cache.members.get(msg.member.id).messages
            .map(message => message.mentions.users ? message.mentions.users.size : 0 + message.mentions.roles ? message.mentions.roles.size : 0)
            .reduce((prev, val) => prev + val) < 10) return null;
        if (msg.channel.permissionsFor(this.container.client.user).has('SEND_MESSAGES')) msg.channel.send(`Hey ${msg.author}! Don't spam mentions, ${msg.author}. Got it, ${msg.author}?`);
        this.container.cache.members.get(msg.member.id).messages.forEach(message => { if (message.deletable) message.delete().catch(() => null); });

        const { duration, action } = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.options.mentionSpam;

        if (!msg.member.bannable && action === 'ban') {
            return this.container.client.emit('modlogAction', 'warn', this.container.client.user, msg.author, msg.guild, {
                content: msg.content.length > 900 ? [
                    `**Roles**: ${this.container.cache.members.get(msg.member.id).messages.map(message => message.mentions.roles.map(rl => rl.toString()).join(', ')).join(', ')}`,
                    `**Users**: ${this.container.cache.members.get(msg.member.id).messages.map(message => message.mentions.users.map(us => us.toString()).join(', ')).join(', ')}`
                ].join('\n') : msg.content,
                channel: msg.channel,
                reason: 'Spamming mentions with MentionSpam enabled'
            }, msg.author, 'Spamming mentions with the MentionSpam enabled (member has higher permissions so I could not ban them)', null);
        }

        return this.container.client.emit('modlogAction', action, this.container.client.user, msg.author, msg.guild, {
            content: msg.content,
            channel: msg.channel,
            reason: 'Spamming mentions with MentionSpam enabled',
            duration: Date.now() + (1000 * 60 * duration)
        });
    }

};
