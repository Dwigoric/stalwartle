const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ratelimit'],
			runIn: ['text'],
			permissionLevel: 7,
			requiredPermissions: ['MANAGE_CHANNEL'],
			description: 'Enables slowmode and sets ratelimit (1 message / x seconds) per user in the text channel.',
			usage: '[TextChannel:channel] <RateLimitSeconds:integer{0,120}>',
			usageDelim: ' '
		});
	}

	async run(msg, [chan = msg.channel, ratelimit]) {
		if (chan.type !== 'text') throw '<:error:508595005481549846>  ::  Only text channels can have ratelimits.';
		if (!chan.permissionsFor(this.client.user).has('MANAGE_CHANNEL')) throw '<:error:508595005481549846>  ::  I need the **Manage Channel** permission to set ratelimit!';
		chan.setRateLimitPerUser(ratelimit);
		if (!ratelimit) return msg.send(`<:check:508594899117932544>  ::  Successfully disabled slowmode in ${chan}.`);
		return msg.send(`<:check:508594899117932544>  ::  Successfully changed the ratelimit of ${chan} to 1 message / ${ratelimit} second${ratelimit === 1 ? '' : 's'}.`);
	}

};
