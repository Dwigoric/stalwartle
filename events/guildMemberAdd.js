const { Event } = require('klasa');

module.exports = class extends Event {

	async run(member) {
		const guildConf = member.guild.settings;
		if (member.user.bot && guildConf.autorole.bot) return await this.giveRole(member, 'bot');
		if (!member.user.bot && guildConf.autorole.user) return await this.giveRole(member, 'user');
		return null;
	}

	async giveRole(member, type) {
		const role = member.guild.roles.get(member.guild.settings.autorole[type]);
		if (!role) {
			member.guild.owner.send(`The role **${member.guild.settings.autorole[type]}** doesn't exist anymore. Autorole aborted.`).catch(() => null);
			return member.guild.settings.reset(`autorole.${type}`);
		}
		if (member.permissions.bitfield > member.guild.me.permissions.bitfield) return member.guild.owner.user.send(`⚠ **${member.tag}**'s permissions were higher than mine, so I couldn't give them **${role.name}**.`).catch(() => null); // eslint-disable-line max-len
		return member.roles.add(role, 'Autorole on join');
	}

};
