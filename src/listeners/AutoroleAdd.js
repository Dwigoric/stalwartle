const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.GuildMemberAdd });
    }

    async run(member) {
        const { autorole } = this.container.stores.get('gateways').get('guildGateway').get(member.guild.id);
        if (!autorole.bot && !autorole.user) return null;

        const owner = await this.container.client.users.fetch(member.guild.ownerId, { cache: false });
        if (!member.guild.me.permissions.has('MANAGE_ROLES')) return owner.send(`⚠ I don't have **Manage Roles** permission on ${member.guild.name}, so I couldn't give ${member.user.tag} the autorole.`); // eslint-disable-line max-len
        if (member.user.bot && autorole.bot) return this.giveRole(member, 'bot', owner);
        if (!member.user.bot && autorole.user) return this.giveRole(member, 'user', owner);
        return null;
    }

    async giveRole(member, type, owner) {
        const role = member.guild.roles.cache.get(this.container.stores.get('gateways').get('guildGateway').get(member.guild.id).autorole[type]);
        if (!role) {
            owner.send(`The role **${this.container.stores.get('gateways').get('guildGateway').get(member.guild.id).autorole[type]}** doesn't exist anymore. Autorole aborted.`).catch(() => null);
            return this.container.stores.get('gateways').get('guildGateway').update({ autorole: { [type]: this.container.stores.get('gateways').get('guildGateway').defaults.autorole[type] } });
        }
        if (role.position >= member.guild.me.roles.highest.position) return owner.send(`⚠ **${role.name}**'s position was higher than my highest role, therefore I couldn't assign that autorole to anyone.`).catch(() => null); // eslint-disable-line max-len
        return member.roles.add(role, 'Autorole on join');
    }

};
