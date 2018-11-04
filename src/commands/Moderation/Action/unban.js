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
		if (!await msg.guild.fetchBans().then(bans => bans.has(user.id))) throw `<:error:508595005481549846>  ::  This user isn't banned from this server.`;

		reason = reason.length ? reason.join(this.usageDelim) : null;

		await msg.guild.members.unban(user, reason);
		msg.channel.send(`<:check:508594899117932544>   ::  **${user.tag}** (\`${user.id}\`) has been unbanned. ${reason ? `**Reason**: ${reason}` : ''}`);
		return this.client.emit('modlogAction', msg, user, reason);
	}

};
