const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			requiredPermissions: ['BAN_MEMBERS'],
			runIn: ['text'],
			description: 'Unbans a user from their ID.',
			usage: '<Member:user> [Reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [user, ...reason]) {
		const isBanned = await msg.guild.fetchBans().then(bans => bans.has(user.id));
		if (!isBanned) throw `<:redTick:399433440975519754>  ::  This user isn't banned from this server.`;

		reason = reason.length ? reason.join(this.usageDelim) : null;

		await msg.guild.members.unban(user, reason);
		msg.send(`<:greenTick:399433439280889858>  ::  **${user.tag}** (\`${user.id}\`) has been unbanned. ${reason ? `**Reason**: ${reason}` : ''}`);
		return [user, reason];
	}

};
