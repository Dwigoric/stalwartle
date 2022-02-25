const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.GuildMemberAdd });
    }

    async run(member) {
        const { autorole } = this.container.stores.get('gateways').guilds.get(member.guild.id);
        if (!autorole.bot && !autorole.user) return null;
        if (member.guild.owner.partial) await member.guild.owner.fetch();
        if (member.guild.owner.user.partial) await member.guild.owner.user.fetch();
        if (!member.guild.me.permissions.has('MANAGE_ROLES')) return member.guild.owner.user.send(`⚠ I don't have **Manage Roles** permission on ${member.guild.name}, so I couldn't give ${member.user.tag} the autorole.`); // eslint-disable-line max-len
        if (member.user.bot && autorole.bot) return await this.giveRole(member, 'bot');
        if (!member.user.bot && autorole.user) return await this.giveRole(member, 'user');
        return null;
    }

    async giveRole(member, type) {
        const role = member.guild.roles.cache.get(this.container.stores.get('gateways').guilds.get(member.guild.id).autorole[type]);
        if (!role) {
            member.guild.owner.user.send(`The role **${this.container.stores.get('gateways').guilds.get(member.guild.id).autorole[type]}** doesn't exist anymore. Autorole aborted.`).catch(() => null);
            return this.container.stores.get('gateways').guilds.update({ autorole: { [type]: this.container.stores.get('gateways').guilds.defaults.autorole[type] } });
        }
        if (role.position >= member.guild.me.roles.highest.position) return member.guild.owner.user.send(`⚠ **${role.name}**'s position was higher than my highest role, therefore I couldn't assign that autorole to anyone.`).catch(() => null); // eslint-disable-line max-len
        return member.roles.add(role, 'Autorole on join');
    }

};
