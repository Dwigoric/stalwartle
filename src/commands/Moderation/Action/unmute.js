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
		if (!msg.guild.settings.muteRole) throw '<:error:508595005481549846>  ::  The mute role has not yet been set up for this server. You can do so by using the `s.muterole` command.';
		if (member.user.id === msg.author.id) throw 'Look... how are you able to use this command if you were already unmuted?';
		if (member.user.id === this.client.user.id) throw '*Unmutes self*. Oh, I would not have been able to respond if I were in the first place!';

		const user = await this.client.users.fetch(member.id).catch(() => null);
		if (member) {
			if (member.permissions.bitfield >= msg.member.permissions.bitfield) throw '<:error:508595005481549846>  ::  You cannot unmute this user.';
			if (member.permissions.bitfield >= msg.guild.me.permissions.bitfield) throw '<:error:508595005481549846>  ::  I cannot unmute this user.';
		}

		reason = reason.length ? reason.join(this.usageDelim) : null;
		const muteRole = msg.guild.roles.get(msg.guild.settings.muteRole);
		if (!muteRole) throw '<:error:508595005481549846>  ::  Whoops! The mute role has been deleted. Please reconfigure this server\'s mute role by using the `s.muterole` command.';
		if (!member.roles.has(muteRole.id)) throw `<:error:508595005481549846>  ::  ${user.tag} wasn't muted already!`;

		await member.roles.remove(muteRole, 'Unmuted');
		const task = this.client.schedule.tasks.filter(tk => tk.data.user === user.id)[0];
		if (task) this.client.schedule.delete(task.id);

		msg.channel.send(`<:check:508594899117932544>   ::  **${user.tag}** (\`${user.id}\`) has been unmuted. ${reason ? `**Reason**: ${reason}` : ''}`);
		return this.client.emit('modlogAction', msg, user, reason);
	}

};
