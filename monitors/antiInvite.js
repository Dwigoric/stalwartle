const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreBots: false,
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	async run(msg) {
		if (!msg.guild) return;
		if (!msg.guild.configs.automod.antiInvite) return;
		if (msg.author.bot && msg.guild.configs.automod.ignoreBots) return;
		if (msg.guild.configs.automod.filterIgnore.includes(msg.channel.id)) return;

		const inviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/i;
		if (!inviteRegex.test(msg.content)) return;
		if (msg.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) msg.delete();
		this.client.finalizers.get('modlogging').run({
			command: this.client.commands.get('warn'),
			guild: msg.guild
		}, [msg.author, 'Sending invites with the AntiInvite enabled', null, inviteRegex.exec(msg.content)[0].split(/ +/)[0]]); // eslint-disable-line max-len
	}

	async init() {
		await this.client.commands.get('automod').init();
		const automodSchema = this.client.gateways.guilds.schema.automod;
		if (!automodSchema.antiInvite) automodSchema.add('antiInvite', { type: 'boolean', default: false, configurable: true });
	}

};
