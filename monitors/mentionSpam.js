const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreBots: false,
			ignoreOthers: false
		});
	}

	async run(msg) {
		if (!msg.guild) return null;
		if (!msg.guild.configs.automod.mentionSpam) return null;
		if (msg.author.bot && msg.guild.configs.automod.ignoreBots) return null;
		if (await msg.hasAtLeastPermissionLevel(6) && msg.guild.configs.automod.ignoreMods) return null;
		if (msg.guild.configs.automod.filterIgnore.mentionSpam.includes(msg.channel.id)) return null;

		if (msg.member.messages
			.map(message => message.mentions.users ? message.mentions.users.size : 0 + message.mentions.bots ? message.mentions.bots.size : 0)
			.reduce((prev, val) => prev + val) < 10) return null;
		if (msg.channel.postable) msg.channel.send(`Hey ${msg.author}! Don't spam mentions, ${msg.author}. Got it, ${msg.author}?`);
		if (!msg.member.bannable) {
			return this.client.finalizers.get('modlogging').run({
				command: this.client.commands.get('warn'),
				channel: msg.channel,
				guild: msg.guild
			}, [msg.author, 'Spamming mentions with the MentionSpam enabled (member has higher permissions so I could not ban them)', null, msg.content.length > 900 ? null : msg.content]);
		} // eslint-disable-line max-len
		if (msg.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) msg.member.messages.forEach(message => message.delete().catch(() => null));
		this.client.commands.get('ban')
			.run(msg, [msg.author, null, null, 'Mention spamming with MentionSpam enabled'], true)
			.catch(err => msg.send(err));
		this.client.finalizers.get('modlogging').run({
			command: this.client.commands.get('ban'),
			channel: msg.channel,
			guild: msg.guild
		}, [msg.author, 'Mention spamming with MentionSpam enabled', Infinity]);
	}

	async init() {
		await this.client.commands.get('automod').init();
		const automodSchema = this.client.gateways.guilds.schema.automod;
		if (!automodSchema.mentionSpam) automodSchema.add('mentionSpam', { type: 'boolean', default: false, configurable: true });
	}

};
