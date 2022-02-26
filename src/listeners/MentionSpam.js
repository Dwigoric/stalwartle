const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.MessageCreate });
    }

    /* eslint complexity: ['warn', 25] */
    async run(msg) {
        if (!msg.guild) return null;
        if (!this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.mentionSpam) return null;
        if (msg.author.bot && this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.ignoreBots) return null;
        if (await msg.hasAtLeastPermissionLevel(6) && this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.ignoreMods) return null;
        if (this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.filterIgnore.mentionSpam.includes(msg.channel.id)) return null;
        if (msg.author.equals(this.container.client.user)) return null;

        if (this.container.cache.members.get(msg.member.id).messages.length && this.container.cache.members.get(msg.member.id).messages
            .map(message => message.mentions.users ? message.mentions.users.size : 0 + message.mentions.roles ? message.mentions.roles.size : 0)
            .reduce((prev, val) => prev + val) < 10) return null;
        if (msg.channel.postable) msg.channel.send(`Hey ${msg.author}! Don't spam mentions, ${msg.author}. Got it, ${msg.author}?`);
        if (!msg.member.bannable) {
            return this.container.client.emit('modlogAction', {
                command: this.container.client.commands.get('warn'),
                channel: msg.channel,
                guild: msg.guild,
                content: msg.content.length > 900 ? [
                    `**Roles**: ${this.container.cache.members.get(msg.member.id).messages.map(message => message.mentions.roles.map(rl => rl.toString()).join(', ')).join(', ')}`,
                    `**Users**: ${this.container.cache.members.get(msg.member.id).messages.map(message => message.mentions.users.map(us => us.toString()).join(', ')).join(', ')}`
                ].join('\n') : msg.content
            }, msg.author, 'Spamming mentions with the MentionSpam enabled (member has higher permissions so I could not ban them)', null);
        }
        if (msg.channel.permissionsFor(this.container.client.user).has('MANAGE_MESSAGES')) this.container.cache.members.get(msg.member.id).messages.forEach(message => message.delete().catch(() => null));

        const { duration, action } = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.options.mentionSpam;
        const actionDuration = duration ? await this.container.client.arguments.get('time').run(`${duration}m`, '', msg) : null;
        switch (action) {
            case 'warn': return this.container.client.emit('modlogAction', {
                command: this.container.client.commands.get('warn'),
                channel: msg.channel,
                guild: msg.guild,
                content: msg.content
            }, msg.author, 'Spamming mentions with MentionSpam enabled', null);
            case 'kick': return this.container.client.commands.get('kick').run(msg, [msg.author, ['Spamming mentions with MentionSpam enabled']]).catch(err => msg.send(err));
            case 'mute': return this.container.client.commands.get('mute').run(msg, [msg.member, actionDuration, 'Spamming mentions with MentionSpam enabled'], true).catch(err => msg.send(err));
            case 'ban': return this.container.client.commands.get('ban').run(msg, [msg.author, null, actionDuration, ['Spamming mentions with MentionSpam enabled']], true).catch(err => msg.send(err));
            case 'softban': return this.container.client.commands.get('softban').run(msg, [msg.author, null, ['Spamming mentions with MentionSpam enabled']]).catch(err => msg.send(err));
        }
        return msg;
    }

};
