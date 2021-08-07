const { Event } = require('@sapphire/framework');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberAdd' });
	}

	async run(member) {
		if (!member.guild.settings.get('muteRole')) return;
		if (!member.guild.settings.get('muted').includes(member.user.id)) return;

		if (member.guild.owner.partial) await member.guild.owner.fetch();
		if (member.guild.owner.user.partial) await member.guild.owner.user.fetch();

		const muteRole = member.guild.roles.cache.get(member.guild.settings.get('muteRole'));
		if (!muteRole) {
			member.guild.owner.user.send('⚠  ::  Whoops! The mute role has been deleted. The muterole setting has been reset.').catch(() => null);
			member.guild.settings.reset('muteRole');
		} else if (muteRole.position >= member.guild.me.roles.highest.position) {
			member.guild.owner.user.send(`⚠  ::  The mute role **${muteRole.name}** is higher than me, so I couldn't give ${member.user.tag} the mute role.`);
		} else {
			await member.roles.add(muteRole, 'Muted');
			for (const channel of member.guild.channels.cache.values()) {
				if (channel.type === 'text') channel.updateOverwrite(muteRole, { SEND_MESSAGES: false }, 'Muted');
				else if (channel.type === 'voice') channel.updateOverwrite(muteRole, { SPEAK: false }, 'Muted');
				else channel.updateOverwrite(muteRole, { SEND_MESSAGES: false, SPEAK: false }, 'Muted');
			}
		}
	}

};
