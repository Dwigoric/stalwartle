const { Event } = require('klasa');
const fetch = require('node-fetch');
const { idioticAPIkey } = require('../auth');

module.exports = class extends Event {

	async run(member) {
		const autorole = member.guild.settings.get('autorole');
		if (autorole.bot || autorole.user) {
			if (member.guild.me.permissions.has('MANAGE_ROLES')) {
				if (member.user.bot && autorole.bot) return await this.giveRole(member, 'bot');
				if (!member.user.bot && autorole.user) return await this.giveRole(member, 'user');
			} else { return member.guild.owner.send(`⚠ I don't have **Manage Roles** permission on ${member.guild.name}, so I couldn't give ${member.user.tag} the autorole.`); } // eslint-disable-line max-len
		}

		const welcome = member.guild.settings.get('welcome');
		if (!welcome.channel) return null;
		const chan = member.guild.channels.get(welcome.channel);
		if (!chan) {
			member.guild.owner.user.send(`⚠  ::  The welcome channel for ${member.guild.name} has been deleted. This setting has been reset.`).catch(() => null);
			return member.guild.settings.reset('welcome');
		}
		const params = [];
		for (const [key, value] of Object.entries({
			type: 'welcome',
			version: welcome.version,
			message: encodeURIComponent(`Welcome to ${member.guild.name}!`),
			bot: member.user.bot,
			avatar: member.user.displayAvatarURL({ size: 2048, format: 'png' }),
			username: encodeURIComponent(member.user.username),
			discriminator: member.user.discriminator,
			guildName: encodeURIComponent(member.guild.name),
			memberCount: member.guild.memberCount
		})) params.push(`${key}=${value}`);
		return chan.sendFile(Buffer.from(await fetch(`https://dev.anidiots.guide/greetings/unified?${params.join('&')}`, { headers: { Authorization: idioticAPIkey } })
			.then(res => res.json())
			.then(buffer => buffer.data)), 'welcome.png');
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
