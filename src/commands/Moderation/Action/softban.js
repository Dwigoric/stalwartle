const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			requiredPermissions: ['BAN_MEMBERS'],
			runIn: ['text'],
			description: 'Softbans (bans then automatically unbans) a mentioned user.',
			extendedHelp: 'The default age of messages to delete is `1` day.',
			usage: '<Member:user> [MessageDaysToDelete:integer{1,7}] [Reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [user, days = 1, ...reason]) {
		if (user.id === msg.author.id) throw 'Why would you ban yourself?';
		if (user.id === this.client.user.id) throw 'Have I done something wrong?';

		const member = await msg.guild.members.fetch(user).catch(() => null);
		if (member) {
			if (member.permissions.bitfield >= msg.member.permissions.bitfield) throw '<:error:508595005481549846>  ::  You cannot ban this user.';
			if (!member.bannable) throw '<:error:508595005481549846>  ::  I cannot ban this user.';
		}

		const options = { days };
		reason = reason.length ? reason.join(this.usageDelim) : null;
		if (reason) options.reason = reason;

		await msg.guild.members.ban(user, options);
		await msg.guild.members.unban(user, 'Softban released.');
		msg.channel.send(`<:check:508594899117932544>   ::  **${user.tag}** (\`${user.id}\`) has been softbanned. ${reason ? `**Reason**: ${reason}` : ''}`);
		return this.client.emit('modlogAction', msg, user, reason);
	}

};
