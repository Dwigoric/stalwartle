const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			requiredPermissions: ['BAN_MEMBERS'],
			runIn: ['text'],
			description: 'Bans a mentioned user.',
			extendedHelp: [
				'The default amount age of messages to delete is `0` days.',
				'If you want to ban a user indefinitely, simply do not provide the duration.'
			].join('\n'),
			usage: '<Member:user> [MessageDaysToDelete:integer{1,7}] [Duration:time] [Reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [user, days = 0, duration = Infinity, ...reason], force) {
		if (!force && user.equals(msg.author)) throw 'Why would you ban yourself?';
		if (!force && user.equals(this.client.user)) throw 'Have I done something wrong?';

		const member = await msg.guild.members.fetch(user).catch(() => null);
		if (!force && member) {
			if (member.permissions.bitfield >= msg.member.permissions.bitfield) throw '<:error:508595005481549846>  ::  You cannot ban this user.';
			if (!member.bannable) throw '<:error:508595005481549846>  ::  I cannot ban this user.';
		}

		const options = { days };
		reason = reason.length ? reason.join(this.usageDelim) : null;
		if (reason) options.reason = reason;
		if (duration && duration !== Infinity) {
			this.client.schedule.create('unban', duration, {
				data: {
					user: user.id,
					guild: msg.guild.id
				}
			});
		}

		await msg.guild.members.ban(user, options);
		msg.channel.send(`<:check:508594899117932544>  ::  **${user.tag}** (\`${user.id}\`) has been banned. ${reason ? `**Reason**: ${reason}` : ''}`);
		return this.client.emit('modlogAction', msg, user, reason, duration);
	}

};
