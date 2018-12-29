const { Event } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Event {

	async run(member) {
		// Check if the member is muted
		await this.client.gateways.members.sync();
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

		const welcome = member.guild.settings.get('welcome');
		if (!welcome.channel) return null;
		const chan = member.guild.channels.get(welcome.channel);
		if (!chan) {
			member.guild.owner.user.send(`⚠  ::  The welcome channel for ${member.guild.name} has been deleted. This setting has been reset.`).catch(() => null);
			return member.guild.settings.reset('welcome');
		}
		if (!chan.postable) return member.guild.owner.user.send(`⚠  ::  I can't post to <#${chan.id}>, the welcome channel for ${member.guild.name}.`).catch(() => null);
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
		return chan.sendFile(Buffer.from(await fetch(`https://dev.anidiots.guide/greetings/unified?${params.join('&')}`, { headers: { Authorization: this.client.auth.idioticAPIkey } })
			.then(res => res.json())
			.then(buffer => buffer.data)), 'welcome.png', `<:blueHeart:399433440035995651>  ::  Welcome, ${member}, to ${member.guild.name}!`);
	}

};
