const { Command } = require('@sapphire/framework');

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
		reason = reason.length ? reason.join(this.usageDelim) : null;
		if (!msg.guild.settings.get('muteRole')) throw `${this.client.constants.EMOTES.xmark}  ::  The mute role has not yet been set up for this server. You can do so by using the \`${msg.guild.settings.get('prefix')}muterole\` command.`; // eslint-disable-line max-len
		if (!force && member.user.equals(msg.author)) throw 'Why would you mute yourself?';
		if (!force && member.user.equals(this.client.user)) throw 'Have I done something wrong?';

		const user = await this.client.users.fetch(member.id).catch(() => null);
		const muteRole = msg.guild.roles.cache.get(msg.guild.settings.get('muteRole'));
		if (!muteRole) throw `${this.client.constants.EMOTES.xmark}  ::  Whoops! The mute role has been deleted. Please reconfigure this server's mute role by using the \`${msg.guild.settings.get('prefix')}muterole\` command.`; // eslint-disable-line max-len
		if (muteRole.position >= msg.guild.me.roles.highest.position) throw `${this.client.constants.EMOTES.xmark}  ::  The mute role **${muteRole.name}** is higher than me, so I can't give ${user.tag} the mute role.`; // eslint-disable-line max-len
		if (member.roles.cache.has(muteRole.id)) throw `${this.client.constants.EMOTES.xmark}  ::  ${user.tag} has been already muted!`;

		for (const channel of msg.guild.channels.cache.values()) {
			if (channel.type === 'text') channel.updateOverwrite(muteRole, { SEND_MESSAGES: false }, 'Muted');
			else if (channel.type === 'voice') channel.updateOverwrite(muteRole, { SPEAK: false }, 'Muted');
			else channel.updateOverwrite(muteRole, { SEND_MESSAGES: false, SPEAK: false }, 'Muted');
		}
		await member.roles.add(muteRole, 'Muted');
		await msg.guild.settings.update('muted', member.user.id, { arrayAction: 'add' });
		if (duration && duration !== Infinity) {
			this.client.schedule.create('unmute', duration, {
				data: {
					user: user.id,
					guild: msg.guild.id,
					role: msg.guild.settings.get('muteRole')
				}
			});
		}

		msg.channel.send(`${this.client.constants.EMOTES.tick}  ::  **${user.tag}** (\`${user.id}\`) has been muted. ${reason ? `**Reason**: ${reason}` : ''}`);
		return this.client.emit('modlogAction', msg, user, reason, duration);
	}

};
