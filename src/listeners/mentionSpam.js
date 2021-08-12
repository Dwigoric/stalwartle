const { Monitor } = require('@sapphire/framework');

module.exports = class extends Monitor {

    constructor(...args) {
        super(...args, {
            ignoreOthers: false
        });
    }

    /* eslint complexity: ['warn', 25] */
    async run(msg) {
        if (!msg.guild) return null;
        if (!msg.guild.settings.get('automod.mentionSpam')) return null;
        if (msg.author.bot && msg.guild.settings.get('automod.ignoreBots')) return null;
        if (await msg.hasAtLeastPermissionLevel(6) && msg.guild.settings.get('automod.ignoreMods')) return null;
        if (msg.guild.settings.get('automod.filterIgnore.mentionSpam').includes(msg.channel.id)) return null;
        if (msg.author.equals(this.client.user)) return null;

        if (msg.member.messages.length && msg.member.messages
            .map(message => message.mentions.users ? message.mentions.users.size : 0 + message.mentions.roles ? message.mentions.roles.size : 0)
            .reduce((prev, val) => prev + val) < 10) return null;
        if (msg.channel.postable) msg.channel.send(`Hey ${msg.author}! Don't spam mentions, ${msg.author}. Got it, ${msg.author}?`);
        if (!msg.member.bannable) {
            return this.client.emit('modlogAction', {
                command: this.client.commands.get('warn'),
                channel: msg.channel,
                guild: msg.guild,
                content: msg.content.length > 900 ? [
                    `**Roles**: ${msg.member.messages.map(message => message.mentions.roles.map(rl => rl.toString()).join(', ')).join(', ')}`,
                    `**Users**: ${msg.member.messages.map(message => message.mentions.users.map(us => us.toString()).join(', ')).join(', ')}`
                ].join('\n') : msg.content
            }, msg.author, 'Spamming mentions with the MentionSpam enabled (member has higher permissions so I could not ban them)', null);
        }
        if (msg.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) msg.member.messages.forEach(message => message.delete().catch(() => null));

        const { duration, action } = await msg.guild.settings.get('automod.options.mentionSpam');
        const actionDuration = duration ? await this.client.arguments.get('time').run(`${duration}m`, '', msg) : null;
        switch (action) {
            case 'warn': return this.client.emit('modlogAction', {
                command: this.client.commands.get('warn'),
                channel: msg.channel,
                guild: msg.guild,
                content: msg.content
            }, msg.author, 'Spamming mentions with MentionSpam enabled', null);
            case 'kick': return this.client.commands.get('kick').run(msg, [msg.author, ['Spamming mentions with MentionSpam enabled']]).catch(err => msg.send(err));
            case 'mute': return this.client.commands.get('mute').run(msg, [msg.member, actionDuration, 'Spamming mentions with MentionSpam enabled'], true).catch(err => msg.send(err));
            case 'ban': return this.client.commands.get('ban').run(msg, [msg.author, null, actionDuration, ['Spamming mentions with MentionSpam enabled']], true).catch(err => msg.send(err));
            case 'softban': return this.client.commands.get('softban').run(msg, [msg.author, null, ['Spamming mentions with MentionSpam enabled']]).catch(err => msg.send(err));
        }
        return msg;
    }

};
