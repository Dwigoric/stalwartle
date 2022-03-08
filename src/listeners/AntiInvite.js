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
        if (msg.channel.permissionsFor(this.container.client.user).has('SEND_MESSAGES')) msg.channel.send(`Hey ${msg.author}! No sending invites allowed, or I'll punish you!`);
        if (msg.channel.permissionsFor(this.container.client.user).has('MANAGE_MESSAGES')) msg.delete().catch(() => null);

        const { duration, action } = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id).automod.options.antiInvite;

        return this.container.client.emit('modlogAction', action, this.container.client.user, msg.author, msg.guild, {
            content: msg.content,
            channel: msg.channel,
            reason: 'Sending invites with AntiInvite enabled',
            duration: Date.now() + (1000 * 60 * duration)
        });
    }

};
