const { Listener, Events } = require('@sapphire/framework');
const fetch = require('node-fetch');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.GuildMemberAdd });
    }

    async run(member) {
        if (!this.container.stores.get('gateways').get('guildGateway').get(member.guild.id).globalBans) return null;
        if (!member.guild.me.permissions.has('BAN_MEMBERS')) {
            member.guild.settings.reset('globalBans');
            if (member.guild.owner.partial) await member.guild.owner.fetch();
            if (member.guild.owner.user.partial) await member.guild.owner.user.fetch();
            return member.guild.owner.user.send('⚠  ::  I do not have permission to ban. I\'ve disabled the global bans settings on your server.');
        }
        // eslint-disable-next-line camelcase
        const { is_banned } = await fetch(`https://api.ksoft.si/bans/check?user=${member.id}`, { headers: { Authorization: `Bearer ${this.container.auth.ksoftAPIkey}` } }).then(res => res.json());
        if (!is_banned) return null; // eslint-disable-line camelcase
        await member.user.send(`⚠  ::  ${member.guild.name} has their global bans enabled, and you are globally banned, therefore I've banned you from the server.`);
        await member.guild.members.ban(member.user, { days: 0, reason: 'Globally banned with global bans setting enabled' });
        return this.container.client.emit('modlogAction', {
            command: this.container.client.commands.get('ban'),
            guild: member.guild
        }, member.user, 'Globally banned with global bans setting enabled', null);
    }

};
