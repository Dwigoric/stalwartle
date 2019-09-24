const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { enabled: false, event: 'guildMemberAdd' });
	}

	async run(member) {
		if (member.guild.settings.get('muteRole')) await this.client.gateways.get('members').sync([`${member.guild.id}.${member.id}`]);
		if (member.settings.get('muted')) {
			const muteRole = member.guild.roles.get(member.guild.settings.get('muteRole'));
			if (!muteRole) {
				member.guild.owner.user.send('⚠  ::  Whoops! The mute role has been deleted. The muterole setting has been reset.').catch(() => null);
				member.guild.settings.reset('muteRole');
			} else if (muteRole.position >= member.guild.me.roles.highest.position) {
				member.guild.owner.user.send(`⚠  ::  The mute role **${muteRole.name}** is higher than me, so I couldn't give ${member.user.tag} the mute role.`);
			} else {
				await member.roles.add(muteRole, 'Muted');
				for (const channel of member.guild.channels.values()) {
					if (channel.type === 'text') channel.updateOverwrite(muteRole, { SEND_MESSAGES: false }, 'Muted');
					else if (channel.type === 'voice') channel.updateOverwrite(muteRole, { SPEAK: false }, 'Muted');
					else channel.updateOverwrite(muteRole, { SEND_MESSAGES: false, SPEAK: false }, 'Muted');
				}
			}
		}
	}

};
