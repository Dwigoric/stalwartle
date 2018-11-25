const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ratelimit'],
			runIn: ['text'],
			permissionLevel: 7,
			requiredPermissions: ['MANAGE_CHANNEL'],
			description: 'Enables slowmode and sets ratelimit (1 message / x seconds) per user in the text channel.',
			usage: '[TextChannel:channel] <RateLimitSeconds:integer{1}>',
			usageDelim: ' '
		});
	}

	async run(msg, [chan = msg.channel, ratelimit]) {
		if (!chan.permissionsFor(msg.guild.me.id).has('MANAGE_CHANNEL')) throw '<:error:508595005481549846>  ::  I need **Manage Channel** permissions to set ratelimit!';
		chan.setRateLimitPerUser(ratelimit);
		return msg.send(`<:check:508594899117932544>  ::  Successfully changed the ratelimit of ${chan} to 1 message / ${ratelimit} second${ratelimit === 1 ? '' : 's'}.`);
	}

};
