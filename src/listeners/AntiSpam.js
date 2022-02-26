const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.MessageCreate });
    }

    async run(msg) {
        if (!msg.guild) return null;
        if (!this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.antiSpam) return null;
        if ((await this.container.stores.get('preconditions').get('ModsOnly').run(msg)).success && this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.ignoreMods) return null;
        if (this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.filterIgnore.antiSpam.includes(msg.channel.id)) return null;
        if (msg.author.equals(this.container.client.user)) return null;

        if (this.container.cache.members.get(msg.member.id).messages.length <= this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.options.antiSpam.limit) return null;
        if (msg.channel.postable) msg.channel.send(`Hey ${msg.author}! No spamming allowed, or I'll punish you!`);
        if (msg.channel.permissionsFor(this.container.client.user).has('MANAGE_MESSAGES')) this.container.cache.members.get(msg.member.id).messages.forEach(message => message.delete().catch(() => null));

        const { duration, action } = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.options.antiSpam;
        const actionDuration = duration ? await this.container.client.arguments.get('time').run(`${duration}m`, '', msg) : null;
        switch (action) {
            case 'warn': return this.container.client.emit('modlogAction', {
                command: this.container.client.commands.get('warn'),
                channel: msg.channel,
                guild: msg.guild,
                content: msg.content
            }, msg.author, 'Spamming with AntiSpam enabled', null);
            case 'kick': return this.container.client.commands.get('kick').run(msg, [msg.author, ['Spamming with AntiSpam enabled']]).catch(err => msg.send(err));
            case 'mute': return this.container.client.commands.get('mute').run(msg, [msg.member, actionDuration, 'Spamming with AntiSpam enabled'], true).catch(err => msg.send(err));
            case 'ban': return this.container.client.commands.get('ban').run(msg, [msg.author, null, actionDuration, ['Spamming with AntiSpam enabled']], true).catch(err => msg.send(err));
            case 'softban': return this.container.client.commands.get('softban').run(msg, [msg.author, null, ['Spamming with AntiSpam enabled']]).catch(err => msg.send(err));
        }
        return msg;
    }

};
