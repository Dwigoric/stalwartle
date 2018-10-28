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
		if (!force && user.id === msg.author.id) throw 'Why would you ban yourself?';
		if (!force && user.id === this.client.user.id) throw 'Have I done something wrong?';

		const member = await msg.guild.members.fetch(user).catch(() => null);
		if (!force && member) {
			if (member.permissions.bitfield >= msg.member.permissions.bitfield) throw '<:redTick:399433440975519754>  ::  You cannot ban this user.';
			if (!member.bannable) throw '<:redTick:399433440975519754>  ::  I cannot ban this user.';
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
		msg.send(`<:greenTick:399433439280889858>  ::  **${user.tag}** (\`${user.id}\`) has been banned. ${reason ? `**Reason**: ${reason}` : ''}`);
		return [user, reason, duration];
	}

};
