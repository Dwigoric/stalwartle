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
		if (await this.client.providers.default.has('afk', msg.author.id) && msg.author.settings.afktoggle) {
			await this.client.providers.default.delete('afk', msg.author.id);
			return msg.send(`Welcome back, **${msg.author}**! I've removed your AFK status.`);
		}
		await this.client.providers.default.create('afk', msg.author.id, { reason, timestamp: Date.now() });
		return msg.send(`<:check:508594899117932544>   ::  ${msg.author}, I've set you as AFK. ${reason ? `**Reason**: ${reason}` : ''}`);
	}

	async init() {
		const defProvider = this.client.providers.default;
		if (!await defProvider.hasTable('afk')) defProvider.createTable('afk');
	}

};
