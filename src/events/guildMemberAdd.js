const { Event } = require('klasa');

module.exports = class extends Event {

	async run(member) {
		if (!member.guild.me.permissions.has('MANAGE_ROLES')) return member.guild.owner.send(`⚠ I don't have **Manage Roles** permission on ${member.guild.name}, so I couldn't give ${member.user.tag} the autorole.`); // eslint-disable-line max-len
		const autorole = member.guild.settings.get('autorole');
		if (member.user.bot && autorole.bot) return await this.giveRole(member, 'bot');
		if (!member.user.bot && autorole.user) return await this.giveRole(member, 'user');
		return null;
	}

	async giveRole(member, type) {
		const role = member.guild.roles.get(member.guild.settings.get(`autorole.${type}`));
		if (!role) {
			member.guild.owner.send(`The role **${member.guild.settings.get(`autorole.${type}`)}** doesn't exist anymore. Autorole aborted.`).catch(() => null);
			return member.guild.settings.reset(`autorole.${type}`);
		}
		if (role.position >= member.guild.me.roles.highest.position) return member.guild.owner.user.send(`⚠ **${role.name}**'s position was higher than my highest role, therefore I couldn't assign that autorole to anyone.`).catch(() => null); // eslint-disable-line max-len
		if (member.permissions.bitfield > member.guild.me.permissions.bitfield) return member.guild.owner.user.send(`⚠ **${member.tag}**'s permissions were higher than mine, so I couldn't give them **${role.name}**.`).catch(() => null); // eslint-disable-line max-len
		return member.roles.add(role, 'Autorole on join');
	}

};
