const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreBots: false,
			ignoreOthers: false
		});
	}

	async run(msg) {
		if (!msg.guild) return;
		if (!msg.guild.configs.automod.antiSpam) return;
		if (msg.author.bot && msg.guild.configs.automod.ignoreBots) return;
		if (await msg.hasAtLeastPermissionLevel(6) && msg.guild.configs.automod.ignoreMods) return;
		if (msg.guild.configs.automod.filterIgnore.includes(msg.channel.id)) return;

		if (msg.member.messages.length <= 5) return;
		if (msg.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) msg.member.messages.forEach(message => message.delete().catch(() => null));
		this.client.commands.get('mute').run(msg, [msg.member, await this.client.arguments.get('time').run('3m', '', msg), 'Spamming with AntiSpam enabled'], true);
	}

	async init() {
		await this.client.commands.get('automod').init();
		const automodSchema = this.client.gateways.guilds.schema.automod;
		if (!automodSchema.antiSpam) automodSchema.add('antiSpam', { type: 'boolean', default: false, configurable: true });
	}

};
