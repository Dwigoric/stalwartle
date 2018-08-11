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
		if (!msg.guild.settings.automod.antiSpam) return null;
		if (msg.author.bot && msg.guild.settings.automod.ignoreBots) return null;
		if (await msg.hasAtLeastPermissionLevel(6) && msg.guild.settings.automod.ignoreMods) return null;
		if (msg.guild.settings.automod.filterIgnore.antiSpam.includes(msg.channel.id)) return null;

		if (msg.member.messages.length <= 5) return null;
		if (msg.channel.postable) msg.channel.send(`Hey ${msg.author}! No spamming allowed, or I'll punish you!`);
		if (msg.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) msg.member.messages.forEach(message => message.delete().catch(() => null));

		const duration = await this.client.arguments.get('time').run('3m', '', msg);
		this.client.commands.get('mute')
			.run(msg, [msg.member, duration, 'Spamming with AntiSpam enabled'], true)
			.catch(err => msg.send(err));
		this.client.finalizers.get('modlogging').run({
			command: this.client.commands.get('mute'),
			channel: msg.channel,
			guild: msg.guild
		}, [msg.author, 'Spamming with AntiSpam enabled', duration]);
	}

	async init() {
		await this.client.commands.get('automod').init();
		const automodSchema = this.client.gateways.guilds.schema.automod;
		if (!automodSchema.antiSpam) automodSchema.add('antiSpam', { type: 'boolean', default: false, configurable: true });
	}

};
