const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			requiredPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS'],
			runIn: ['text'],
			description: 'Mutes a mentioned user.',
			extendedHelp: 'To mute a user indefinitely, simply do not provide the duration.',
			usage: '<Member:member> [MuteDuration:time] [Reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [member, duration = Infinity, ...reason], force) {
		if (!msg.guild.settings.muteRole) throw '<:redTick:399433440975519754>  ::  The mute role has not yet been set up for this server. You can do so by using the `s.muterole` command.';
		if (!force && member.user.id === msg.author.id) throw 'Why would you mute yourself?';
		if (!force && member.user.id === this.client.user.id) throw 'Have I done something wrong?';

		const user = await this.client.users.fetch(member.id).catch(() => null);
		if (member && !force) {
			if (member.permissions.bitfield >= msg.member.permissions.bitfield) throw '<:redTick:399433440975519754>  ::  You cannot mute this user.';
			if (member.permissions.bitfield >= msg.guild.me.permissions.bitfield) throw '<:redTick:399433440975519754>  ::  I cannot mute this user.';
		}

		reason = reason.length ? reason.join(this.usageDelim) : null;
		const muteRole = msg.guild.roles.get(msg.guild.settings.muteRole);
		if (!muteRole) throw '<:redTick:399433440975519754>  ::  Whoops! The mute role has been deleted. Please reconfigure this server\'s mute role by using the `s.muterole` command.';
		if (muteRole.position >= msg.guild.me.roles.highest.position) throw `<:redTick:399433440975519754>  ::  The mute role **${muteRole.name}** is higher than me, so I can't give ${user.tag} the mute role.`; // eslint-disable-line max-len
		if (member.roles.has(muteRole.id)) throw `<:redTick:399433440975519754>  ::  ${user.tag} has been already muted!`;

		for (const channel of msg.guild.channels.values()) {
			if (channel.type === 'text') channel.updateOverwrite(muteRole, { SEND_MESSAGES: false }, 'Muted');
			else if (channel.type === 'voice') channel.updateOverwrite(muteRole, { SPEAK: false }, 'Muted');
			else channel.updateOverwrite(muteRole, { SEND_MESSAGES: false, SPEAK: false }, 'Muted');
		}
		await member.roles.add(muteRole, 'Muted');
		if (duration && duration !== Infinity) {
			this.client.schedule.create('unmute', duration, {
				data: {
					user: user.id,
					guild: msg.guild.id,
					role: msg.guild.settings.muteRole
				}
			});
		}

		msg.channel.send(`<:greenTick:399433439280889858>  ::  **${user.tag}** (\`${user.id}\`) has been muted. ${reason ? `**Reason**: ${reason}` : ''}`);
		return [user, reason, duration];
	}

};
