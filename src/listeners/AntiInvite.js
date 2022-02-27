const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.MessageCreate });
    }

    async run(msg) {
        if (!msg.member) return null;
        if (!this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.antiInvite) return null;
        if ((await this.container.stores.get('preconditions').get('ModsOnly').run(msg)).success && this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.ignoreMods) return null;
        if (this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.filterIgnore.antiInvite.includes(msg.channel.id)) return null;
        if (msg.author.equals(this.container.client.user)) return null;

        const inviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/i;
        if (!inviteRegex.test(msg.content)) return null;
        if (msg.channel.postable) msg.channel.send(`Hey ${msg.author}! No sending invites allowed, or I'll punish you!`);
        if (msg.channel.permissionsFor(this.container.client.user).has('MANAGE_MESSAGES')) msg.delete().catch(() => null);

        const { duration, action } = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.options.antiInvite;
        const actionDuration = duration ? await this.container.client.arguments.get('time').run(`${duration}m`, '', msg) : null;
        switch (action) {
            case 'warn': return this.container.client.emit('modlogAction', {
                command: this.container.client.commands.get('warn'),
                channel: msg.channel,
                guild: msg.guild,
                content: msg.content
            }, msg.author, 'Sending invites with AntiInvite enabled', null);
            case 'kick': return this.container.client.commands.get('kick').run(msg, [msg.author, ['Sending invites with AntiInvite enabled']]).catch(err => msg.send(err));
            case 'mute': return this.container.client.commands.get('mute').run(msg, [msg.member, actionDuration, 'Sending invites with AntiInvite enabled'], true).catch(err => msg.send(err));
            case 'ban': return this.container.client.commands.get('ban').run(msg, [msg.author, null, actionDuration, ['Sending invites with AntiInvite enabled']], true).catch(err => msg.send(err));
            case 'softban': return this.container.client.commands.get('softban').run(msg, [msg.author, null, ['Sending invites with AntiInvite enabled']]).catch(err => msg.send(err));
        }
        return msg;
    }

};
