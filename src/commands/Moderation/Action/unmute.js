const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			requiredPermissions: ['MANAGE_ROLES'],
			runIn: ['text'],
			description: 'Unmutes a mentioned user.',
			usage: '<Member:member> [Reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [member, ...reason]) {
		reason = reason.length ? reason.join(this.usageDelim) : null;
		if (!msg.guild.settings.get('muteRole')) throw `<:error:508595005481549846>  ::  The mute role has not yet been set up for this server. You can do so by using the \`${msg.guild.settings.get('prefix')}muterole\` command.`; // eslint-disable-line max-len
		if (member.user.equals(msg.author)) throw 'Look... how are you able to use this command if you were already unmuted?';
		if (member.user.equals(this.client.user)) throw '*Unmutes self*. Oh, I would not have been able to respond if I were in the first place!';

		const user = await this.client.users.fetch(member.id).catch(() => null);
		const muteRole = msg.guild.roles.get(msg.guild.settings.get('muteRole'));
		if (!muteRole) throw `<:error:508595005481549846>  ::  Whoops! The mute role has been deleted. Please reconfigure this server's mute role by using the \`${msg.guild.settings.get('prefix')}muterole\` command.`; // eslint-disable-line max-len
		if (muteRole.position >= msg.guild.me.roles.highest.position) throw `<:error:508595005481549846>  ::  The mute role **${muteRole.name}** is higher than me, so I can't take from ${user.tag} the mute role.`; // eslint-disable-line max-len
		if (!member.roles.has(muteRole.id)) throw `<:error:508595005481549846>  ::  ${user.tag} wasn't muted already!`;

		await member.roles.remove(muteRole, 'Unmuted');
		const task = this.client.schedule.tasks.filter(tk => tk.data.user === user.id)[0];
		if (task) this.client.schedule.delete(task.id);

		msg.channel.send(`<:check:508594899117932544>  ::  **${user.tag}** (\`${user.id}\`) has been unmuted. ${reason ? `**Reason**: ${reason}` : ''}`);
		return this.client.emit('modlogAction', msg, user, reason);
	}

};
