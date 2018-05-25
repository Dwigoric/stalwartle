const { Event } = require('klasa');

module.exports = class extends Event {

	async run(member) {
		const guildConf = member.guild.configs;
		if (member.user.bot && guildConf.autorole.bot) {
			return await this.subRun(member, 'bot');
		} else if (!member.user.bot && guildConf.autorole.user) {
			return await this.subRun(member, 'user');
		}
		return true;
	}

	async subRun(member, type) {
		const role = member.guild.roles.get(member.guild.configs.autorole[type]);
		if (!role) {
			member.guild.owner.user.send(`The role **${member.guild.configs.autorole[type]}** doesn't exist anymore. Autorole aborted.`).catch(() => null);
			return member.guild.configs.reset(`autorole.${type}`);
		}
		if (member.permissions.bitfield > member.guild.me.permissions.bitfield) return member.guild.owner.user.send(`⚠ **${member.tag}**'s permissions were higher than mine, so I couldn't give them **${role.name}**.`).catch(() => null); // eslint-disable-line max-len
		return member.roles.add(role);
	}

};
