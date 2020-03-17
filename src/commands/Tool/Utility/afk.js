const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Marks you as AFK. Supplying a reason is optional.',
			extendedHelp: [
				"If someone mentions you, I will inform them that you are AFK (if you are), including how long you've been AFK.",
				'If you want me to ignore a channel for you from AFK stuff, just use `s.userconf set afkIgnore <channel>`. Note that this applies only for you.'
			],
			usage: '[Reason:string]'
		});
	}

	async run(msg, [reason = null]) {
		if (this.client.gateways.afk.get(msg.author.id) && msg.author.settings.get('afktoggle')) {
			this.client.gateways.afk.get(msg.author.id).destroy();
			return msg.send(`Welcome back, **${msg.author}**! I've removed your AFK status.`);
		}
		await this.client.providers.default.create('afk', msg.author.id, { reason, timestamp: Date.now() });
		await this.client.gateways.afk.sync(msg.author.id);
		if (msg.guild && msg.guild.me.permissions.has('MOVE_MEMBERS') && msg.member.voice.channelID && msg.guild.settings.get('afkChannelOnAfk') && msg.guild.afkChannelID) msg.member.voice.setChannel(msg.guild.afkChannelID, 'Moved to AFK channel due to AFK status'); // eslint-disable-line max-len
		return msg.send(`<:check:508594899117932544>  ::  ${msg.author}, I've set you as AFK. ${reason ? `**Reason**: ${reason}` : ''}`);
	}

};
